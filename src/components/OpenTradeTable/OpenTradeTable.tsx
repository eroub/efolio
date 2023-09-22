// TradeTable.tsx
import React from "react";
import styled from "styled-components";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
// Import trade interface
import { Trade } from "../../models/TradeTypes";

interface TradeTableProps {
  trades: Trade[];
}

const StyledTable = styled.table`
  border-collapse: collapse;
  min-width: 100%;
  font-size: 16px;

  @media (max-width: 768px) {
    display: block;
    font-size: 14px; // reduce font-size for smaller screens
    overflow-x: auto;
  }
`;

const OpenTradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  return (
    <StyledTable>
      <TableHeader />
      <tbody>
        {trades.map((trade, index) => (
          <TableRow key={index} trade={trade} />
        ))}
      </tbody>
    </StyledTable>
  );
};

export default OpenTradeTable;
