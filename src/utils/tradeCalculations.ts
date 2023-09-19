// tradeCalculations.ts

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

  return calculatedRisk * 100; // Multiply by 100 to get percentage
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

  return calculatedGain * 100; // Multiply by 100 to get percentage
};

export const calculateEstimatedRR = (
  riskPercent: number,
  estimatedGain: number,
) => {
  return estimatedGain / riskPercent;
};
