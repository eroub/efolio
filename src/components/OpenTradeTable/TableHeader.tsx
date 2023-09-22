// TableHeader.tsx
import React from "react";
import styled from "styled-components";

const Th = styled.th`
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;

  @media (max-width: 768px) {
    padding: 4px; // reduce padding for smaller screens
  }
`;

const TableHeader = () => {
  return (
    <thead>
      <tr>
        <Th>ID</Th>
        <Th>Ticker</Th>
        <Th>Direction</Th>
        <Th>Datetime In</Th>
        <Th>Datetime Out</Th>
        <Th>Total (Hrs)</Th>
        <Th>Equity</Th>
        <Th>Entry</Th>
        <Th>Stop Loss</Th>
        <Th>Target</Th>
        <Th>Size</Th>
        <Th>Risk %</Th>
        <Th>Estimated Gain %</Th>
        <Th>Estimated R:R</Th>
        <Th>Exit Price</Th>
        <Th>Projected P/L</Th>
        <Th>Realized P/L</Th>
        <Th>Commission / Slippage</Th>
        <Th>% Change</Th>
        <Th>Realized R:R</Th>
        <Th>Pip Change</Th>
        <Th>Maximimum Favorable Excursion</Th>
        <Th>Maximimum Adverse Excursion</Th>
        <Th>MFE Ratio</Th>
        <Th>MAE Ratio</Th>
        <Th>Type</Th>
        <Th>Screenshot</Th>
        <Th>Comment</Th>
        {/* Add more table headers here */}
      </tr>
    </thead>
  );
};

export default TableHeader;
