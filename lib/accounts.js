import crypto from "crypto";
import { kv } from "@vercel/kv";

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function accountKey(id) {
  return `account:${id}`;
}

function emailKey(email) {
  return `account:email:${encodeURIComponent(email)}`;
}

function balanceKey(accountId) {
  return `wallet:balance:${accountId}`;
}

function sessionKey(token) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return `account:session:${tokenHash}`;
}

function runScrypt(password, salt, length) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, length, SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = await runScrypt(password, salt, 64);
  return `scrypt$${SCRYPT_OPTIONS.N}$${SCRYPT_OPTIONS.r}$${SCRYPT_OPTIONS.p}$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

async function verifyPassword(password, encoded) {
  const [algorithm, cost, blockSize, parallelization, saltText, hashText] = String(encoded || "").split("$");
  if (algorithm !== "scrypt" || !saltText || !hashText ||
      Number(cost) !== SCRYPT_OPTIONS.N ||
      Number(blockSize) !== SCRYPT_OPTIONS.r ||
      Number(parallelization) !== SCRYPT_OPTIONS.p) {
    return false;
  }

  const salt = Buffer.from(saltText, "base64url");
  const expected = Buffer.from(hashText, "base64url");
  if (salt.length !== 16 || expected.length !== 64) return false;
  const actual = await runScrypt(password, salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function toPublicAccount(account) {
  if (!account) return null;
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt
  };
}

export async function getAccount(id) {
  if (!id) return null;
  return (await kv.get(accountKey(id))) || null;
}

export async function getAccountByEmail(email) {
  const id = await kv.get(emailKey(normalizeEmail(email)));
  if (!id) return null;
  return getAccount(id);
}

export async function createAccount({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const id = crypto.randomUUID();
  const indexKey = emailKey(normalizedEmail);
  const claimed = await kv.set(indexKey, id, { nx: true });
  if (!claimed) return null;

  try {
    const account = {
      id,
      name: String(name || "").trim().slice(0, 100) || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString()
    };
    await kv.set(accountKey(id), account);
    await kv.set(balanceKey(id), 0);
    return account;
  } catch (error) {
    const storedId = await kv.get(indexKey);
    if (storedId === id) {
      await kv.del(indexKey);
      await kv.del(accountKey(id));
      await kv.del(balanceKey(id));
    }
    throw error;
  }
}

export async function authenticateAccount(email, password) {
  const account = await getAccountByEmail(email);
  if (!account) {
    await runScrypt(password, Buffer.alloc(16), 64);
    return null;
  }
  return await verifyPassword(password, account.passwordHash) ? account : null;
}

export async function updateAccountPassword(accountId, password) {
  if (typeof password !== "string" || password.length < 6 || password.length > 1024) {
    throw new Error("Password must be between 6 and 1024 characters");
  }
  const account = await getAccount(accountId);
  if (!account) return null;
  account.passwordHash = await hashPassword(password);
  await kv.set(accountKey(accountId), account);
  return account;
}

export async function createSession(accountId) {
  const token = crypto.randomBytes(32).toString("base64url");
  await kv.set(sessionKey(token), accountId, { ex: SESSION_TTL_SECONDS });
  return token;
}

export async function getAccountFromRequest(req) {
  const authorization = req.headers?.authorization || req.headers?.Authorization || "";
  const match = /^Bearer ([A-Za-z0-9_-]{40,})$/.exec(String(authorization));
  if (!match) return null;

  const accountId = await kv.get(sessionKey(match[1]));
  if (!accountId) return null;
  return getAccount(accountId);
}

export async function getWalletBalanceCents(accountId) {
  const balance = await kv.get(balanceKey(accountId));
  return Number(balance || 0);
}
