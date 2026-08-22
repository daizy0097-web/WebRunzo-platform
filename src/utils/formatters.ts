/**
 * Currency & Formatting Utilities for WebRunzo
 */

export function formatCurrency(
  amount: number | string | undefined | null,
  symbol: string = '₹',
  locale?: string
): string {
  if (amount === undefined || amount === null || amount === '') return `${symbol}0`;
  const num = Number(amount);
  if (isNaN(num)) return `${symbol}0`;
  const chosenLocale = locale || (symbol === '₹' ? 'en-IN' : 'en-US');
  return `${symbol}${num.toLocaleString(chosenLocale)}`;
}

export function formatINR(amount: number | string | undefined | null, symbol: string = '₹'): string {
  return formatCurrency(amount, symbol);
}

export function formatINRLac(amount: number | string | undefined | null, symbol: string = '₹'): string {
  return formatCurrency(amount, symbol);
}

