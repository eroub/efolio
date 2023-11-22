// TableHeader.tsx
// External Libraries
import React from "react";
import styled from "styled-components";
// Internal Utilities / Assets / Themes
import { DirectionArrows } from "../../assets/Arrows";

interface TableHeaderProps {
  isTableExpanded: boolean;
}

const Th = styled.th`
  border: 1px solid #dddddd;
  // text-align: left;
  padding: 8px;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 4px; // reduce padding for smaller screens
  }
`;

const headers = [
  "#",
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
  "Comment",
];

const TableHeader: React.FC<TableHeaderProps> = ({ isTableExpanded }) => {
  const columnsToHide = [
    "#",
    "In Time",
    "Out Time",
    "Equity",
    "Entry",
    "S/L",
    "Target",
    "Size",
    "Exit",
    "Max FE",
    "Max AE",
  ];

  return (
    <thead>
      <tr>
        {headers.map((header, index) => {
          if (isTableExpanded || !columnsToHide.includes(header)) {
            return (
              <Th key={index}>
                {header === "Direction" ? <DirectionArrows /> : header}
              </Th>
            );
          } else {
            return null;
          }
        })}
      </tr>
    </thead>
  );
};
export default TableHeader;
