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
  calculateVaRandCVaR,
  calculateNetDrawdown,
  calculateCommissionMetrics,
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
  const { totalCommission, avgCommissionPercent } =
    calculateCommissionMetrics(closedTrades);
  const { drawdownDurationDays, drawdownDurationHours } =
    calculateDrawdownDuration(closedTrades);
  const avgMaxAdverseExcursion =
    calculateMaxAdverseExcursionRatio(closedTrades);
  const avgMaxFavorableExcursion =
    calculateMaxFavorableExcursionRatio(closedTrades);
  const { netDrawdownDollar, netDrawdownPercent } =
    calculateNetDrawdown(closedTrades);
  const kRatio = calculateKRatio(closedTrades);
  const kellyPercentage = calculateKellyPercentage(closedTrades);
  // eslint-disable-next-line
  const { largestGainDollar, largestGainRR } =
    calculateLargestGain(closedTrades);
  // eslint-disable-next-line
  const { largestLossDollar, largestLossRR } =
    calculateLargestLoss(closedTrades);
  const { longPercentage, shortPercentage } =
    calculateLongShortRatio(closedTrades);
  const longWinPercentage = calculateLongWinPercentage(closedTrades);
  const maxConsecutiveLosses = calculateMaxConsecutiveLosses(closedTrades);
  const maxConsecutiveWins = calculateMaxConsecutiveWins(closedTrades);
  const {
    maxDrawdownDollar,
    maxDrawdownRR,
    drawdownPercentPL,
    drawdownPercentRR,
  } = calculateMaxDrawdown(closedTrades);
  const probabilityOfRandomChance =
    calculateProbabilityOfRandomChance(closedTrades);
  const profitFactor = calculateProfitFactor(closedTrades);
  const { skewness, kurtosis } = calculateSkewnessAndKurtosis(closedTrades);
  const { sqnDollar, sqnRR } = calculateSystemQualityNumber(closedTrades);
  const { standardDeviationDollar, standardDeviationRR } =
    calculatePLStandardDeviation(closedTrades);
  const { totalGainLossDollar, totalGainLossRR } =
    calculateTotalGainLoss(closedTrades);
  const totalPipGainLoss = calculatePipGainLoss(closedTrades);
  const { wins, losses } = calculateWinsLosses(closedTrades);
  const shortWinPercentage = calculateShortWinPercentage(closedTrades);
  const ulcerIndex = calculateUlcerIndex(closedTrades);
  const { VaR, CVaR } = calculateVaRandCVaR(closedTrades);

  return (
    <div>
      <h2>Trade Statistics</h2>
      {/* Profitability Metrics */}
      <div style={{ display: "flex" }}>
        <h3>Profitability Metrics</h3>
        <StatLine
          title="Total Gain/Loss:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {formatCurrency(totalGainLossDollar)}</p>
              <p>(R:R): {totalGainLossRR}</p>
            </>
          }
        />
        <StatLine
          title="Avg. Profitability per Trade:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {formatCurrency(averageProfitabilityDollar)}</p>
              <p>(R:R): {averageProfitabilityRR}</p>
            </>
          }
        />
        <StatLine
          title="Avg. Win:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {formatCurrency(averageWinDollar)}</p>
              <p>(R:R): {averageWinRR}</p>
            </>
          }
        />
        <StatLine
          title="Avg. Loss:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {formatCurrency(averageLossDollar)}</p>
              <p>(R:R): {averageLossRR}</p>
            </>
          }
        />
      </div>
      {/* Trade Characteristics */}
      <div style={{ display: "flex" }}>
        <h3>Trade Characteristics</h3>
        <StatLine
          title="Number Wins : Losses:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>
                {wins} : {losses}
              </p>
            </>
          }
        />
        <StatLine
          title="Max Consecutive Wins:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{maxConsecutiveWins}</p>
            </>
          }
        />
        <StatLine
          title="Max Consecutive Losses:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{maxConsecutiveLosses}</p>
            </>
          }
        />
        <StatLine
          title="Probability of Random Chance:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{probabilityOfRandomChance}%</p>
            </>
          }
        />
      </div>
      {/* Trade Timing */}
      <div style={{ display: "flex" }}>
        <h3>Trade Timing</h3>
        <StatLine
          title="Avg. Hold Time:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>Mean: {avgHoldTimeMean} hrs</p>
              <p>Median: {avgHoldTimeMedian} hrs</p>
            </>
          }
        />
        <StatLine
          title="Avg. Hold Time (Wins):"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>Mean: {avgHoldTimeWinsMean} hrs</p>
              <p>Median: {avgHoldTimeWinsMedian} hrs</p>
            </>
          }
        />
        <StatLine
          title="Avg. Hold Time (Losses):"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>Mean: {avgHoldTimeLossesMean} hrs</p>
              <p>Median: {avgHoldTimeLossesMedian} hrs</p>
            </>
          }
        />
        <StatLine
          title="Drawdown Duration:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>Days: {drawdownDurationDays}</p>
              <p>Hours: {drawdownDurationHours}</p>
            </>
          }
        />
      </div>
      {/* Trade Direction Metrics */}
      <div style={{ display: "flex" }}>
        <h3>Trade Direction Metrics</h3>
        <StatLine
          title="Long Short Ratio:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>Long Trades: {longPercentage}%</p>
              <p>Short Trades: {shortPercentage}%</p>
            </>
          }
        />
        <StatLine
          title="Long Win Percentage:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{longWinPercentage}%</p>
            </>
          }
        />
        <StatLine
          title="Short Win Percentage:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{shortWinPercentage}%</p>
            </>
          }
        />
        <StatLine
          title="Pip Gain/Loss:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{totalPipGainLoss}</p>
            </>
          }
        />
      </div>
      {/* Market Behavior */}
      <div style={{ display: "flex" }}>
        <h3>Market Behavior</h3>
        <StatLine
          title="Avg. Payoff Ratio:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{averagePayoffRatio}</p>
            </>
          }
        />
        <StatLine
          title="Avg. % Move:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{averagePercentMove}%</p>
            </>
          }
        />
        <StatLine
          title="Avg. % Risked:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{averagePercentRisked}%</p>
            </>
          }
        />
        <StatLine
          title="Skewness : Kurtosis"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>
                {skewness} : {kurtosis}
              </p>
            </>
          }
        />
      </div>
      {/* Risk Metrics */}
      <div style={{ display: "flex" }}>
        <h3>Risk Metrics</h3>
        <StatLine
          title="Trade P/L Standard Deviation:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {formatCurrency(standardDeviationDollar)}</p>
              <p>(R:R): {standardDeviationRR}</p>
            </>
          }
        />
        <StatLine
          title="Value at Risk:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{VaR}</p>
            </>
          }
        />
        <StatLine
          title="Conditional Value at Risk:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{CVaR}</p>
            </>
          }
        />
        <StatLine
          title="Ulcer Index:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{ulcerIndex}</p>
            </>
          }
        />
      </div>
      {/* Advanced Risk Metrics */}
      <div style={{ display: "flex" }}>
        <h3>Advanced Risk Metrics</h3>
        <StatLine
          title="Max Drawdown:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>
                ($): {formatCurrency(maxDrawdownDollar)} ({drawdownPercentPL}%)
              </p>
              <p>
                (R:R): {maxDrawdownRR} ({drawdownPercentRR}%)
              </p>
            </>
          }
        />
        <StatLine
          title="Avg. Max Favorable Excursion Ratio:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{avgMaxFavorableExcursion}</p>
            </>
          }
        />
        <StatLine
          title="Avg. Max Adverse Excursion Ratio:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{avgMaxAdverseExcursion}</p>
            </>
          }
        />
        <StatLine
          title="Avg. Profitability per Long:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {formatCurrency(avgProfitLongDollar)}</p>
              <p>(R:R): {avgProfitLongRR}</p>
            </>
          }
        />
        <StatLine
          title="Avg. Profitability per Short:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {formatCurrency(avgProfitShortDollar)}</p>
              <p>(R:R): {avgProfitShortRR}</p>
            </>
          }
        />
      </div>
      {/* Trading Strategy Quality */}
      <div style={{ display: "flex" }}>
        <h3>Trading Strategy Quality</h3>
        <StatLine
          title="System Quality Number:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {sqnDollar}</p>
              <p>(R:R): {sqnRR}</p>
            </>
          }
        />
        <StatLine
          title="Profit Factor:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{profitFactor}</p>
            </>
          }
        />
        <StatLine
          title="K-Ratio:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{kRatio}</p>
            </>
          }
        />
        <StatLine
          title="Kelly Percentage:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>{kellyPercentage}%</p>
            </>
          }
        />
      </div>
      {/* Extreme Outcomes and Cost Metrics */}
      <div style={{ display: "flex" }}>
        <h3>Extreme Outcomes and Cost Metrics</h3>
        <StatLine
          title="Net Drawdown:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {formatCurrency(netDrawdownDollar)}</p>
              <p>(%): {netDrawdownPercent}%</p>
            </>
          }
        />
        <StatLine
          title="Comission/Slippage Costs:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>Total ($): {formatCurrency(totalCommission)}</p>
              <p>Avg.: {formatCurrency(avgCommissionPercent)}</p>
            </>
          }
        />
        <StatLine
          title="Largest Gain:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {formatCurrency(largestGainDollar)}</p>
              <p>(R:R): {largestGainRR}</p>
            </>
          }
        />
        <StatLine
          title="Largest Loss:"
          style={{ flexBasis: "25%" }}
          stats={
            <>
              <p>($): {formatCurrency(largestLossDollar)}</p>
              <p>(R:R): {largestLossRR}</p>
            </>
          }
        />
      </div>
    </div>
  );
};

export default TradeStatistics;
