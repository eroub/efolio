// formatters.ts
export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "";
  }
  const v = Number(value);
  const s = Math.abs(v).toFixed(2);
  if (v < 0) {
    return `-$${s}`;
  }
  return `$${s}`;
};

export const formatPercentage = (value: number | null) => {
  return value !== null ? `${value}%` : "";
};

export const formatSizeInK = (size: number | null) => {
  if (size === null) return null;
  return `${(size / 1000).toFixed(1)}K`;
};
