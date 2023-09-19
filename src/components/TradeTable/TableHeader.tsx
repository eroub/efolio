// TableHeader.tsx
import React from "react";

const TableHeader = () => {
  return (
    <thead>
      <tr>
        <th>ID</th>
        <th>Ticker</th>
        <th>Direction</th>
        <th>Datetime In</th>
        <th>Datetime Out</th>
        <th>Total (Hrs)</th>
        <th>Equity</th>
        <th>Entry</th>
        <th>Stop Loss</th>
        <th>Target</th>
        <th>Size</th>
        <th>Risk %</th>
        <th>Estimated Gain %</th>
        <th>Estimated R:R</th>
        <th>Exit Price</th>
        <th>Projected P/L</th>
        <th>Realized P/L</th>
        <th>Commission / Slippage</th>
        <th>% Change</th>
        <th>Realized R:R</th>
        <th>Pip Change</th>
        <th>Maximimum Favorable Excursion</th>
        <th>Maximimum Adverse Excursion</th>
        <th>MFE Ratio</th>
        <th>MAE Ratio</th>
        <th>Type</th>
        <th>Screenshot</th>
        <th>Comment</th>
        {/* Add more table headers here */}
      </tr>
    </thead>
  );
};

export default TableHeader;
