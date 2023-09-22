// TableHeader.tsx
import React from "react";
import styled from "styled-components";
import { DirectionArrows } from "../../assets/Arrows";

const Th = styled.th`
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;

  @media (max-width: 768px) {
    padding: 4px; // reduce padding for smaller screens
  }
`;

const headers = [
  "ID",
  "Ticker",
  "Direction",
  "In Time",
  "Out Time",
  "Hrs",
  "Equity",
  "Entry",
  "S/L",
  "Target",
  "Size",
  "Risk %",
  "Est Gain %",
  "Est R:R",
  "Exit",
  "Proj P/L",
  "Real P/L",
  "Real R:R",
  "Comm/Slip",
  "% Δ",
  "Pip Δ",
  "Max FE",
  "Max AE",
  "MFE R",
  "MAE R",
  "Type",
  "Picture",
  "Comment"
];

const TableHeader = () => {
  return (
    <thead>
      <tr>
        {headers.map((header, index) => (
          <Th key={index}>
            {header === "Direction" ? <DirectionArrows /> : header}
          </Th>
        ))}
      </tr>
    </thead>
  );
};


export default TableHeader;
