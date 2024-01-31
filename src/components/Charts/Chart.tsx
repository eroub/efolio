import React, { useState } from "react";
import { Grid, SelectChangeEvent } from "@mui/material";
// Trade Interface
import { Trade } from "../../models/TradeTypes";
// Import Charts
import CumulativePLChart from "./CumulativePLLineChart";
import PairPerformanceChart from "./PairPerformanceBarChart";
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
      <Grid container>
        <Grid item xs={6}>
          <h3>
            Net Cumulative P/L (
            <ModeSelection
              comparisonMode={cumulativeMode}
              handleComparisonModeChange={handleCumulativeModeChange}
            />
            )
          </h3>
          <CumulativePLChart trades={closedTrades} mode={cumulativeMode} />
        </Grid>
        <Grid item xs={6}>
          <h3>
            Pair Performance (
            <ModeSelection
              comparisonMode={performanceMode}
              handleComparisonModeChange={handlePerformanceModeChange}
            />
            )
          </h3>
          <PairPerformanceChart trades={closedTrades} mode={performanceMode} />
        </Grid>
      </Grid>
    </div>
  );
};

export default Charts;
