import React from "react";
// Import partial trade interface
import { Trade } from "../../models/TradeTypes";

interface TableRowProps {
  trade: Trade;
}

const TableRow: React.FC<TableRowProps> = ({ trade }) => {
  return (
    <tr>
      <td>{trade.id}</td> {/* Note: Field names should match the interface */}
      <td>{trade.ticker}</td>
      <td>{trade.direction}</td>
      {/* Add more table cells here */}
    </tr>
  );
};

export default TableRow;
