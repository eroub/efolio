import React from "react";
import styled from "styled-components";
// Global Style
import { useCurrentTheme } from "../../hooks/useAppColorScheme";
import { colorScheme } from "../../assets/themes";
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

const Td = styled.td<TdProps>`
  border: 1px solid #dddddd;
  padding: 8px;
  align-items: center;
  justify-content: center;

  color: ${(props) => props.$externalColor || props.theme.color};
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
  // Determine current theme color (dark/light)
  const themeColor = useCurrentTheme();

  // Determine the background color based on the "Real P/L" value
  const highlightColor =
    trade.realPL === null
      ? "transparent"
      : `rgba(${trade.realPL > 0 ? "0, 255, 0" : "255, 0, 0"}, 0.1)`;

  // Highlight "Real P/L" based on value
  const realPLColor =
    trade.realPL === null
      ? "initial"
      : colorScheme[themeColor][trade.realPL > 0 ? "green" : "red"];

  // Coloring for types, dynamically fetch colors based on theme
  type TradeTypeColors = {
    [key: string]:
      | keyof typeof colorScheme.dark
      | keyof typeof colorScheme.light;
  };

  const getTradeColor = (tradeType: string) => {
    const tradeTypeColors: TradeTypeColors = {
      "Low Base": "blue",
      "High Base": "orange",
      "Bear Rally": "purple",
      "Bull Pullback": "darkyellow",
      "Bear Reversal": "darkblue",
      "Bull Reversal": "darkorange",
      Ascending: "magenta",
      Descending: "cyan",
    };

    return tradeType === "News Event"
      ? colorScheme.base["500"]
      : colorScheme[themeColor][
          tradeTypeColors[
            tradeType as keyof typeof tradeTypeColors
          ] as keyof typeof colorScheme.dark
        ] || "initial";
  };
  const tradeTypeColor = trade.type ? getTradeColor(trade.type) : "initial";

  return (
    <StyledTr $highlight={highlightColor}>
      <ConditionalTd show={isTableExpanded}>{trade.id}</ConditionalTd>
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
