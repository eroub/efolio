// Statistics.tsx
import React, { ReactNode, CSSProperties } from "react";
// Types
import { Trade } from "../models/TradeTypes";
// Helper for formatting $ signs
import { formatCurrency } from "../utils/formatters";
// Calculations
import {
  calculateTotalGainLoss,
  calculateAverageProfitability,
  calculatePLStandardDeviation,
  calculateWinsLosses,
  calculateMaxConsecutiveWins,
  calculateMaxConsecutiveLosses,
  calculateAverageHoldTime,
  calculateAverageHoldTimeWins,
  calculateAverageHoldTimeLosses,
  calculateLongShortRatio,
  calculateLongWinPercentage,
  calculateShortWinPercentage,
  calculateMaxDrawdown,
  calculateAverageProfitabilityPerLong,
  calculateAverageProfitabilityPerShort,
  calculatePipGainLoss,
  calculateMaxFavorableExcursionRatio,
  calculateMaxAdverseExcursionRatio,
  calculateSystemQualityNumber,
  calculateKRatio,
  calculateProbabilityOfRandomChance,
  calculateAveragePayoffRatio,
  calculateAveragePercentMove,
  calculateAveragePercentRisked,
  calculateAverageWin,
  calculateLargestGain,
  calculateAverageLoss,
  calculateLargestLoss,
  calculateKellyPercentage,
  calculateProfitFactor,
  calculateDrawdownDuration,
  calculateSkewnessAndKurtosis,
  calculateUlcerIndex,
  calculateVaRandCVaR
} from "../utils/statisticCalculations";

interface StatisticsProps {
  closedTrades: Trade[];
}

interface StatLineProps {
  title: string;
  stats: ReactNode;
  style: CSSProperties;
}
const StatLine: React.FC<StatLineProps> = ({ title, stats, style }) => {
  return (
    <div
      style={{
        ...style,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        fontSize: "12px",
      }}
    >
      <h3>{title}</h3>
      <div style={{ marginLeft: "10px" }}>{stats}</div>
    </div>
  );
};

const TradeStatistics: React.FC<StatisticsProps> = ({ closedTrades }) => {
  // Calculate statistics using the utility functions
  const averagePayoffRatio = calculateAveragePayoffRatio(closedTrades);
  const { averageProfitabilityDollar, averageProfitabilityRR } =
    calculateAverageProfitability(closedTrades);
  const { mean: avgHoldTimeLossesMean, median: avgHoldTimeLossesMedian } =
    calculateAverageHoldTimeLosses(closedTrades);
  const { mean: avgHoldTimeMean, median: avgHoldTimeMedian } =
    calculateAverageHoldTime(closedTrades);
  const { mean: avgHoldTimeWinsMean, median: avgHoldTimeWinsMedian } =
    calculateAverageHoldTimeWins(closedTrades);
  const averagePercentMove = calculateAveragePercentMove(closedTrades);
  const averagePercentRisked = calculateAveragePercentRisked(closedTrades);
  const { avgLossDollar: averageLossDollar, avgLossRR: averageLossRR } =
    calculateAverageLoss(closedTrades);
  const { avgPLDollar: avgProfitLongDollar, avgPLRR: avgProfitLongRR } =
    calculateAverageProfitabilityPerLong(closedTrades);
  const { avgPLDollar: avgProfitShortDollar, avgPLRR: avgProfitShortRR } =
    calculateAverageProfitabilityPerShort(closedTrades);
  const { avgWinDollar: averageWinDollar, avgWinRR: averageWinRR } =
    calculateAverageWin(closedTrades);
  const { drawdownDurationDays, drawdownDurationHours } = calculateDrawdownDuration(closedTrades);
  const avgMaxAdverseExcursion =
    calculateMaxAdverseExcursionRatio(closedTrades);
  const avgMaxFavorableExcursion =
    calculateMaxFavorableExcursionRatio(closedTrades);
  const kRatio = calculateKRatio(closedTrades);
  const kellyPercentage = calculateKellyPercentage(closedTrades);
  const { largestGainDollar, largestGainRR } =
    calculateLargestGain(closedTrades);
  const { largestLossDollar, largestLossRR } =
    calculateLargestLoss(closedTrades);
  const { longPercentage, shortPercentage } =
    calculateLongShortRatio(closedTrades);
  const longWinPercentage = calculateLongWinPercentage(closedTrades);
  const maxConsecutiveLosses = calculateMaxConsecutiveLosses(closedTrades);
  const maxConsecutiveWins = calculateMaxConsecutiveWins(closedTrades);
  const { maxDrawdownDollar, maxDrawdownRR } =
    calculateMaxDrawdown(closedTrades);
  const probabilityOfRandomChance =
    calculateProbabilityOfRandomChance(closedTrades);
  const profitFactor = calculateProfitFactor(closedTrades);
  const { skewness, kurtosis} = calculateSkewnessAndKurtosis(closedTrades);
  const { sqnDollar, sqnRR } = calculateSystemQualityNumber(closedTrades);
  const { standardDeviationDollar, standardDeviationRR } =
    calculatePLStandardDeviation(closedTrades);
  const { totalGainLossDollar, totalGainLossRR } =
    calculateTotalGainLoss(closedTrades);
  const totalPipGainLoss = calculatePipGainLoss(closedTrades);
  const { wins, losses } = calculateWinsLosses(closedTrades);
  const shortWinPercentage = calculateShortWinPercentage(closedTrades);
  const ulcerIndex = calculateUlcerIndex(closedTrades);
  const {VaR, CVaR } = calculateVaRandCVaR(closedTrades);

  return (
    <div>
      <h2>Trade Statistics</h2>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Total Gain/Loss:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {formatCurrency(totalGainLossDollar)}</p>
              <p>(R:R): {totalGainLossRR}</p>
            </>
          }
        />
        <StatLine
          title="Average Profitability per Trade:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {formatCurrency(averageProfitabilityDollar)}</p>
              <p>(R:R): {averageProfitabilityRR}</p>
            </>
          }
        />
        <StatLine
          title="Trade P/L Standard Deviation:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {formatCurrency(standardDeviationDollar)}</p>
              <p>(R:R): {standardDeviationRR}</p>
            </>
          }
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="System Quality Number:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {sqnDollar}</p>
              <p>(R:R): {sqnRR}</p>
            </>
          }
        />
        <StatLine
          title="Kelly Percentage:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{kellyPercentage}%</p>
            </>
          }
        />
        <StatLine
          title="Number Wins : Losses:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>
                {wins} : {losses}
              </p>
            </>
          }
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Profit Factor:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{profitFactor}</p>
            </>
          }
        />
        <StatLine
          title="K-Ratio:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{kRatio}</p>
            </>
          }
        />
        <StatLine
          title="Probability of Random Chance:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{probabilityOfRandomChance}%</p>
            </>
          }
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Average Payoff Ratio:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{averagePayoffRatio}</p>
            </>
          }
        />
        <StatLine
          title="Average % Move:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{averagePercentMove}%</p>
            </>
          }
        />
        <StatLine
          title="Average % Risked:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{averagePercentRisked}%</p>
            </>
          }
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Average Win:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {formatCurrency(averageWinDollar)}</p>
              <p>(R:R): {averageWinRR}</p>
            </>
          }
        />
        <StatLine
          title="Largest Gain:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {formatCurrency(largestGainDollar)}</p>
              <p>(R:R): {largestGainRR}</p>
            </>
          }
        />
        <StatLine
          title="Max Consecutive Wins:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{maxConsecutiveWins}</p>
            </>
          }
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Average Loss:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {formatCurrency(averageLossDollar)}</p>
              <p>(R:R): {averageLossRR}</p>
            </>
          }
        />
        <StatLine
          title="Largest Loss:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {formatCurrency(largestLossDollar)}</p>
              <p>(R:R): {largestLossRR}</p>
            </>
          }
        />
        <StatLine
          title="Max Consecutive Losses:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{maxConsecutiveLosses}</p>
            </>
          }
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Average Hold Time:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>Mean: {avgHoldTimeMean} hrs</p>
              <p>Median: {avgHoldTimeMedian} hrs</p>
            </>
          }
        />
        <StatLine
          title="Average Hold Time (Wins):"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>Mean: {avgHoldTimeWinsMean} hrs</p>
              <p>Median: {avgHoldTimeWinsMedian} hrs</p>
            </>
          }
        />
        <StatLine
          title="Average Hold Time (Losses):"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>Mean: {avgHoldTimeLossesMean} hrs</p>
              <p>Median: {avgHoldTimeLossesMedian} hrs</p>
            </>
          }
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Long Short Ratio:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>Long Trades: {longPercentage}%</p>
              <p>Short Trades: {shortPercentage}%</p>
            </>
          }
        />
        <StatLine
          title="Long Win Percentage:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{longWinPercentage}%</p>
            </>
          }
        />
        <StatLine
          title="Short Win Percentage:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{shortWinPercentage}%</p>
            </>
          }
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Max Drawdown:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {formatCurrency(maxDrawdownDollar)}</p>
              <p>(R:R): {maxDrawdownRR}</p>
            </>
          }
        />
        <StatLine
          title="Average Profitability per Long:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {avgProfitLongDollar}</p>
              <p>(R:R): {avgProfitLongRR}</p>
            </>
          }
        />
        <StatLine
          title="Average Profitability per Short:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>($): {avgProfitShortDollar}</p>
              <p>(R:R): {avgProfitShortRR}</p>
            </>
          }
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Pip Gain/Loss:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{totalPipGainLoss}</p>
            </>
          }
        />
        <StatLine
          title="Average Max Favorable Excursion Ratio:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{avgMaxFavorableExcursion}</p>
            </>
          }
        />
        <StatLine
          title="Average Max Adverse Excursion Ratio:"
          style={{ flexBasis: '33.333%' }}
          stats={
            <>
              <p>{avgMaxAdverseExcursion}</p>
            </>
          }
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Drawdown Duration:"
          style={{ flexBasis: '33.333%' }}
          stats={(
            <>
              <p>Days: {drawdownDurationDays}</p>
              <p>Hours: {drawdownDurationHours}</p>
            </>
          )}
        />
        <StatLine
          title="Value at Risk"
          style={{ flexBasis: '33.333%' }}
          stats={(
            <>
              <p>{VaR}</p>
            </>
          )}
        />
        <StatLine
          title="Conditional Value at Risk"
          style={{ flexBasis: '33.333%' }}
          stats={(
            <>
              <p>{CVaR}</p>
            </>
          )}
        />
      </div>
      <div style={{ display: 'flex' }}>
        <StatLine
          title="Ulcer Index"
          style={{ flexBasis: '33.333%' }}
          stats={(
            <>
              <p>{ulcerIndex}</p>
            </>
          )}
        />
        <StatLine
          title="Skewness"
          style={{ flexBasis: '33.333%' }}
          stats={(
            <>
              <p>{skewness}</p>
            </>
          )}
        />
        <StatLine
          title="Kurtosis"
          style={{ flexBasis: '33.333%' }}
          stats={(
            <>
              <p>{kurtosis}</p>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default TradeStatistics;
