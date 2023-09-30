// statisticCalculations.ts
import { Trade } from "../models/TradeTypes";

// Helper function to calculate the sum of an array of numbers
const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);
// Helper to truncate to two decimals
const truncateToTwoDecimals = (num: number) => parseFloat(num.toFixed(2));
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
 * Calculate the total gain or loss in both Dollar and R:R terms.
 * Formula: Summation of all real P/L
 */
export const calculateTotalGainLoss = (trades: Trade[]) => {
  const realPL = trades.map((trade) => trade.realPL ?? 0);
  const realRR = trades.map((trade) => trade.realRR ?? 0);
  return {
    totalGainLossDollar: truncateToTwoDecimals(sum(realPL)),
    totalGainLossRR: truncateToTwoDecimals(sum(realRR)),
  };
};

/**
 * Calculate the average profitability per trade in both Dollar and R:R terms.
 * Formula: (Total Gain or Loss) / (Total Number of Trades)
 */
export const calculateAverageProfitability = (trades: Trade[]) => {
  const realPL = trades.map((trade) => trade.realPL ?? 0);
  const realRR = trades.map((trade) => trade.realRR ?? 0);
  return {
    averageProfitabilityDollar: truncateToTwoDecimals(
      sum(realPL) / trades.length,
    ),
    averageProfitabilityRR: truncateToTwoDecimals(sum(realRR) / trades.length),
  };
};

/**
 * Calculate the standard deviation of trade Profit/Loss in both Dollar and R:R terms.
 * Formula: sqrt((Summation(X - Mean)^2) / N)
 */
export const calculatePLStandardDeviation = (trades: Trade[]) => {
  const realPL = trades.map((trade) => trade.realPL ?? 0);
  const realRR = trades.map((trade) => trade.realRR ?? 0);
  return {
    standardDeviationDollar: truncateToTwoDecimals(standardDeviation(realPL)),
    standardDeviationRR: truncateToTwoDecimals(standardDeviation(realRR)),
  };
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
    (acc, trade) => acc + (trade.realPL ?? 0),
    0,
  );
  const totalLosses = trades.reduce(
    (acc, trade) =>
      acc + ((trade.realPL ?? 0) < 0 ? Math.abs(trade.realPL ?? 0) : 0),
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
  const { averageProfitabilityDollar, averageProfitabilityRR } =
    calculateAverageProfitability(closedTrades);
  const { standardDeviationDollar, standardDeviationRR } =
    calculatePLStandardDeviation(closedTrades);
  const sqnDollar = truncateToTwoDecimals(
    (averageProfitabilityDollar / standardDeviationDollar) *
      Math.sqrt(closedTrades.length),
  );
  const sqnRR = truncateToTwoDecimals(
    (averageProfitabilityRR / standardDeviationRR) *
      Math.sqrt(closedTrades.length),
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

  return prob;
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
  const median = calculateMedian(holdTimes);
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
  const median = calculateMedian(holdTimes); // Assuming you have a function to calculate median
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
  const median = calculateMedian(holdTimes);
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

  for (const trade of closedTrades) {
    if (trade.realPL !== null) {
      currentPL += trade.realPL;
      peakPL = Math.max(peakPL, currentPL);
      maxDrawdownDollar = Math.max(maxDrawdownDollar, peakPL - currentPL);
    }
    if (trade.realRR !== null) {
      currentRR += trade.realRR;
      peakRR = Math.max(peakRR, currentRR);
      maxDrawdownRR = Math.max(maxDrawdownRR, peakRR - currentRR);
    }
  }

  return {
    maxDrawdownDollar: truncateToTwoDecimals(maxDrawdownDollar),
    maxDrawdownRR: truncateToTwoDecimals(maxDrawdownRR),
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
  const sortedTrades = closedTrades.sort((a, b) => new Date(a.datetimeIn).getTime() - new Date(b.datetimeIn).getTime());
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
  const sortedTrades = closedTrades.sort((a, b) => new Date(a.datetimeIn).getTime() - new Date(b.datetimeIn).getTime());

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
  const drawdownDurationDays = Math.floor(drawdownDurationMs / (1000 * 60 * 60 * 24));
  const drawdownDurationHours = Math.floor((drawdownDurationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return {
    drawdownDurationDays,
    drawdownDurationHours
  };
};

/**
 * Calculate Skewness and Kurtosis.
 * Skewness Formula: [Σ(xᵢ - μ)³ / N] / σ³
 * Kurtosis Formula: [Σ(xᵢ - μ)⁴ / N] / σ⁴
 */
export const calculateSkewnessAndKurtosis = (closedTrades: Trade[]) => {
  const averagePL = average(closedTrades.map((trade) => trade.realPL ?? 0));
  const stdDev = standardDeviation(closedTrades.map((trade) => trade.realPL ?? 0));
  
  let skewness = 0;
  let kurtosis = 0;

  for (const trade of closedTrades) {
    const x = (trade.realPL ?? 0) - averagePL;
    skewness += Math.pow(x, 3);
    kurtosis += Math.pow(x, 4);
  }

  skewness = truncateToTwoDecimals((skewness / closedTrades.length) / Math.pow(stdDev, 3));
  kurtosis = truncateToTwoDecimals((kurtosis / closedTrades.length) / Math.pow(stdDev, 4));

  return { skewness, kurtosis };
};

/**
 * Calculate Value at Risk (VaR) and Conditional Value at Risk (CVaR).
 * VaR Formula: The investment value below which there lies a certain percent (alpha) of the distribution of returns.
 * CVaR Formula: The average of all the investment values below the VaR.
 */
export const calculateVaRandCVaR = (closedTrades: Trade[], alpha: number = 0.05) => {
  const losses = closedTrades.map((trade) => trade.realPL ?? 0).filter(pl => pl < 0).sort((a, b) => a - b);
  let VaR = -(losses[Math.floor(alpha * losses.length)]);
  let CVaR = -(losses.slice(0, Math.floor(alpha * losses.length)).reduce((acc, val) => acc + val, 0) / Math.floor(alpha * losses.length));

  return {VaR, CVaR };
};
