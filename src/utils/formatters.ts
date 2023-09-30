// formatters.ts
export const formatCurrency = (value: number | null) => {
  if (value === null) {
    return "";
  }
  if (value < 0) {
    return `-$${Math.abs(value)}`;
  }
  return `$${value}`;
};

export const formatPercentage = (value: number | null) => {
  return value !== null ? `${value}%` : "";
};

export const formatSizeInK = (size: number | null) => {
  if (size === null) return null;
  return `${(size / 1000).toFixed(1)}K`;
};
