import React, { useState } from "react";
import { SelectChangeEvent } from "@mui/material";
// Trade Interface
import { Trade } from "../../models/TradeTypes";
// Import Charts
import CorrelationMatrix from "./CorrelationMatrix";
import CumulativePLChart from "./CumulativePLLineChart";
import EquityCurve from "./EquityCurve";
import MovingAverageTradePerformance from "./MovingAverageTradePerformance";
import RealizedRRHistogram from "./RRHistogram";
import RiskRewardScatterPlot from "./RiskRewardScatterPlot";
import TradePerformanceHeatmap from "./TradePerformanceHeatmap";
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

  // Moving Average Mode State
  const [movingAvgMode, setMovingAvgMode] = useState<string>("R:R");
  const handlemovingAvgModeChange = (event: SelectChangeEvent<string>) => {
    setMovingAvgMode(event.target.value);
  };

  return (
    <div>
      {/* Net Cumulative P/L Chart */}
      <h3>
        Net Cumulative P/L (
        <ModeSelection
          comparisonMode={cumulativeMode}
          handleComparisonModeChange={handleCumulativeModeChange}
        />
        )
      </h3>
      <CumulativePLChart trades={closedTrades} mode={cumulativeMode} />

      {/* Equity Curve */}
      <h3>Equity Curve</h3>
      <EquityCurve trades={closedTrades} />

      {/* Risk : Reward Moving Average */}
      <h3>
        Risk : Reward Moving Average (
        <ModeSelection
          comparisonMode={movingAvgMode}
          handleComparisonModeChange={handlemovingAvgModeChange}
        />
        )
      </h3>
      <MovingAverageTradePerformance trades={closedTrades} mode={movingAvgMode} />

      {/* Risk : Reward Histogram */}
      <h3>Risk : Reward Histogram</h3>
      <RealizedRRHistogram trades={closedTrades} />

      {/* Risk-Reward Scatter Plot */}
      <h3>Risk : Reward Scatter Plot</h3>
      <RiskRewardScatterPlot trades={closedTrades} />

      {/* Trade Performance Heatmap */}
      <h3>Trade Performance Heatmap</h3>
      <TradePerformanceHeatmap trades={closedTrades} />

      {/* Correlation Matrix */}
      <h3>Correlation Matrix</h3>
      <CorrelationMatrix trades={closedTrades} />
    </div>
  );
};

export default Charts;
