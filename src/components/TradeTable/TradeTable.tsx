// TradeTable.tsx
import React from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
// Import trade interface
import { Trade } from "../../models/TradeTypes";

interface TradeTableProps {
  trades: Trade[];
}

const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  return (
    <table>
      <TableHeader />
      <tbody>
        {trades.map((trade, index) => (
          <TableRow key={index} trade={trade} />
        ))}
      </tbody>
    </table>
  );
};

export default TradeTable;
