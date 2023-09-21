import React from "react";
import styled from 'styled-components';
import { simplifyDate } from "../../utils/dateManipulation"; // Import function to convert datetime object
import { Trade } from "../../models/TradeTypes"; // Import partial trade interface

interface TableRowProps {
  trade: Trade;
}

const Td = styled.td`
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;

  @media (max-width: 768px) {
    padding: 4px;  // reduce padding for smaller screens
  }
`;

const TableRow: React.FC<TableRowProps> = ({ trade }) => {
  return (
    <tr>
      <Td>{trade.id}</Td> {/* Note: Field names should match the interface */}
      <Td>{trade.ticker}</Td>
      <Td>{trade.direction}</Td>
      <Td>{simplifyDate(trade.datetimeIn)}</Td>
      <Td>{simplifyDate(trade.datetimeOut)}</Td>
      <Td>{trade.totalHrs}</Td>
      <Td>${trade.equity}</Td>
      <Td>{trade.entry}</Td>
      <Td>{trade.stopLoss}</Td>
      <Td>{trade.target}</Td>
      <Td>{trade.size}</Td>
      <Td>{trade.risk}%</Td>
      <Td>{trade.estGain}</Td>
      <Td>{trade.estRR}</Td>
      <Td>{trade.exit}</Td>
      <Td>{trade.projPL}</Td>
      <Td>{trade.realPL}</Td>
      <Td>{trade.commission}</Td>
      <Td>{trade.percentChange}</Td>
      <Td>{trade.realRR}</Td>
      <Td>{trade.pips}</Td>
      <Td>{trade.mfe}</Td>
      <Td>{trade.mae}</Td>
      <Td>{trade.mfeRatio}</Td>
      <Td>{trade.maeRatio}</Td>
      <Td>{trade.type}</Td>
      <Td>{trade.screenshot}</Td>
      <Td>{trade.comment}</Td>
    </tr>
  );
};

export default TableRow;
