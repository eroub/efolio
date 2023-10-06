import React from "react";
import styled from "styled-components";
import { humanReadFormatDate } from "../../utils/dates"; // Import function to convert datetime object
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

interface TdProps {
  color?: string;
  $externalColor?: string;
}

const isDarkMode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;
const Td = styled.td<TdProps>`
  border: 1px solid #dddddd;
  padding: 8px;
  align-items: center;
  justify-content: center;

  color: ${(props) =>
    props.$externalColor || (isDarkMode ? "#E6E3D3" : "initial")};
  font-weight: ${(props) => (props.color ? "bold" : "normal")};

  @media (max-width: ${breakpoints.medium}) {
    padding: 4px; // reduce padding for smaller screens
  }
`;

const StyledTr = styled.tr<{ $highlight: string }>`
  background-color: ${(props) => props.$highlight};
`;

// Smaller components for conditional rendering
const ConditionalTd: React.FC<{ show: boolean; children: React.ReactNode }> = ({
  show,
  children,
}) => {
  return show ? <Td>{children}</Td> : null;
};

const TableRow: React.FC<TableRowProps> = ({ trade, isTableExpanded }) => {
  // Determine the background color based on the "Real P/L" value
  const highlightColor =
    trade.realPL === null
      ? "transparent"
      : trade.realPL > 0
      ? "rgba(0, 255, 0, 0.1)"
      : "rgba(255, 0, 0, 0.1)";
  // Highlight "Real P/L" based on value
  const realPLColor =
    trade.realPL === null ? "initial" : trade.realPL > 0 ? "green" : "red";
  // Coloring for types
  const tradeTypeColors = {
    "Low Base": "blue",
    "High Base": "orange",
    "Bear Rally": "purple",
    "Bull Pullback": "darkyellow",
    "Bear Reversal": "darkblue",
    "Bull Reversal": "darkorange",
    "Ascending": "magenta",
    "Descending": "cyan",
    "News Event": "grey",
  };
  const tradeTypeColor = trade.type
    ? (tradeTypeColors as { [key: string]: string })[trade.type]
    : "initial";

  return (
    <StyledTr $highlight={highlightColor}>
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
      <Td $externalColor={realPLColor}>{formatCurrency(trade.realPL)}</Td>
      <Td>{trade.realRR}</Td>
      <Td>{formatCurrency(trade.commission)}</Td>
      <Td>{formatPercentage(trade.percentChange)}</Td>
      <Td>{trade.pips}</Td>
      <ConditionalTd show={isTableExpanded}>{trade.mfe}</ConditionalTd>
      <ConditionalTd show={isTableExpanded}>{trade.mae}</ConditionalTd>
      <Td>{trade.mfeRatio}</Td>
      <Td>{trade.maeRatio}</Td>
      <Td $externalColor={tradeTypeColor}>{trade.type}</Td>
      <Td>
        {trade.screenshot ? (
          <a href={trade.screenshot} target="_blank" rel="noopener noreferrer">
            <Polaroid />
          </a>
        ) : null}
      </Td>
      <Td>{trade.comment}</Td>
    </StyledTr>
  );
};

export default TableRow;
