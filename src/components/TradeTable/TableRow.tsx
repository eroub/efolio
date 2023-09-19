import React from "react";
import { simplifyDate } from "../../utils/dateManipulation"; // Import function to convert datetime object
import { Trade } from "../../models/TradeTypes"; // Import partial trade interface

interface TableRowProps {
  trade: Trade;
}

const TableRow: React.FC<TableRowProps> = ({ trade }) => {
  return (
    <tr>
      <td>{trade.id}</td> {/* Note: Field names should match the interface */}
      <td>{trade.ticker}</td>
      <td>{trade.direction}</td>
      <td>{simplifyDate(trade.datetimeIn)}</td>
      <td>{simplifyDate(trade.datetimeOut)}</td>
      <td>{trade.totalHrs}</td>
      <td>{trade.equity}</td>
      <td>{trade.entry}</td>
      <td>{trade.stopLoss}</td>
      <td>{trade.target}</td>
      <td>{trade.size}</td>
      <td>{trade.risk}</td>
      <td>{trade.estGain}</td>
      <td>{trade.estRR}</td>
      <td>{trade.exit}</td>
      <td>{trade.projPL}</td>
      <td>{trade.realPL}</td>
      <td>{trade.commission}</td>
      <td>{trade.percentChange}</td>
      <td>{trade.realRR}</td>
      <td>{trade.pips}</td>
      <td>{trade.mfe}</td>
      <td>{trade.mae}</td>
      <td>{trade.mfeRatio}</td>
      <td>{trade.maeRatio}</td>
      <td>{trade.type}</td>
      <td>{trade.screenshot}</td>
      <td>{trade.comment}</td>
    </tr>
  );
};

export default TableRow;
