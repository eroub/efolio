// TradeTable.tsx
import React from "react";
import styled from "styled-components";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
// Import trade interface
import { Trade } from "../../models/TradeTypes";

interface TradeTableProps {
  trades: Trade[];
  isTableExpanded: boolean;
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

  th,
  td {
    padding: 6px;
  }
`;

const ClosedTradeTable: React.FC<TradeTableProps> = ({
  trades,
  isTableExpanded,
}) => {
  return (
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
  );
};

export default ClosedTradeTable;
