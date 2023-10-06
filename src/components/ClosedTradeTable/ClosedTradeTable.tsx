// TradeTable.tsx
import React, { useState } from "react";
import styled from "styled-components";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
// Import trade interface
import { Trade } from "../../models/TradeTypes";
// Expand/Shrink SVGs
import { Expand, Shrink } from "../../assets/Arrows";

interface TradeTableProps {
  trades: Trade[];
}

const ExpandShrinkButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  width: 26px; /* Same width as your SVG */
  height: 26px; /* Same height as your SVG */
  cursor: pointer;
  outline: none;

  /* Tooltip styling */
  position: relative;

  &:hover::before {
    content: attr(data-tooltip);
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 5px;
    border-radius: 3px;
    font-size: 12px;
    z-index: 10;
  }
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  min-width: 100%;
  font-size: 16px;

  @media (max-width: 768px) {
    display: block;
    font-size: 14px; // reduce font-size for smaller screens
    overflow-x: auto;
  }

  th,
  td {
    padding: 6px;
  }
`;

const ClosedTradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  // Table shrink/expand state
  const [isTableExpanded, setTableExpanded] = useState(false); // Initial state is 'Shrunk'
  const toggleTable = () => {
    setTableExpanded(!isTableExpanded);
  };

  return (
    <div>
      <h3 style={{ display: "flex", alignItems: "center", marginLeft: "15px" }}>
        Completed Trades
        <ExpandShrinkButton
          onClick={toggleTable}
          data-tooltip={isTableExpanded ? "Hide Details" : "Show Details"}
        >
          {isTableExpanded ? (
            <Shrink style={{ marginLeft: "10px" }} />
          ) : (
            <Expand style={{ marginLeft: "10px" }} />
          )}
        </ExpandShrinkButton>
      </h3>
      <StyledTable>
        <TableHeader isTableExpanded={isTableExpanded} />
        <tbody>
          {trades.map((trade, index) => (
            <TableRow
              key={index}
              trade={trade}
              isTableExpanded={isTableExpanded}
            />
          ))}
        </tbody>
      </StyledTable>
    </div>
  );
};

export default ClosedTradeTable;
