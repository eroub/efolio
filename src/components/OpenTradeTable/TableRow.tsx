import React from "react";
import styled from "styled-components";
import { humanReadFormatDate } from "../../utils/dateManipulation"; // Import function to convert datetime object
import { Trade } from "../../models/TradeTypes"; // Import partial trade interface
// Assets
import { GreenUpArrow, RedDownArrow } from "../../assets/Arrows";
import { Polaroid } from "../../assets/Polaroid";
import { breakpoints } from "../../assets/breakpoints";

interface TableRowProps {
  trade: Trade;
}

const formatSizeInK = (size: number | null) => {
  if (size === null) return null;
  return `${(size / 1000).toFixed(1)}K`;
};

const Td = styled.td`
  border: 1px solid #dddddd;
  // text-align: left;
  padding: 8px;
  align-items: center;
  justify-content: center;


  @media (max-width: ${breakpoints.medium}) {
    padding: 4px; // reduce padding for smaller screens
  }
`;

const TableRow: React.FC<TableRowProps> = ({ trade }) => {
  return (
    <tr>
      <Td>{trade.id}</Td> {/* Note: Field names should match the interface */}
      <Td>{trade.ticker}</Td>
      <Td>
        {trade.direction === 'Long' ? <GreenUpArrow /> : trade.direction === 'Short' ? <RedDownArrow /> : null}
      </Td>
      <Td>{humanReadFormatDate(trade.datetimeIn)}</Td>
      <Td>{humanReadFormatDate(trade.datetimeOut)}</Td>
      <Td>{trade.totalHrs}</Td>
      <Td>
        {trade.equity !== null && trade.equity !== undefined
          ? `$${trade.equity}`
          : ""}
      </Td>
      <Td>{trade.entry}</Td>
      <Td>{trade.stopLoss}</Td>
      <Td>{trade.target}</Td>
      <Td>{formatSizeInK(trade.size)}</Td>
      <Td>
        {trade.risk !== null && trade.risk !== undefined
          ? `${trade.risk}%`
          : ""}
      </Td>
      <Td>
        {trade.estGain !== null && trade.estGain !== undefined
          ? `${trade.estGain}%`
          : ""}
      </Td>
      <Td>{trade.estRR}</Td>
      <Td>{trade.exitPrice}</Td>
      <Td>
        {trade.projPL !== null && trade.projPL !== undefined
          ? trade.projPL >= 0
            ? `$${trade.projPL}`
            : `-$${Math.abs(trade.projPL)}`
          : ""}
      </Td>
      <Td>
        {trade.realPL !== null && trade.realPL !== undefined
          ? trade.realPL >= 0
            ? `$${trade.realPL}`
            : `-$${Math.abs(trade.realPL)}`
          : ""}
      </Td>
      <Td>{trade.realRR}</Td>
      <Td>
        {trade.commission !== null && trade.commission !== undefined
          ? trade.commission >= 0
            ? `$${trade.commission}`
            : `-$${Math.abs(trade.commission)}`
          : ""}
      </Td>
      <Td>
        {trade.percentChange !== null && trade.percentChange !== undefined
          ? `${trade.percentChange}%`
          : ""}
      </Td>
      <Td>{trade.pips}</Td>
      <Td>{trade.mfe}</Td>
      <Td>{trade.mae}</Td>
      <Td>{trade.mfeRatio}</Td>
      <Td>{trade.maeRatio}</Td>
      <Td>{trade.type}</Td>
      <Td>
        {trade.screenshot ? (
          <a href={trade.screenshot} target="_blank" rel="noopener noreferrer">
            <Polaroid />
          </a>
        ) : null}
      </Td>
      <Td>{trade.comment}</Td>
    </tr>
  );
};

export default TableRow;
