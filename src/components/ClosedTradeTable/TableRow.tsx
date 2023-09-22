import React from "react";
import styled from "styled-components";
import { humanReadFormatDate } from "../../utils/dateManipulation"; // Import function to convert datetime object
import {
  formatCurrency,
  formatPercentage,
  formatSizeInK,
} from "../../utils/formatters";
import { Trade } from "../../models/TradeTypes"; // Import partial trade interface
// Assets
import { GreenUpArrow, RedDownArrow } from "../../assets/Arrows";
import { Polaroid } from "../../assets/Polaroid";
import { breakpoints } from "../../assets/breakpoints";

interface TableRowProps {
  trade: Trade;
  isTableExpanded: boolean;
}

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

// Smaller components for conditional rendering
const ConditionalTd: React.FC<{ show: boolean; children: React.ReactNode }> = ({
  show,
  children,
}) => {
  return show ? <Td>{children}</Td> : null;
};

const TableRow: React.FC<TableRowProps> = ({ trade, isTableExpanded }) => {
  return (
    <tr>
      <Td>{trade.id}</Td>
      <Td>{trade.ticker}</Td>
      <Td>
        {trade.direction === "Long" ? (
          <GreenUpArrow />
        ) : trade.direction === "Short" ? (
          <RedDownArrow />
        ) : null}
      </Td>
      <ConditionalTd show={isTableExpanded}>
        {humanReadFormatDate(trade.datetimeIn)}
      </ConditionalTd>
      <ConditionalTd show={isTableExpanded}>
        {humanReadFormatDate(trade.datetimeOut)}
      </ConditionalTd>
      <Td>{trade.totalHrs}</Td>
      <ConditionalTd show={isTableExpanded}>
        {formatCurrency(trade.equity)}
      </ConditionalTd>
      <ConditionalTd show={isTableExpanded}>{trade.entry}</ConditionalTd>
      <ConditionalTd show={isTableExpanded}>{trade.stopLoss}</ConditionalTd>
      <ConditionalTd show={isTableExpanded}>{trade.target}</ConditionalTd>
      <ConditionalTd show={isTableExpanded}>
        {formatSizeInK(trade.size)}
      </ConditionalTd>
      <Td>{formatPercentage(trade.risk)}</Td>
      <Td>{formatPercentage(trade.estGain)}</Td>
      <Td>{trade.estRR}</Td>
      <ConditionalTd show={isTableExpanded}>{trade.exitPrice}</ConditionalTd>
      <Td>{formatCurrency(trade.projPL)}</Td>
      <Td>{formatCurrency(trade.realPL)}</Td>
      <Td>{trade.realRR}</Td>
      <Td>{formatCurrency(trade.commission)}</Td>
      <Td>{formatPercentage(trade.percentChange)}</Td>
      <Td>{trade.pips}</Td>
      <ConditionalTd show={isTableExpanded}>{trade.mfe}</ConditionalTd>
      <ConditionalTd show={isTableExpanded}>{trade.mae}</ConditionalTd>
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
