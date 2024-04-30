import React, { useState } from "react";
import { Grid, SelectChangeEvent } from "@mui/material";
// Trade Interface
import { Trade } from "../../models/TradeTypes";
// Import Charts
import CumulativePLChart from "./CumulativePLLineChart";
import PairPerformanceChart from "./PairPerformanceBarChart";
import ProbabilityCurveChart from "./ProbabilityCurveChart";
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
    </div>
  );
};

export default Charts;
