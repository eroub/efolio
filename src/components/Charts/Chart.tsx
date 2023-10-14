import React from "react";
import Grid from "@mui/material/Grid";
// Trade Interface
import { Trade } from "../../models/TradeTypes";
// Import Charts
import ComparisonChart from "./ComparisonBarChart";
import CumulativePLChart from "./CumulativePLLineChart";
import PairPerformanceChart from "./PairPerformanceBarChart";
import WinLossPieChart from "./WinLossPieChart";

interface ChartsProps {
  closedTrades: Trade[];
}

const Charts: React.FC<ChartsProps> = ({ closedTrades }) => {
  return (
    <div>
      <h2>Performance Charts</h2>
      <Grid container>
        <Grid item xs={5}>
          <CumulativePLChart trades={closedTrades} mode="$" />
          <CumulativePLChart trades={closedTrades} mode="R:R" />
        </Grid>
        <Grid
          item
          xs={2}
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <WinLossPieChart trades={closedTrades} />
          <ComparisonChart trades={closedTrades} mode="$" />
          <ComparisonChart trades={closedTrades} mode="R:R" />
        </Grid>

        <Grid item xs={5}>
          <PairPerformanceChart trades={closedTrades} mode="$" />
          <PairPerformanceChart trades={closedTrades} mode="R:R" />
        </Grid>
      </Grid>
    </div>
  );
};

export default Charts;
