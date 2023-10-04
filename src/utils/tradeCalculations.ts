// tradeCalculations.ts
// Helper to truncate to two decimals
const truncateToTwoDecimals = (num: number) => parseFloat(num.toFixed(2));
/**
 * Calculate the PIP difference between two numbers.
 *
 * @param num1 - First number
 * @param num2 - Second number
 * @returns The PIP difference
 */
export const calculatePipDifference = (num1: number, num2: number) => {
  const difference = Math.abs(num1 - num2);
  // Determine if it's likely a JPY pair based on the size of the numbers
  const isJPY = Math.max(num1, num2) > 100;
  // For JPY pairs, the pip is the second decimal place.
  // For most other pairs, the pip is the fourth decimal place.
  let pipDifference = isJPY ? difference * 100 : difference * 10000;
  // Round to nearest 0.5
  pipDifference = Math.round(pipDifference * 2) / 2;

  return pipDifference;
};

/**
 * Calculate the trade size based on risk percentage, account equity, and conversion rates.
 * Formula: Size = (Equity * Risk%) / Stop Loss
 *
 * @param equity - Current account equity
 * @param riskPercent - Risk percentage per trade
 * @param stopLoss - Stop loss value for the trade
 * @param ticker - Ticker of the asset being traded
 * @param conversionRates - Conversion rates for currencies
 * @returns The size of the trade
 */
export const calculateSize = (
  equity: number,
  riskPercent: number,
  entry: number,
  stopLoss: number,
  ticker: string,
  conversionRates: Record<string, number>,
) => {
  const isJPY = ticker.slice(-3) === "JPY"; // Check if it's a JPY pair
  const pipFactor = isJPY ? 100 : 10000; // Pip factor to calculate pip risk
  const pipRisk = Math.abs(entry - stopLoss) * pipFactor;

  // Determine Pip Value
  let pipValue = 1 / pipFactor;
  if (ticker.slice(-3) !== "USD") {
    const quoteCurrency = ticker.slice(-3);
    const conversionRate = conversionRates[quoteCurrency] || 1;
    pipValue /= conversionRate;
  }

  // Calculate Position Size
  const positionSize = (equity * (riskPercent / 100)) / (pipRisk * pipValue);
  return Math.round(positionSize);
};
// ^ Same params but calculated risk when given size
export const calculateRiskPercent = (
  entry: number,
  stopLoss: number,
  size: number,
  equity: number,
  ticker: string,
  conversionRates: Record<string, number>,
) => {
  const absDifference = Math.abs(stopLoss - entry);
  const lotSize = size;
  let calculatedRisk = 0;

  if (ticker.endsWith("USD")) {
    calculatedRisk = (absDifference * lotSize) / equity;
  } else {
    const quoteCurrency = ticker.slice(-3);
    const exchangeRate = conversionRates[quoteCurrency] || 1;
    calculatedRisk = (absDifference * lotSize) / (exchangeRate * equity);
  }

  return truncateToTwoDecimals(calculatedRisk * 100); // Multiply by 100 to get percentage
};

export const calculateEstimatedGain = (
  entry: number,
  target: number,
  size: number,
  equity: number,
  ticker: string,
  conversionRates: Record<string, number>,
) => {
  const absDifferenceGain = Math.abs(target - entry);
  const lotSize = size;
  let calculatedGain = 0;

  if (ticker.endsWith("USD")) {
    calculatedGain = (absDifferenceGain * lotSize) / equity;
  } else {
    const quoteCurrency = ticker.slice(-3);
    const exchangeRate = conversionRates[quoteCurrency] || 1;
    calculatedGain = (absDifferenceGain * lotSize) / (exchangeRate * equity);
  }

  return truncateToTwoDecimals(calculatedGain * 100); // Multiply by 100 to get percentage
};

export const calculateEstimatedRR = (
  riskPercent: number,
  estimatedGain: number,
) => {
  return truncateToTwoDecimals(estimatedGain / riskPercent);
};
