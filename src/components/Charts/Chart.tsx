import React, { useState } from "react";
import { Grid, SelectChangeEvent } from "@mui/material";
// Trade Interface
import { Trade } from "../../models/TradeTypes";
// Import Charts
import AverageTradePerformanceByDay from "./AverageTradePerformanceByDay";
import CorrelationMatrix from "./CorrelationMatrix";
import CumulativePLChart from "./CumulativePLLineChart";
import EquityCurve from "./EquityCurve";
import MovingAverageTradePerformance from "./MovingAverageTradePerformance";
import PairPerformanceChart from "./PairPerformanceBarChart";
import ProbabilityCurveChart from "./ProbabilityCurveChart";
import RiskRewardScatterPlot from "./RiskRewardScatterPlot";
import TradePerformanceHeatmap from "./TradePerformanceHeatmap";
import DurationHistogram from "./DurationHistogram";
// Import Custom Selection
import ModeSelection from "../ModeSelection";

interface ChartsProps {
  closedTrades: Trade[];
}

const Charts: React.FC<ChartsProps> = ({ closedTrades }) => {
  // Performance Mode State
  const [cumulativeMode, setCumulativeMode] = useState<string>("R:R");
  const handleCumulativeModeChange = (event: SelectChangeEvent<string>) => {
    setCumulativeMode(event.target.value);
  };
  // Pair Mode State
  const [performanceMode, setPerformanceMode] = useState<string>("R:R");
  const handlePerformanceModeChange = (event: SelectChangeEvent<string>) => {
    setPerformanceMode(event.target.value);
  };
  // Moving Average Mode State
  const [movingAvgMode, setMovingAvgMode] = useState<string>("R:R");
  const handlemovingAvgModeChange = (event: SelectChangeEvent<string>) => {
    setMovingAvgMode(event.target.value);
  };

  return (
    <div>
      {/* Cumulative P/L Chart */}
      <h3>
        Net Cumulative P/L (
        <ModeSelection
          comparisonMode={cumulativeMode}
          handleComparisonModeChange={handleCumulativeModeChange}
        />
        )
      </h3>
      <CumulativePLChart trades={closedTrades} mode={cumulativeMode} />
      {/* Pair Performance Chart */}
      <h3>
        Pair Performance (
        <ModeSelection
          comparisonMode={performanceMode}
          handleComparisonModeChange={handlePerformanceModeChange}
        />
        )
      </h3>
      <PairPerformanceChart trades={closedTrades} mode={performanceMode} />
      {/* Probability Curve */}
      {/* <h3>
        Return Probability Profile
      </h3>
      <ProbabilityCurveChart trades={closedTrades}/> */}
      {/* Duration Historgram */}
      <h3>Trade Duration Histogram</h3>
      <DurationHistogram trades={closedTrades} />
      {/* RiskReward Scatter Plot */}
      <h3>Risk-Reward Scatter Plot</h3>
      <RiskRewardScatterPlot trades={closedTrades} />
      {/* Average Trade Performance By Day */}
      <h3>Average Trade Performance By Day</h3>
      <AverageTradePerformanceByDay trades={closedTrades} />
      {/* Trade Performance Heatmap */}
      <h3>Trade Performance Heatmap</h3>
      <TradePerformanceHeatmap trades={closedTrades} />
      {/* Correlation Matrix */}
      <h3>Correlation Matrix</h3>
      <CorrelationMatrix trades={closedTrades} />
      {/* Equity Curve */}
      <h3>Equity Curve</h3>
      <EquityCurve trades={closedTrades} />
      {/* Moving Average Trade Performance */}
      <h3>
        Moving Average Trade Performance (
          <ModeSelection
          comparisonMode={movingAvgMode}
          handleComparisonModeChange={handlemovingAvgModeChange}
        />
        )
        </h3>
        <MovingAverageTradePerformance trades={closedTrades} mode={movingAvgMode} />
    </div>
  );
};

export default Charts;
