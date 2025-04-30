export const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export function extractFeatureValue(feature: string): string | number {
  const match = feature.match(/^(.+?)\s*:\s*(.+)$/);
  if (!match) {
    throw new Error(`Invalid feature format: ${feature}. Expected "feature: value"`);
  }

  const [, , value] = match;
  const trimmedValue = value.trim();

  const numericMatch = trimmedValue.match(/^(\d*\.?\d+)(%?)$/);
  if (numericMatch) {
    const [, num, unit] = numericMatch;
    return unit === '%' ? parseFloat(num) : parseInt(num, 10);
  }

  return trimmedValue;
}