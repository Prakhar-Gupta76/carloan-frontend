export function formatCurrency(value, options = {}) {
  const { fallback = '-', maximumFractionDigits = 0 } = options;
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return new Intl.NumberFormat('en-IN', {
    currency: 'INR',
    maximumFractionDigits,
    style: 'currency',
  }).format(numericValue);
}
