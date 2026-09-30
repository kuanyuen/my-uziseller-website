import { kv } from "@vercel/kv";

function rechargeKey(id) {
  return `wallet:recharge:${id}`;
}

function billKey(billId) {
  return `wallet:bill:${billId}`;
}

function balanceKey(accountId) {
  return `wallet:balance:${accountId}`;
}

function transactionIndexKey(accountId) {
  return `wallet:transactions:${accountId}`;
}

const CREDIT_RECHARGE_SCRIPT = `
local raw = redis.call("GET", KEYS[1])
if not raw then
  return redis.error_reply("Wallet recharge does not exist")
end
local transaction = cjson.decode(raw)
if transaction.accountId ~= ARGV[1] or tonumber(transaction.amountCents) ~= tonumber(ARGV[2]) then
  return redis.error_reply("Wallet recharge details do not match")
end
if transaction.status == "paid" then
  return 0
end
if transaction.status ~= "creating" and transaction.status ~= "pending_payment" then
  return 0
end
if redis.call("EXISTS", KEYS[2]) == 0 then
  return redis.error_reply("Wallet account balance does not exist")
end
redis.call("INCRBY", KEYS[2], ARGV[2])
transaction.status = "paid"
transaction.paidAt = ARGV[3]
transaction.billId = ARGV[4]
redis.call("SET", KEYS[1], cjson.encode(transaction))
redis.call("SET", KEYS[3], transaction.id)
return 1
`;

const FAIL_RECHARGE_SCRIPT = `
local raw = redis.call("GET", KEYS[1])
if not raw then
  return redis.error_reply("Wallet recharge does not exist")
end
local transaction = cjson.decode(raw)
if transaction.status ~= "creating" and transaction.status ~= "pending_payment" then
  return 0
end
transaction.status = "payment_failed"
transaction.updatedAt = ARGV[1]
redis.call("SET", KEYS[1], cjson.encode(transaction))
return 1
`;

const SAVE_BILL_SCRIPT = `
local raw = redis.call("GET", KEYS[1])
if not raw then
  return redis.error_reply("Wallet recharge does not exist")
end
local transaction = cjson.decode(raw)
transaction.billId = ARGV[1]
transaction.billUrl = ARGV[2]
if transaction.status == "creating" then
  transaction.status = "pending_payment"
end
redis.call("SET", KEYS[1], cjson.encode(transaction))
redis.call("SET", KEYS[2], transaction.id)
return 1
`;

export async function createRecharge({ id, accountId, amountCents }) {
  const transaction = {
    id,
    accountId,
    amountCents,
    currency: "MYR",
    status: "creating",
    createdAt: new Date().toISOString()
  };
  await kv.set(rechargeKey(id), transaction);
  await kv.lpush(transactionIndexKey(accountId), id);
  await kv.ltrim(transactionIndexKey(accountId), 0, 99);
  return transaction;
}

export async function getRecharge(id) {
  if (!id) return null;
  return (await kv.get(rechargeKey(id))) || null;
}

export async function getRechargeByBillId(billId) {
  if (!billId) return null;
  const id = await kv.get(billKey(billId));
  if (!id) return null;
  return getRecharge(id);
}

export async function saveRechargeBill(id, bill) {
  await kv.eval(
    SAVE_BILL_SCRIPT,
    [rechargeKey(id), billKey(bill.id)],
    [String(bill.id), String(bill.url)]
  );
}

export async function creditRecharge(id, billId) {
  const transaction = await getRecharge(id);
  if (!transaction) return false;

  const result = await kv.eval(
    CREDIT_RECHARGE_SCRIPT,
    [rechargeKey(id), balanceKey(transaction.accountId), billKey(billId)],
    [
      transaction.accountId,
      String(transaction.amountCents),
      new Date().toISOString(),
      String(billId)
    ]
  );
  return Number(result) === 1;
}

export async function failRecharge(id) {
  return Number(await kv.eval(
    FAIL_RECHARGE_SCRIPT,
    [rechargeKey(id)],
    [new Date().toISOString()]
  )) === 1;
}

export async function listRechargeTransactions(accountId, limit = 20) {
  const ids = await kv.lrange(transactionIndexKey(accountId), 0, limit - 1);
  if (!ids?.length) return [];
  const transactions = await Promise.all(ids.map((id) => getRecharge(id)));
  return transactions.filter(Boolean).map(({ id, amountCents, currency, status, createdAt, paidAt }) => ({
    id,
    amountCents,
    amountMYR: amountCents / 100,
    currency,
    status,
    createdAt,
    paidAt: paidAt || null
  }));
}
