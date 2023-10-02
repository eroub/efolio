import React from "react";
// Trade Interface
import { Trade } from "../../models/TradeTypes";
// Import Charts
import WinLossPieChart from "./WinLossPieChart";
import RRBarChart from "./RRComparisonBarChart";
import CumulativePLChart from "./CumulativePLLineChart";
import PairPerformanceChart from "./PairPerformanceBarChart";

interface ChartsProps {
  closedTrades: Trade[];
}

const Charts: React.FC<ChartsProps> = ({ closedTrades }) => {
  return (
    <div>
      <h2>Performance Charts</h2>
      <WinLossPieChart trades={closedTrades} />
      <RRBarChart trades={closedTrades} />
      <CumulativePLChart trades={closedTrades} mode="$" />
      <CumulativePLChart trades={closedTrades} mode="R:R" />
      <PairPerformanceChart trades={closedTrades} mode="$" />
      <PairPerformanceChart trades={closedTrades} mode="R:R" />
    </div>
  );
};

export default Charts;
