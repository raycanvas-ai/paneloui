/** First letter of every word, upper-cased; "?" when there is nothing to show. */
export function getInitials(name: string): string {
  if (!name) return "?";
  const letters = name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("");
  return letters.toUpperCase() || "?";
}

interface CurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  /** Shorthand for whole units: overrides both fraction-digit options with 0. */
  noDecimals?: boolean;
}

export function formatCurrency(
  amount: number,
  { currency = "USD", locale = "en-US", noDecimals = false, ...digits }: CurrencyOptions = {},
) {
  const fraction = noDecimals ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : digits;
  return new Intl.NumberFormat(locale, { style: "currency", currency, ...fraction }).format(amount);
}
