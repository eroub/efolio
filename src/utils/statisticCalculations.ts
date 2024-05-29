// statisticCalculations.ts
import { nelderMead } from 'fmin';
import { Trade } from "../models/TradeTypes";

// Helper for validating that no number are NaN or undefined
const validateNumber = (value: number, defaultValue: number = 0): number => {
  return isNaN(value) ? defaultValue : value;
};
// Helper function to calculate the sum of an array of numbers
const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);
// Helper to truncate to two decimals
const truncateToTwoDecimals = (num: number) =>
  validateNumber(parseFloat(num.toFixed(2)));
// Helper function to calculate the standard deviation of an array of numbers
const standardDeviation = (arr: number[]) => {
  const avg = sum(arr) / arr.length;
  const variance = sum(arr.map((x) => Math.pow(x - avg, 2))) / arr.length;
  return Math.sqrt(variance);
};
// Helper for calculating averages
export const average = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
};

/**
 * Helper for calculating the Median of an array of numbers.
 * Formula: Middle value of sorted array; average of two middle numbers if even length
 */
const calculateMedian = (arr: number[]) => {
  const sortedArr = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sortedArr.length / 2);

  if (sortedArr.length % 2 === 0) {
    return truncateToTwoDecimals((sortedArr[mid - 1] + sortedArr[mid]) / 2);
  } else {
    return truncateToTwoDecimals(sortedArr[mid]);
  }
};

/**
 * Calculate the total gain or loss in both Dollar, R:R, and % terms.
 * Formula: Summation of all real P/L
 */
export const calculateTotalGainLoss = (trades: Trade[]) => {
  // Find the trade with ID 1 to get the starting equity
  const startingTrade = trades.find((trade) => trade.id === 1);
  const startingEquity = startingTrade ? startingTrade.equity ?? 0 : 0; // Assuming 'equity' is the field in your Trade type

  const realPL = trades.map((trade) => trade.realPL ?? 0);
  const realRR = trades.map((trade) => trade.realRR ?? 0);

  const totalGainLossDollar = truncateToTwoDecimals(sum(realPL));
  const totalGainLossRR = truncateToTwoDecimals(sum(realRR));

  // Calculate the percentage gain/loss based on the starting equity
  const percentageGainLossDollar =
    startingEquity !== 0 ? (totalGainLossDollar / startingEquity) * 100 : 0; // Avoid division by zero

  return {
    totalGainLossDollar,
    totalGainLossRR,
    percentageGainLossDollar: truncateToTwoDecimals(percentageGainLossDollar),
  };
};

/**
 * Calculate the average profitability per trade in both Dollar and R:R terms.
 * Formula: (Total Gain or Loss) / (Total Number of Trades)
 */
export const calculateAverageProfitability = (trades: Trade[]) => {
  const totalProfitabilityDollar = trades.reduce((acc, trade) => acc + (trade.realPL ?? 0), 0);
  const totalProfitabilityRR = trades.reduce((acc, trade) => acc + (trade.realRR ?? 0), 0);
  const averageProfitabilityDollar = truncateToTwoDecimals(totalProfitabilityDollar / trades.length);
  const averageProfitabilityRR = truncateToTwoDecimals(totalProfitabilityRR / trades.length);

  return { averageProfitabilityDollar, averageProfitabilityRR };
};

/**
 * Calculate the standard deviation of trade Profit/Loss in both Dollar and R:R terms.
 * Formula: sqrt((Summation(X - Mean)^2) / N)
 */
export const calculatePLStandardDeviation = (trades: Trade[]) => {
  const { averageProfitabilityDollar, averageProfitabilityRR } = calculateAverageProfitability(trades);

  const varianceDollar = trades.reduce((acc, trade) => {
    const diff = (trade.realPL ?? 0) - averageProfitabilityDollar;
    return acc + diff * diff;
  }, 0) / trades.length;

  const varianceRR = trades.reduce((acc, trade) => {
    const diff = (trade.realRR ?? 0) - averageProfitabilityRR;
    return acc + diff * diff;
  }, 0) / trades.length;

  const standardDeviationDollar = truncateToTwoDecimals(Math.sqrt(varianceDollar));
  const standardDeviationRR = truncateToTwoDecimals(Math.sqrt(varianceRR));

  return { standardDeviationDollar, standardDeviationRR };
};

/**
 * Count the number of winning and losing trades.
 * Formula: Count each trade where real P/L is > 0 as win, < 0 as loss
 */
export const calculateWinsLosses = (trades: Trade[]) => {
  const wins = trades.filter(
    (trade) => trade.realPL && trade.realPL > 0,
  ).length;
  const losses = trades.filter(
    (trade) => trade.realPL && trade.realPL < 0,
  ).length;
  return { wins, losses };
};

/**
 * Calculate the Profit Factor.
 * Formula: (Total Gains) / (Total Losses)
 */
export const calculateProfitFactor = (trades: Trade[]): number => {
    const totalGains = trades.reduce(
      (acc, trade) => acc + ((trade.realRR ?? 0) > 0 ? (trade.realRR ?? 0) : 0),
      0,
    );
    const totalLosses = trades.reduce(
      (acc, trade) =>
        acc + ((trade.realRR ?? 0) < 0 ? Math.abs(trade.realRR ?? 0) : 0),
      0,
    );
  
    return truncateToTwoDecimals(totalGains / totalLosses);
  };
  
export const calculateAveragePayoffRatio = (trades: Trade[]): number => {
  const totalWin = trades
    .filter((trade) => trade.realPL !== null && trade.realPL > 0)
    .reduce((acc, trade) => acc + (trade.realPL ?? 0), 0);

  const totalLoss = trades
    .filter((trade) => trade.realPL !== null && trade.realPL < 0)
    .reduce((acc, trade) => acc + Math.abs(trade.realPL ?? 0), 0);

  const numWins = trades.filter(
    (trade) => trade.realPL !== null && trade.realPL > 0,
  ).length;
  const numLosses = trades.filter(
    (trade) => trade.realPL !== null && trade.realPL < 0,
  ).length;

  const averageWin = totalWin / numWins;
  const averageLoss = totalLoss / numLosses;

  return truncateToTwoDecimals(averageWin / averageLoss);
};

/**
 * Calculate the Average Percentage Move.
 * Formula: (Total % Change) / (Number of Trades)
 */
export const calculateAveragePercentMove = (trades: Trade[]): number => {
  const totalPercentChange = trades.reduce(
    (acc, trade) => acc + (trade.percentChange ?? 0),
    0,
  );
  const numberOfTrades = trades.length;

  return truncateToTwoDecimals(totalPercentChange / numberOfTrades);
};

/**
 * Calculate the Average Percentage Risked.
 * Formula: (Total Risk %) / (Number of Trades)
 */
export const calculateAveragePercentRisked = (trades: Trade[]): number => {
  const totalRisk = trades.reduce((acc, trade) => acc + (trade.risk ?? 0), 0);
  const numberOfTrades = trades.length;

  return truncateToTwoDecimals(totalRisk / numberOfTrades);
};

/**
 * Calculate the System Quality Number in terms of $ and R:R.
 * Formula: (Average Profitability / Standard Deviation) * sqrt(Number of Trades)
 */
export const calculateSystemQualityNumber = (closedTrades: Trade[]) => {
  const { averageProfitabilityDollar, averageProfitabilityRR } = calculateAverageProfitability(closedTrades);
  const { standardDeviationDollar, standardDeviationRR } = calculatePLStandardDeviation(closedTrades);
  const sqnDollar = truncateToTwoDecimals(
    (averageProfitabilityDollar / standardDeviationDollar) * Math.sqrt(closedTrades.length),
  );
  const sqnRR = truncateToTwoDecimals(
    (averageProfitabilityRR / standardDeviationRR) * Math.sqrt(closedTrades.length),
  );
  return { sqnDollar, sqnRR };
};

/**
 * Calculate the Kelly Percentage.
 * Formula: WinRate - [(1 - WinRate) / PayoffRatio]
 */
export const calculateKellyPercentage = (closedTrades: Trade[]) => {
  const { wins, losses } = calculateWinsLosses(closedTrades);
  const winRate = wins / (wins + losses);
  const payoffRatio = calculateAveragePayoffRatio(closedTrades);
  const kelly = truncateToTwoDecimals(winRate - (1 - winRate) / payoffRatio);
  return kelly;
};

/**
 * Calculate the slope and standard deviation of residuals for a linear regression model.
 * @param yValues The array of dependent variables
 * @return An object containing the slope and standard deviation of residuals
 */
const runLinearRegression = (yValues: number[]) => {
  const xValues = Array.from({ length: yValues.length }, (_, i) => i);
  const n = yValues.length;
  // Calculate sums needed for slope and intercept
  const sumX = sum(xValues);
  const sumY = sum(yValues);
  const sumXX = sum(xValues.map((x) => x * x));
  const sumXY = sum(xValues.map((x, i) => x * yValues[i]));
  // Calculate slope (b) and intercept (a) for y = a + bx
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  // Calculate residuals
  const residuals = yValues.map((y, i) => y - slope * xValues[i]);
  // Calculate standard deviation of residuals
  const stdDevResiduals = standardDeviation(residuals);

  return { slope, stdDevResiduals };
};

/**
 * Calculate the K-Ratio.
 * Formula: Slope of Cumulative Returns / StdDev of Linear Regression Residuals
 */
export const calculateKRatio = (closedTrades: Trade[]) => {
  const cumulativeReturns = [];
  let currentSum = 0;

  for (const trade of closedTrades) {
    currentSum += trade.realPL ?? 0;
    cumulativeReturns.push(currentSum);
  }
  const { slope, stdDevResiduals } = runLinearRegression(cumulativeReturns);
  const kRatio = truncateToTwoDecimals(slope / stdDevResiduals);

  return kRatio;
};

/**
 * Calculate the Probability of Random Chance.
 * Formula: (1 - Z-Score)^Number of Trades
 */
export const calculateProbabilityOfRandomChance = (closedTrades: Trade[]) => {
  const { averageProfitabilityDollar } =
    calculateAverageProfitability(closedTrades);
  const { standardDeviationDollar } =
    calculatePLStandardDeviation(closedTrades);

  const zScore = (averageProfitabilityDollar - 0) / standardDeviationDollar;
  const prob = truncateToTwoDecimals(Math.pow(1 - zScore, closedTrades.length));

  return prob * 100;
};

/**
 * Calculate the Average Win in terms of $ and R:R.
 * Formula: (Total Win $) / (Number of Winning Trades)
 */
export const calculateAverageWin = (closedTrades: Trade[]) => {
  const winningTrades = closedTrades.filter(
    (trade) => trade.realPL !== null && trade.realPL > 0,
  );
  const avgWinDollar = truncateToTwoDecimals(
    sum(winningTrades.map((trade) => trade.realPL!)) / winningTrades.length,
  );
  const avgWinRR = truncateToTwoDecimals(
    sum(winningTrades.map((trade) => trade.realRR!)) / winningTrades.length,
  );
  return { avgWinDollar, avgWinRR };
};

/**
 * Calculate the Largest Gain in terms of $ and R:R.
 * Formula: Max(realPL) and Max(realRR) among all trades
 */
export const calculateLargestGain = (closedTrades: Trade[]) => {
  const largestGainDollar = truncateToTwoDecimals(
    Math.max(...closedTrades.map((trade) => trade.realPL ?? 0)),
  );
  const largestGainRR = truncateToTwoDecimals(
    Math.max(...closedTrades.map((trade) => trade.realRR ?? 0)),
  );
  return { largestGainDollar, largestGainRR };
};

/**
 * Calculate Max Consecutive Wins.
 * Formula: Maximum length of consecutive winning trades
 */
export const calculateMaxConsecutiveWins = (closedTrades: Trade[]) => {
  let maxWins = 0,
    currentWins = 0;
  for (const trade of closedTrades) {
    if (trade.realPL !== null && trade.realPL > 0) {
      currentWins++;
      maxWins = Math.max(maxWins, currentWins);
    } else {
      currentWins = 0;
    }
  }
  return maxWins;
};

/**
 * Calculate the Average Loss in terms of $ and R:R.
 * Formula: (Total Loss $) / (Number of Losing Trades)
 */
export const calculateAverageLoss = (closedTrades: Trade[]) => {
  const losingTrades = closedTrades.filter(
    (trade) => trade.realPL !== null && trade.realPL < 0,
  );
  const avgLossDollar = truncateToTwoDecimals(
    sum(losingTrades.map((trade) => trade.realPL!)) / losingTrades.length,
  );
  const avgLossRR = truncateToTwoDecimals(
    sum(losingTrades.map((trade) => trade.realRR!)) / losingTrades.length,
  );
  return { avgLossDollar, avgLossRR };
};

/**
 * Calculate the Largest Loss in terms of $ and R:R.
 * Formula: Min(realPL) and Min(realRR) among all trades
 */
export const calculateLargestLoss = (closedTrades: Trade[]) => {
  const largestLossDollar = truncateToTwoDecimals(
    Math.min(...closedTrades.map((trade) => trade.realPL ?? 0)),
  );
  const largestLossRR = truncateToTwoDecimals(
    Math.min(...closedTrades.map((trade) => trade.realRR ?? 0)),
  );
  return { largestLossDollar, largestLossRR };
};

/**
 * Calculate Max Consecutive Losses.
 * Formula: Maximum length of consecutive losing trades
 */
export const calculateMaxConsecutiveLosses = (closedTrades: Trade[]) => {
  let maxLosses = 0,
    currentLosses = 0;
  for (const trade of closedTrades) {
    if (trade.realPL !== null && trade.realPL < 0) {
      currentLosses++;
      maxLosses = Math.max(maxLosses, currentLosses);
    } else {
      currentLosses = 0;
    }
  }
  return maxLosses;
};

/**
 * Calculate the Average Hold Time in terms of hours (mean and median).
 * Formula for Mean: (Total Hold Time in hours) / (Number of Trades)
 * Formula for Median: Middle value of sorted array of hold times for all trades
 */
export const calculateAverageHoldTime = (closedTrades: Trade[]) => {
  const holdTimes = closedTrades.map((trade) => trade.totalHrs ?? 0);
  const mean = truncateToTwoDecimals(sum(holdTimes) / closedTrades.length);
  const median = validateNumber(calculateMedian(holdTimes));
  return { mean, median };
};

/**
 * Calculate the Average Hold Time for Wins in terms of hours (mean and median).
 * Formula: Mean = (Total Hold Time for Wins in hours) / (Number of Winning Trades)
 *          Median = Middle value of sorted array of hold times for winning trades
 */
export const calculateAverageHoldTimeWins = (closedTrades: Trade[]) => {
  const winningTrades = closedTrades.filter(
    (trade) => trade.realPL !== null && trade.realPL > 0,
  );
  const holdTimes = winningTrades.map((trade) => trade.totalHrs ?? 0);
  const mean = truncateToTwoDecimals(sum(holdTimes) / winningTrades.length);
  const median = validateNumber(calculateMedian(holdTimes)); // Assuming you have a function to calculate median
  return { mean, median };
};

/**
 * Calculate the Average Hold Time for Losses in terms of hours (mean and median).
 * Formula for Mean: (Total Hold Time for Losses in hours) / (Number of Losing Trades)
 * Formula for Median: Middle value of sorted array of hold times for losing trades
 */
export const calculateAverageHoldTimeLosses = (closedTrades: Trade[]) => {
  const losingTrades = closedTrades.filter(
    (trade) => trade.realPL !== null && trade.realPL < 0,
  );
  const holdTimes = losingTrades.map((trade) => trade.totalHrs ?? 0);
  const mean = truncateToTwoDecimals(sum(holdTimes) / losingTrades.length);
  const median = validateNumber(calculateMedian(holdTimes));
  return { mean, median };
};

/**
 * Calculate the Long Short Ratio.
 * Formula: (Number of Long Trades) / (Number of Short Trades)
 */
export const calculateLongShortRatio = (closedTrades: Trade[]) => {
  const totalTrades = closedTrades.length;
  const longTrades = closedTrades.filter(
    (trade) => trade.direction === "Long",
  ).length;
  const shortTrades = closedTrades.filter(
    (trade) => trade.direction === "Short",
  ).length;

  const longPercentage = truncateToTwoDecimals(
    (longTrades / totalTrades) * 100,
  );
  const shortPercentage = truncateToTwoDecimals(
    (shortTrades / totalTrades) * 100,
  );
  const ratio = truncateToTwoDecimals(longTrades / shortTrades);

  return { longPercentage, shortPercentage, ratio };
};

/**
 * Calculate the Long Win Percentage.
 * Formula: (Number of Winning Long Trades) / (Total Number of Long Trades) * 100
 */
export const calculateLongWinPercentage = (closedTrades: Trade[]) => {
  const longTrades = closedTrades.filter((trade) => trade.direction === "Long");
  const longWins = longTrades.filter(
    (trade) => trade.realPL !== null && trade.realPL > 0,
  ).length;
  const percentage = truncateToTwoDecimals(
    (longWins / longTrades.length) * 100,
  );
  return percentage;
};

/**
 * Calculate the Short Win Percentage.
 * Formula: (Number of Winning Short Trades) / (Total Number of Short Trades) * 100
 */
export const calculateShortWinPercentage = (closedTrades: Trade[]) => {
  const shortTrades = closedTrades.filter(
    (trade) => trade.direction === "Short",
  );
  const shortWins = shortTrades.filter(
    (trade) => trade.realPL !== null && trade.realPL > 0,
  ).length;
  const percentage = truncateToTwoDecimals(
    (shortWins / shortTrades.length) * 100,
  );
  return percentage;
};

/**
 * Calculate Max Drawdown in terms of $ and R:R.
 * Formula: Maximum peak-to-trough decline over a specific time period
 */
export const calculateMaxDrawdown = (closedTrades: Trade[]) => {
  let peakPL = Number.NEGATIVE_INFINITY;
  let peakRR = Number.NEGATIVE_INFINITY;
  let maxDrawdownDollar = 0;
  let maxDrawdownRR = 0;

  let currentPL = 0;
  let currentRR = 0;

  let drawdownPercentPL = 0;
  let drawdownPercentRR = 0;

  for (const trade of closedTrades) {
    if (trade.realPL !== null) {
      currentPL += trade.realPL;
      peakPL = Math.max(peakPL, currentPL);
      maxDrawdownDollar = Math.max(maxDrawdownDollar, peakPL - currentPL);
      drawdownPercentPL = peakPL !== 0 ? (maxDrawdownDollar / peakPL) * 100 : 0;
    }
    if (trade.realRR !== null) {
      currentRR += trade.realRR;
      peakRR = Math.max(peakRR, currentRR);
      maxDrawdownRR = Math.max(maxDrawdownRR, peakRR - currentRR);
      drawdownPercentRR = peakRR !== 0 ? (maxDrawdownRR / peakRR) * 100 : 0;
    }
  }

  return {
    maxDrawdownDollar: truncateToTwoDecimals(maxDrawdownDollar),
    maxDrawdownRR: truncateToTwoDecimals(maxDrawdownRR),
    drawdownPercentPL: truncateToTwoDecimals(drawdownPercentPL),
    drawdownPercentRR: truncateToTwoDecimals(drawdownPercentRR),
  };
};

/**
 * Calculate Average Profitability per Long in terms of $ and R:R.
 * Formula: (Total Profit/Loss for Long Trades in $) / (Number of Long Trades)
 *          (Total Profit/Loss for Long Trades in R:R) / (Number of Long Trades)
 */
export const calculateAverageProfitabilityPerLong = (closedTrades: Trade[]) => {
  const longTrades = closedTrades.filter((trade) => trade.direction === "Long");
  const totalPLDollar = sum(longTrades.map((trade) => trade.realPL ?? 0));
  const totalPLRR = sum(longTrades.map((trade) => trade.realRR ?? 0));

  const avgPLDollar = truncateToTwoDecimals(totalPLDollar / longTrades.length);
  const avgPLRR = truncateToTwoDecimals(totalPLRR / longTrades.length);

  return { avgPLDollar, avgPLRR };
};

/**
 * Calculate Average Profitability per Short in terms of $ and R:R.
 * Formula: (Total Profit/Loss for Short Trades in $) / (Number of Short Trades)
 *          (Total Profit/Loss for Short Trades in R:R) / (Number of Short Trades)
 */
export const calculateAverageProfitabilityPerShort = (
  closedTrades: Trade[],
) => {
  const shortTrades = closedTrades.filter(
    (trade) => trade.direction === "Short",
  );
  const totalPLDollar = sum(shortTrades.map((trade) => trade.realPL ?? 0));
  const totalPLRR = sum(shortTrades.map((trade) => trade.realRR ?? 0));

  const avgPLDollar = truncateToTwoDecimals(totalPLDollar / shortTrades.length);
  const avgPLRR = truncateToTwoDecimals(totalPLRR / shortTrades.length);

  return { avgPLDollar, avgPLRR };
};

/**
 * Calculate Pip Gain/Loss.
 * Formula: Sum of pips from all trades
 */
export const calculatePipGainLoss = (closedTrades: Trade[]) => {
  const totalPips = sum(closedTrades.map((trade) => trade.pips ?? 0));
  return truncateToTwoDecimals(totalPips);
};

/**
 * Calculate Max Favorable Excursion Ratio (average).
 * Formula: Sum of MFE ratios / Number of Trades
 */
export const calculateMaxFavorableExcursionRatio = (closedTrades: Trade[]) => {
  const totalMFE = sum(closedTrades.map((trade) => trade.mfeRatio ?? 0));
  const avgMFE = truncateToTwoDecimals(totalMFE / closedTrades.length);
  return avgMFE;
};

/**
 * Calculate Max Adverse Excursion Ratio (average).
 * Formula: Sum of MAE ratios / Number of Trades
 */
export const calculateMaxAdverseExcursionRatio = (closedTrades: Trade[]) => {
  const totalMAE = sum(closedTrades.map((trade) => trade.maeRatio ?? 0));
  const avgMAE = truncateToTwoDecimals(totalMAE / closedTrades.length);
  return avgMAE;
};

/**
 * Calculate Ulcer Index.
 * Formula: sqrt(Average(Drawdown Percentage^2))
 */
export const calculateUlcerIndex = (closedTrades: Trade[]) => {
  const sortedTrades = closedTrades.sort(
    (a, b) =>
      new Date(a.datetimeIn).getTime() - new Date(b.datetimeIn).getTime(),
  );
  let peakValue = Number.NEGATIVE_INFINITY;
  let sumOfSquares = 0;

  for (const trade of sortedTrades) {
    const tradeValue = trade.realPL ?? 0;
    if (tradeValue > peakValue) {
      peakValue = tradeValue;
    }
    const drawdown = ((peakValue - tradeValue) / peakValue) * 100;
    sumOfSquares += drawdown * drawdown;
  }

  return truncateToTwoDecimals(Math.sqrt(sumOfSquares / sortedTrades.length));
};

/**
 * Calculate Drawdown Duration.
 * Returns the duration of the drawdown in days and hours.
 */
export const calculateDrawdownDuration = (closedTrades: Trade[]) => {
  const sortedTrades = closedTrades.sort(
    (a, b) =>
      new Date(a.datetimeIn).getTime() - new Date(b.datetimeIn).getTime(),
  );

  let peakValue = Number.NEGATIVE_INFINITY;
  let peakTime = 0;
  let troughValue = Number.POSITIVE_INFINITY;
  let troughTime = 0;

  for (const trade of sortedTrades) {
    const tradeTime = new Date(trade.datetimeOut ?? 0).getTime();
    const tradeValue = trade.realPL ?? 0;

    if (tradeValue > peakValue) {
      peakValue = tradeValue;
      peakTime = tradeTime;
    }

    if (tradeValue < troughValue) {
      troughValue = tradeValue;
      troughTime = tradeTime;
    }
  }

  const drawdownDurationMs = Math.abs(troughTime - peakTime);

  // Convert the drawdown duration to days and hours
  const drawdownDurationDays = validateNumber(
    Math.floor(drawdownDurationMs / (1000 * 60 * 60 * 24)),
  );
  const drawdownDurationHours = validateNumber(
    Math.floor((drawdownDurationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
  );

  return {
    drawdownDurationDays,
    drawdownDurationHours,
  };
};

/**
 * Calculate Skewness and Kurtosis.
 * Skewness Formula: [Σ(xᵢ - μ)³ / N] / σ³
 * Kurtosis Formula: [Σ(xᵢ - μ)⁴ / N] / σ⁴
 */
// Helper function to check if the input is an array of Trade
function isTradeArray(data: any[]): data is Trade[] {
  return data.every(item => item.hasOwnProperty('realRR'));
}

// Calculate Skewness and Kurtosis accepting both number[] and Trade[]
export const calculateSkewnessAndKurtosis = (data: number[] | Trade[]) => {
  let values: number[];

  if (isTradeArray(data)) {
      // Extract realRR values, filtering out undefined for safety
      values = data.map(trade => trade.realRR ?? 0);
  } else {
      // Assume it's number[] if not Trade[]
      values = data;
  }

  const n = values.length;
  const mean = values.reduce((acc, val) => acc + val, 0) / n;
  const deviations = values.map(value => value - mean);
  const stdDev = Math.sqrt(deviations.reduce((acc, val) => acc + val * val, 0) / n);

  let skewness = 0;
  let kurtosis = 0;

  for (const deviation of deviations) {
      skewness += Math.pow(deviation, 3);
      kurtosis += Math.pow(deviation, 4);
  }

  skewness = skewness / n / Math.pow(stdDev, 3);
  kurtosis = kurtosis / n / Math.pow(stdDev, 4) - 3; // Excess kurtosis

  return {
      skewness: truncateToTwoDecimals(skewness),
      kurtosis: truncateToTwoDecimals(kurtosis)
  };
};

/**
 * Calculate Value at Risk (VaR) and Conditional Value at Risk (CVaR).
 * VaR Formula: The investment value below which there lies a certain percent (alpha) of the distribution of returns.
 * CVaR Formula: The average of all the investment values below the VaR.
 */
export const calculateVaRandCVaR = (
  closedTrades: Trade[],
  alpha: number = 0.05,
) => {
  const losses = closedTrades
    .map((trade) => trade.realPL ?? 0)
    .filter((pl) => pl < 0)
    .sort((a, b) => a - b);
  let VaR = -truncateToTwoDecimals(losses[Math.floor(alpha * losses.length)]);
  let numLosses = Math.floor(alpha * losses.length);
  let CVaR: number;
  if (numLosses === 0 || isNaN(alpha)) {
    CVaR = Infinity; // or some other default value
  } else {
    CVaR = -truncateToTwoDecimals(
      losses.slice(0, numLosses).reduce((acc, val) => acc + val, 0) / numLosses
    );
  }

  return { VaR, CVaR };
};

/**
 * Calculate Net Drawdown in terms of % and $.
 * Formula: ((Peak Equity - Trough Equity) / Peak Equity) * 100
 */
export const calculateNetDrawdown = (closedTrades: Trade[]) => {
  let peakEquity = Number.NEGATIVE_INFINITY;
  let troughEquity = Number.POSITIVE_INFINITY;

  for (const trade of closedTrades) {
    if (trade.equity !== null) {
      peakEquity = Math.max(peakEquity, trade.equity);
      troughEquity = Math.min(troughEquity, trade.equity);
    }
  }

  const netDrawdownDollar = peakEquity - troughEquity;
  const netDrawdownPercent = (netDrawdownDollar / peakEquity) * 100;

  return {
    netDrawdownDollar: truncateToTwoDecimals(netDrawdownDollar),
    netDrawdownPercent: truncateToTwoDecimals(netDrawdownPercent),
  };
};

/**
 * Calculate Sum of Commission and Average % of P/L going towards Commission
 * Formula: Sum of all commission costs and (Total Commission / Total P/L) * 100
 */
export const calculateCommissionMetrics = (closedTrades: Trade[]) => {
  const totalCommission = sum(
    closedTrades.map((trade) => trade.commission ?? 0),
  );

  const additionalRiskPercentages = closedTrades.map((trade) => {
    const absoluteCommission = Math.abs(trade.commission ?? 0);
    const equity = trade.equity ?? 0;
    if (equity !== 0) {
      return (absoluteCommission / equity) * 100;
    }
    return 0;
  });

  const avgAdditionalRiskPercent =
    sum(additionalRiskPercentages) / additionalRiskPercentages.length;

  return {
    totalCommission: truncateToTwoDecimals(totalCommission),
    avgAdditionalRiskPercent: truncateToTwoDecimals(avgAdditionalRiskPercent),
  };
};

/**
 * Selects an optimal threshold for calculating GPD based on skewness and kurtosis.
 * Iterates over specified percentiles to determine the best threshold that minimizes skewness
 * while retaining a sufficient number of exceedances.
 * Returns the best result including the threshold, skewness, kurtosis, count of exceedances, and the exceedances themselves.
 */
interface DynamicThresholdResult {
  threshold: number;
  skewness: number;
  kurtosis: number;
  count: number;
  excesses: number[];  // Include this to ensure excesses are returned for further processing
}

function dynamicThresholdSelection(trades: Trade[], percentileStart: number, percentileEnd: number, percentileStep: number): DynamicThresholdResult | null {
  const realRRs = trades.map(trade => trade.realRR ?? 0).filter(rr => rr !== 0);
  realRRs.sort((a, b) => a - b);
  
  const results: DynamicThresholdResult[] = [];
  for (let p = percentileStart; p <= percentileEnd; p += percentileStep) {
      const thresholdIndex = Math.floor((p / 100) * realRRs.length);
      const threshold = realRRs[thresholdIndex];
      const excesses = realRRs.filter(rr => rr > threshold);

      const { skewness, kurtosis } = calculateSkewnessAndKurtosis(excesses);
      results.push({ threshold, skewness, kurtosis, count: excesses.length, excesses });
  }

  const bestResult = results.filter(r => r.count > 5);
  if (bestResult.length === 0) {
      throw new Error('No valid threshold found with enough data.');
  }

  const selectedResult = bestResult.reduce((prev, curr) => (prev.skewness < curr.skewness ? prev : curr));
  return selectedResult;
}

/**
 * Fits a Generalized Pareto Distribution (GPD) to excesses over a threshold.
 * Uses Maximum Likelihood Estimation (MLE) to find the scale (sigma) and shape (xi) parameters.
 * Likelihood Function: L(ξ, σ) = -n * log(σ) - (1 + 1/ξ) * Σ(log(1 + ξ(x - u)/σ))
 * where x are the excesses, and u is the threshold.
 */
interface GPDParameters {
  xi: number;
  sigma: number;
}

interface Bounds {
  [key: string]: [number, number]; // General form, or more specifically:
  xi: [number, number];
  sigma: [number, number];
}


function constrainedOptimization(likelihood: Function, initialParams: number[], bounds: Bounds) {
  function boundedLikelihood(params: number[]) {
      const xi = params[0];
      const sigma = params[1];

      // Check constraints: return a large number if out of bounds
      if (sigma <= bounds.sigma[0] || sigma >= bounds.sigma[1] || xi <= bounds.xi[0] || xi >= bounds.xi[1]) {
          return Number.MAX_VALUE;
      }
      return likelihood(params);
  }

  // Run the optimization with Nelder-Mead, using the bounded likelihood function
  const result = nelderMead(boundedLikelihood, initialParams);
  return {
      x: result.x,  // Parameters: xi, sigma
      fval: result.fx  // Minimum found
  };
}

function fitGPD(excesses: number[]): GPDParameters {
  const likelihood = (params: number[]) => {
      const xi = params[0];
      const sigma = params[1];
      if (sigma <= 0 || xi <= 0) return Infinity;  // Avoid non-positive values for stability
      return -excesses.length * Math.log(sigma) - (1 + 1 / xi) * excesses.reduce((acc, x) => acc + Math.log(1 + xi * (x / sigma)), 0);
  };

  const initialParams = [0.1, standardDeviation(excesses)];
  const bounds = {xi: [0.001, 5], sigma: [0.1, 50]};  // Example bounds

  const result = constrainedOptimization(likelihood, initialParams, bounds);
  return { xi: result.x[0], sigma: result.x[1] };
}

/**
 * Generates data points for the Probability Density Function (PDF) of a fitted GPD.
 * Formula: f(x; ξ, σ) = (1/σ) * (1 + ξ(x/σ))^(-1/ξ - 1)
 * Computes the PDF across a specified range from min to max with a defined number of points.
 */
function generateGPDData(xi: number, sigma: number, min: number, max: number, numPoints: number = 1000): Array<{ xValue: number; yValue: number }> {
  const step = (max - min) / numPoints;
  const data = [];

  for (let i = 0; i <= numPoints; i++) {
    const x = min + i * step;
    const base = 1 + xi * (x / sigma);
    if (xi !== 0 && base <= 0) {
        continue; // Skip invalid computation
      }
    let pdfValue = (1 / sigma) * Math.pow(base, -1 / xi - 1);
    data.push({ xValue: x, yValue: pdfValue });
  }

  return data;
}

/**
 * Integrates the process of threshold selection, GPD fitting, and PDF data generation.
 * Begins by dynamically selecting a threshold for `realRR` values from trades,
 * then fits a GPD to the exceedances over this threshold, and finally generates
 * the PDF data points for visualization purposes.
 */
export const analyzeAndGenerateGPD = (
  trades: Trade[],
  percentileStart: number = 80,
  percentileEnd: number = 100,
  percentileStep: number = 0.5,
  numPoints: number = 1000
): Array<{ xValue: number; yValue: number }> => {
  // Step 1: Dynamic Threshold Selection
  const selectedResult = dynamicThresholdSelection(trades, percentileStart, percentileEnd, percentileStep);
  if (!selectedResult) {
      throw new Error('No valid threshold found with enough data.');
  }

  // Display selected threshold results
  console.log(`Selected Threshold: ${selectedResult.threshold}`);
  console.log(`Skewness at Threshold: ${selectedResult.skewness}`);
  console.log(`Kurtosis at Threshold: ${selectedResult.kurtosis}`);

  // Step 2: Fit GPD to the excesses over the selected threshold
  const { xi, sigma } = fitGPD(selectedResult.excesses);

  // Step 3: Generate GPD data for visualization
  const min = 0;  // Start from 0 or adjust based on your specific needs
  const max = selectedResult.excesses.length > 0 ? Math.max(...selectedResult.excesses) : 0;  // Max of excesses or a suitable upper limit
  const gpdData = generateGPDData(xi, sigma, min, max, numPoints);

  return gpdData;
}
