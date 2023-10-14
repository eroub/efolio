// TradeTable.tsx
// External Libraries
import React, { useState, useMemo } from "react";
import styled from "styled-components";
// Components
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
// Internal Utilities / Assets / Themes
import { Expand, Shrink } from "../../assets/Arrows";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface TradeTableProps {
  trades: Trade[];
}

// Button that shows/hides columns
const ColumnButton = styled.button`
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
    font-size: 8px;
    z-index: 10;
  }
`;

// Button that shows/hides rows
const RowButton = styled.button`
  background: rgba(0, 0, 0, 0.1); // Light background
  border: none;
  cursor: pointer;
  text-align: center;
  width: 100%;
  padding: 10px 0;
  font-size: 20px;
  color: #333; // Darker color for better visibility
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2); // subtle box-shadow
  transition:
    color 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;

  &:hover {
    color: #111; // Darken text on hover
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3); // Intensify box-shadow on hover
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
  // New state for row expansion
  const [showAllRows, setShowAllRows] = useState(false); // Initial state is to hide all but the most recent 5 trades

  // Use useMemo to derive sorted trades only when trades change
  const memoizedTrades = useMemo(() => {
    return [...trades].sort((a, b) => b.id - a.id);
  }, [trades]);

  // Toggle for showing/hiding columns
  const toggleColumns = () => {
    setTableExpanded(!isTableExpanded);
  };
  // Toggle for showing/hiding columsn
  const toggleRows = () => {
    setShowAllRows(!showAllRows);
  };

  return (
    <div>
      <h3 style={{ display: "flex", alignItems: "center", marginLeft: "15px" }}>
        Completed Trades
        <ColumnButton
          onClick={toggleColumns}
          data-tooltip={isTableExpanded ? "Hide Details" : "Show Details"}
        >
          {isTableExpanded ? (
            <Shrink style={{ marginLeft: "10px" }} />
          ) : (
            <Expand style={{ marginLeft: "10px" }} />
          )}
        </ColumnButton>
      </h3>
      <StyledTable>
        <TableHeader isTableExpanded={isTableExpanded} />
        <tbody>
          {memoizedTrades
            .slice(0, showAllRows ? memoizedTrades.length : 5)
            .map((trade, index) => (
              <TableRow
                key={index}
                trade={trade}
                isTableExpanded={isTableExpanded}
              />
            ))}
        </tbody>
      </StyledTable>
      {memoizedTrades.length > 5 && (
        <RowButton onClick={toggleRows}>
          {showAllRows ? "Hide" : "Show All"}
        </RowButton>
      )}
    </div>
  );
};

export default ClosedTradeTable;
