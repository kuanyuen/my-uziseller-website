import crypto from "crypto";
import { kv } from "@vercel/kv";
import { getAccountByEmail, normalizeEmail, updateAccountPassword } from "./accounts.js";

const CODE_TTL_SECONDS = 10 * 60;
const RATE_LIMIT_SECONDS = 60;
const MAX_CODE_ATTEMPTS = 5;

function emailKey(email) {
  return crypto.createHash("sha256").update(email).digest("hex");
}

function codeKey(email) {
  return `account:password-reset:code:${emailKey(email)}`;
}

function digestKey() {
  const secret = process.env.ACCOUNT_RESET_CODE_SECRET ||
    process.env.KV_REST_API_TOKEN ||
    process.env.BILLPLZ_X_SIGNATURE_KEY;
  if (!secret) throw new Error("Password recovery signing secret is not configured");
  return secret;
}

function codeDigest(email, code) {
  return crypto.createHmac("sha256", digestKey()).update(`${email}:${code}`).digest();
}

function rateLimitError() {
  const error = new Error("Please wait before requesting another code.");
  error.statusCode = 429;
  return error;
}

function configurationError() {
  const error = new Error("Password recovery email is not configured.");
  error.statusCode = 503;
  return error;
}

function invalidCodeError() {
  const error = new Error("Invalid or expired verification code.");
  error.statusCode = 400;
  return error;
}

async function sendEmail(email, code) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw configurationError();

  const domain = process.env.RESEND_EMAIL_DOMAIN || "uziseller.com";
  const from = process.env.RESEND_FROM || `Uziseller <noreply@${domain}>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Uziseller password reset code",
      text: `Your Uziseller password reset code is ${code}.\nIt expires in 10 minutes. If you did not request this, you can ignore this email.\n\nUziseller 密码重置验证码：${code}\n验证码 10 分钟内有效。如非本人操作，请忽略此邮件。`
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    const error = new Error("Unable to send the password reset email. Please try again later.");
    error.statusCode = 502;
    throw error;
  }
}

export async function sendPasswordResetCode(rawEmail, requestIp) {
  const email = normalizeEmail(rawEmail);
  const key = emailKey(email);
  const emailRateKey = `account:password-reset:rate:email:${key}`;
  const emailRateClaimed = await kv.set(emailRateKey, "1", { nx: true, ex: RATE_LIMIT_SECONDS });
  if (!emailRateClaimed) throw rateLimitError();

  let ipRateKey;
  if (requestIp) {
    const ipHash = crypto.createHmac("sha256", digestKey()).update(requestIp).digest("hex");
    ipRateKey = `account:password-reset:rate:ip:${ipHash}`;
    const ipRateClaimed = await kv.set(ipRateKey, "1", { nx: true, ex: RATE_LIMIT_SECONDS });
    if (!ipRateClaimed) {
      await kv.del(emailRateKey);
      throw rateLimitError();
    }
  }

  const account = await getAccountByEmail(email);
  if (!account) return;

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const challengeKey = codeKey(email);
  await kv.set(challengeKey, {
    digest: codeDigest(email, code).toString("hex"),
    attempts: 0
  }, { ex: CODE_TTL_SECONDS });

  try {
    await sendEmail(email, code);
  } catch (error) {
    await kv.del(challengeKey);
    throw error;
  }
}

export async function resetAccountPassword(rawEmail, rawCode, password) {
  const email = normalizeEmail(rawEmail);
  const challengeStorageKey = codeKey(email);
  const attemptsKey = `${challengeStorageKey}:attempts`;
  const challenge = await kv.get(challengeStorageKey);
  if (!challenge || !/^\d{6}$/.test(String(rawCode || ""))) {
    throw invalidCodeError();
  }

  const expected = Buffer.from(challenge.digest || "", "hex");
  const actual = codeDigest(email, String(rawCode).trim());
  const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  if (!matches) {
    const attempts = await kv.incr(attemptsKey);
    if (attempts === 1) await kv.expire(attemptsKey, CODE_TTL_SECONDS);
    if (attempts >= MAX_CODE_ATTEMPTS) {
      await Promise.all([kv.del(challengeStorageKey), kv.del(attemptsKey)]);
    }
    throw invalidCodeError();
  }

  const lockKey = `${challengeStorageKey}:consume`;
  const lockClaimed = await kv.set(lockKey, "1", { nx: true, ex: RATE_LIMIT_SECONDS });
  if (!lockClaimed) throw invalidCodeError();

  const currentChallenge = await kv.get(challengeStorageKey);
  if (!currentChallenge || currentChallenge.digest !== challenge.digest) {
    throw invalidCodeError();
  }

  const account = await getAccountByEmail(email);
  if (!account) throw invalidCodeError();

  const updatedAccount = await updateAccountPassword(account.id, password);
  await Promise.all([kv.del(challengeStorageKey), kv.del(attemptsKey), kv.del(`${challengeStorageKey}:consume`)]);
  return updatedAccount;
}
