// tradeCalculations.ts
// Helper to truncate to two decimals
const truncateToTwoDecimals = (num: number) => parseFloat(num.toFixed(2));

/**
 * Calculate the PIP difference between entry and exit prices.
 * Accounts for different types of currency pairs.
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
 * Uses different pip factors for JPY and non-JPY pairs.
 * Formula: Size = (Equity * Risk%) / Stop Loss
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

/**
 * Calculate the risk percentage when given trade size.
 * Formula: Risk = (Absolute Difference between Stop Loss and Entry * Lot Size) / (Exchange Rate * Equity)
 */
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

/**
 * Calculate the estimated gain for a given trade.
 * Formula: Gain = (Absolute Difference between Target and Entry * Lot Size) / (Exchange Rate * Equity)
 */
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

/**
 * Calculate the estimated Risk-to-Reward ratio.
 * Formula: Estimated R:R = Estimated Gain / Risk Percentage
 */
export const calculateEstimatedRR = (
  riskPercent: number,
  estimatedGain: number,
) => {
  return truncateToTwoDecimals(estimatedGain / riskPercent);
};

/**
 * Calculate total hours between two datetime strings.
 * Formula: ROUND((Datetime Out - Datetime In) * 24, 3)
 */
export const calculateTotalHours = (
  datetimeIn: string,
  datetimeOut: string,
): number => {
  // Extract date and time components
  const [dateInStr, timeInStr] = datetimeIn.split("T");
  const [yearIn, monthIn, dayIn] = dateInStr.split("-").map(Number);
  const [hourIn, minuteIn, secondIn] = timeInStr
    .split(":")
    .map((str) => Number(str.split(".")[0]));

  const [dateOutStr, timeOutStr] = datetimeOut.split("T");
  const [yearOut, monthOut, dayOut] = dateOutStr.split("-").map(Number);
  const [hourOut, minuteOut] = timeOutStr.split(":").map(Number);

  // Create Date objects using Date.UTC
  const dateInUTC = new Date(
    Date.UTC(yearIn, monthIn - 1, dayIn, hourIn, minuteIn, secondIn),
  );
  const dateOutUTC = new Date(
    Date.UTC(yearOut, monthOut - 1, dayOut, hourOut, minuteOut),
  );

  // Calculate the difference in hours
  const diff = (dateOutUTC.getTime() - dateInUTC.getTime()) / (1000 * 60 * 60);

  return truncateToTwoDecimals(diff);
};

/**
 * Calculate Commission
 * Formula: Real P/L - Projected P/L
 */
export const calculateCommission = (
  realPL: number,
  projectedPL: number,
): number => {
  const commission = truncateToTwoDecimals(realPL - projectedPL);
  // Commission/slippage can never be positive, so just set it to 0
  return commission > 0 ? 0 : commission;
};

/**
 * Calculate Percent Change
 * Formula: ((Real P/L + Equity) / Equity) - 1
 */
export const calculatePercentChange = (
  realPL: number,
  equity: number,
): number => {
  if (typeof realPL !== "number" || typeof equity !== "number") {
    return NaN;
  }
  return truncateToTwoDecimals(((realPL + equity) / equity - 1) * 100);
};

/**
 * Calculate Realized R:R
 * Formula: Real P/L / (Equity * Risk), if Risk is not 0
 */
export const calculateRealRR = (
  realPL: number,
  equity: number,
  risk: number,
): number => {
  if (risk === 0) return 0;
  return truncateToTwoDecimals(realPL / (equity * (risk / 100)));
};

/**
 * Calculate Pips (gain/loss)
 */
export const calculatePips = (
  direction: string,
  ticker: string,
  entry: number,
  exit: number,
): number => {
  const factor = ticker.split("/")[1] === "JPY" ? 100 : 10000;
  return direction === "Short"
    ? truncateToTwoDecimals((entry - exit) * factor)
    : truncateToTwoDecimals((exit - entry) * factor);
};

/**
 * Calculate MFE Ratio
 * Formula: ABS(MFE - Entry) / ABS(Entry - Stop Loss)
 */
export const calculateMFERatio = (
  mfe: number,
  entry: number,
  stopLoss: number,
): number => {
  return truncateToTwoDecimals(
    Math.abs(mfe - entry) / Math.abs(entry - stopLoss),
  );
};

/**
 * Calculate MAE Ratio
 * Formula: ABS(MAE - Entry) / ABS(Entry - Stop Loss)
 */
export const calculateMAERatio = (
  mae: number,
  entry: number,
  stopLoss: number,
): number => {
  return truncateToTwoDecimals(
    Math.abs(mae - entry) / Math.abs(entry - stopLoss),
  );
};

/**
 * Calculate Projected Profit/Loss in USD
 */
export const calculateProjectedPL = (
  direction: string,
  entry: number,
  exit: number,
  size: number,
  ticker: string,
  conversionRates: Record<string, number>,
): number => {
  let projectedPL = 0;

  if (direction === "Short") {
    projectedPL = (entry - exit) * size;
  } else {
    projectedPL = (exit - entry) * size;
  }
  if (!ticker.endsWith("USD")) {
    const quoteCurrency = ticker.slice(-3);
    const exchangeRate = conversionRates[quoteCurrency] || 1;
    projectedPL = projectedPL / exchangeRate;
  }

  return truncateToTwoDecimals(projectedPL);
};

/**
 * Calculate Realized P/L based on pre/post equity
 * Formula: equityPostTrade - equityPreTrade;
 */
export const calculateRealizedPL = (
  equityPostTrade: number,
  equityPreTrade: number,
): number => {
  // Calculate realized P/L
  return truncateToTwoDecimals(equityPostTrade - equityPreTrade);
};
