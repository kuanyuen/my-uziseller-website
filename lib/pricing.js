export function getPriceIncreaseFactor() {
  const percent = Number(process.env.PRICE_INCREASE_PERCENT ?? 50);
  if (!Number.isFinite(percent) || percent < 0) {
    throw new Error("PRICE_INCREASE_PERCENT must be a non-negative number");
  }
  return 1 + percent / 100;
}
