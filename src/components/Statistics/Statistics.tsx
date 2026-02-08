// Statistics.tsx
// External Libraries
import React from "react";
// Internal Utilities / Assets / Themes
import {
  // calculateAverageHoldTime,
  // calculateAverageHoldTimeLosses,
  // calculateAverageHoldTimeWins,
  calculateAverageLoss,
  calculateAveragePayoffRatio,
  calculateAveragePercentMove,
  calculateAveragePercentRisked,
  calculateAverageProfitability,
  calculateAverageProfitabilityPerLong,
  calculateAverageProfitabilityPerShort,
  calculateAverageWin,
  calculateCommissionMetrics,
  // calculateDrawdownDuration,
  calculateKRatio,
  calculateKellyPercentage,
  calculateLargestGain,
  calculateLargestLoss,
  calculateLongShortRatio,
  calculateLongWinPercentage,
  calculateMaxAdverseExcursionRatio,
  calculateMaxConsecutiveLosses,
  calculateMaxConsecutiveWins,
  calculateMaxDrawdown,
  calculateMaxFavorableExcursionRatio,
  calculateNetDrawdown,
  // calculatePipGainLoss, // removed for Polymarket
  calculatePLStandardDeviation,
  calculateProbabilityOfRandomChance,
  calculateProfitFactor,
  calculateShortWinPercentage,
  calculateSkewnessAndKurtosis,
  calculateSystemQualityNumber,
  calculateTotalGainLoss,
  calculateUlcerIndex,
  calculateVaRandCVaR,
  calculateWinsLosses,
} from "../../utils/statisticCalculations";
import { formatCurrency } from "../../utils/formatters";
// Components
import { StatLine, MetricRow } from "./MetricRow";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface StatisticsProps {
  closedTrades: Trade[];
}

// React #31 guard: some stats values are ReactNodes (Fragments with <p> etc). If any leaf
// value accidentally becomes a plain object, React will crash the whole page.
const safeNode = (node: any): any => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") return node;
  if (React.isValidElement(node)) {
    const children: any = (node as any).props?.children;
    if (children !== undefined) {
      return React.cloneElement(node as any, {
        ...(node as any).props,
        children: safeNode(children),
      });
    }
    return node;
  }
  if (Array.isArray(node)) return node.map(safeNode);
  // plain object/function/symbol/etc → stringify to keep UI alive
  try {
    return JSON.stringify(node);
  } catch {
    return String(node);
  }
};

const TradeStatistics: React.FC<StatisticsProps> = ({ closedTrades }) => {
  // Calculate statistics using the utility functions
  const averagePayoffRatio = calculateAveragePayoffRatio(closedTrades);
  const { averageProfitabilityDollar, averageProfitabilityRR } =
    calculateAverageProfitability(closedTrades);
  // Timing removed for Polymarket
  // const { mean: avgHoldTimeLossesMean, median: avgHoldTimeLossesMedian } =
  //   calculateAverageHoldTimeLosses(closedTrades);
  // const { mean: avgHoldTimeMean, median: avgHoldTimeMedian } =
  //   calculateAverageHoldTime(closedTrades);
  // const { mean: avgHoldTimeWinsMean, median: avgHoldTimeWinsMedian } =
  //   calculateAverageHoldTimeWins(closedTrades);
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
  const { totalCommission, avgAdditionalRiskPercent } =
    calculateCommissionMetrics(closedTrades);
  // const { drawdownDurationDays, drawdownDurationHours } =
  //   calculateDrawdownDuration(closedTrades);
  // NOTE: Timing + pip metrics are not meaningful for Polymarket (fixed expiry, binary outcomes)
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
  const { totalGainLossDollar, totalGainLossRR, percentageGainLossDollar } =
    calculateTotalGainLoss(closedTrades);
  // const totalPipGainLoss = calculatePipGainLoss(closedTrades); // removed for Polymarket
  const { wins, losses } = calculateWinsLosses(closedTrades);
  const shortWinPercentage = calculateShortWinPercentage(closedTrades);
  const ulcerIndex = calculateUlcerIndex(closedTrades);
  const { VaR, CVaR } = calculateVaRandCVaR(closedTrades);

  return (
    <div style={{ marginLeft: 0, width: "100%" }}>
      <h2 style={{ display: "flex", alignItems: "center" }}>
        Trade Statistics
      </h2>
      {/* Profitability Metrics */}
      <MetricRow
        groupingTitle="Profitability Metrics"
        statLines={safeNode([
          <StatLine
            title="Total Gain/Loss"
            stats={
              <>
                <p>($): {formatCurrency(totalGainLossDollar)}</p>
                <p>(R:R): {totalGainLossRR}</p>
                <p>(%): {percentageGainLossDollar}%</p>
              </>
            }
          />,
          <StatLine
            title="Avg. Profitability per Trade"
            stats={
              <>
                <p>($): {formatCurrency(averageProfitabilityDollar)}</p>
                <p>(R:R): {averageProfitabilityRR}</p>
              </>
            }
          />,
          <StatLine
            title="Avg. Win"
            stats={
              <>
                <p>($): {formatCurrency(averageWinDollar)}</p>
                <p>(R:R): {averageWinRR}</p>
              </>
            }
          />,
          <StatLine
            title="Avg. Loss"
            stats={
              <>
                <p>($): {formatCurrency(averageLossDollar)}</p>
                <p>(R:R): {averageLossRR}</p>
              </>
            }
          />,
        ])}
      />
      {/* Trade Characteristics */}
      <MetricRow
        groupingTitle="Characteristics"
        statLines={safeNode([
          <StatLine
            title="Wins:Losses"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>
                  {wins} : {losses}
                </p>
              </>
            }
          />,
          <StatLine
            title="Max Consecutive Wins"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{maxConsecutiveWins}</p>
              </>
            }
          />,
          <StatLine
            title="Max Consecutive Losses"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{maxConsecutiveLosses}</p>
              </>
            }
          />,

          <StatLine
            title="Probability of Random Chance"
            tooltip="Assesses the likelihood that your trading system's performance can be attributed to random chance, helping you discern skill from luck."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{probabilityOfRandomChance}%</p>
              </>
            }
          />,
        ])}
      />
      {/* Timing removed for Polymarket (fixed expiries; hold-time stats not meaningful here) */}
      {/* Trade Direction Metrics */}
      <MetricRow
        groupingTitle="Direction Metrics"
        statLines={safeNode([
          <StatLine
            title="Long Short Ratio"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>Long: {longPercentage}%</p>
                <p>Short: {shortPercentage}%</p>
              </>
            }
          />,
          <StatLine
            title="Long Win %"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{longWinPercentage}%</p>
              </>
            }
          />,
          <StatLine
            title="Short Win %"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{shortWinPercentage}%</p>
              </>
            }
          />,
          {/* Pip Gain/Loss removed for Polymarket */}
        ])}
      />
      {/* Trade Behavior */}
      <MetricRow
        groupingTitle="Behavior"
        statLines={safeNode([
          <StatLine
            title="Avg. Payoff Ratio"
            tooltip="Measures the average profit relative to the average loss per trade, guiding you on the system's reward-to-risk efficiency."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{averagePayoffRatio}</p>
              </>
            }
          />,
          <StatLine
            title="Avg. % Move"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{averagePercentMove}%</p>
              </>
            }
          />,
          <StatLine
            title="Avg. % Risked"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{averagePercentRisked}%</p>
              </>
            }
          />,
          <StatLine
            title="Skewness:Kurtosis"
            tooltip="Skewness quantifies the asymmetry in your returns distribution, while kurtosis measures the 'tailedness.' Both help in understanding the distribution's shape and risk."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>
                  {skewness} : {kurtosis}
                </p>
              </>
            }
          />,
        ])}
      />
      {/* Risk Metrics */}
      <MetricRow
        groupingTitle="Risk Metrics"
        statLines={safeNode([
          <StatLine
            title="P/L Standard Deviation"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>($): {formatCurrency(standardDeviationDollar)}</p>
                <p>(R:R): {standardDeviationRR}</p>
              </>
            }
          />,
          <StatLine
            title="Value at Risk"
            tooltip="Quantifies the maximum potential loss over a specified time period at a given confidence level, serving as a risk management tool."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{VaR}</p>
              </>
            }
          />,
          <StatLine
            title="Conditional VaR"
            tooltip="Unlike VaR, which considers losses up to a certain confidence level, CVaR estimates the expected loss beyond that level, providing a more comprehensive risk assessment."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{CVaR}</p>
              </>
            }
          />,
          <StatLine
            title="Ulcer Index"
            tooltip="Measures the depth and duration of percentage drawdowns in performance, offering a more detailed view of potential declines than standard deviation."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{ulcerIndex}</p>
              </>
            }
          />,
        ])}
      />
      {/* Advanced Risk Metrics */}
      <MetricRow
        groupingTitle="Advanced Risk Metrics"
        statLines={safeNode([
          <StatLine
            title="Max Drawdown"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>
                  ($): {formatCurrency(maxDrawdownDollar)} ({drawdownPercentPL}
                  %)
                </p>
                <p>
                  (R:R): {maxDrawdownRR} ({drawdownPercentRR}%)
                </p>
              </>
            }
          />,
          <StatLine
            title="Avg. MFE:MAE Ratios"
            tooltip="Compares the average Maximum Favorable Excursion (potential profit) to the Maximum Adverse Excursion (potential loss), providing insights into trade optimization."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>
                  {avgMaxFavorableExcursion} : {avgMaxAdverseExcursion}
                </p>
              </>
            }
          />,
          <StatLine
            title="Avg. Profitability per Long"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>($): {formatCurrency(avgProfitLongDollar)}</p>
                <p>(R:R): {avgProfitLongRR}</p>
              </>
            }
          />,
          <StatLine
            title="Avg. Profitability per Short"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>($): {formatCurrency(avgProfitShortDollar)}</p>
                <p>(R:R): {avgProfitShortRR}</p>
              </>
            }
          />,
        ])}
      />
      {/* Trading Strategy Quality */}
      <MetricRow
        groupingTitle="Trading Strategy Quality"
        statLines={safeNode([
          <StatLine
            title="System Quality Number"
            tooltip="A single metric that evaluates the performance, risk, and consistency of a trading system, useful for comparing different strategies."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>($): {sqnDollar}</p>
                <p>(R:R): {sqnRR}</p>
              </>
            }
          />,
          <StatLine
            title="Profit Factor"
            tooltip="The ratio of gross profit to gross loss, offering a quick snapshot of a system's profitability potential."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{profitFactor}</p>
              </>
            }
          />,
          <StatLine
            title="K-Ratio"
            tooltip="Evaluates the consistency of a system's returns over time, helping to identify the sustainability of a trading strategy."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{kRatio}</p>
              </>
            }
          />,
          <StatLine
            title="Kelly %"
            tooltip="Calculates the optimal size of a series of bets to maximize the logarithm of wealth, aiding in optimal capital allocation for trades."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>{kellyPercentage}%</p>
              </>
            }
          />,
        ])}
      />
      {/* Extreme Outcomes & Cost Metrics */}
      <MetricRow
        groupingTitle="Extreme Outcomes & Cost Metrics"
        statLines={safeNode([
          <StatLine
            title="Net Drawdown"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>($): {formatCurrency(netDrawdownDollar)}</p>
                <p>(%): {netDrawdownPercent}%</p>
              </>
            }
          />,
          <StatLine
            title="Comm/Slip"
            tooltip="Avg. % represents the average additional percentage of your equity at risk due to commission and slippage costs. It quantifies how much these trading costs inflate the percentage of your capital exposed to loss."
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>Total ($): {formatCurrency(totalCommission)}</p>
                <p>Avg. (%): {avgAdditionalRiskPercent}%</p>
              </>
            }
          />,
          <StatLine
            title="Largest Gain"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>($): {formatCurrency(largestGainDollar)}</p>
                <p>(R:R): {largestGainRR}</p>
              </>
            }
          />,
          <StatLine
            title="Largest Loss"
            style={{ flexBasis: "25%" }}
            stats={
              <>
                <p>($): {formatCurrency(largestLossDollar)}</p>
                <p>(R:R): {largestLossRR}</p>
              </>
            }
          />,
        ])}
      />
    </div>
  );
};

export default TradeStatistics;
