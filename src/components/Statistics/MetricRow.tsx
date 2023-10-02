// MetricRow.tsx
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
// QuestionMark SVG
import { QuestionMark } from "../../assets/QuestionMark";

interface StatLineProps {
  title: string;
  stats: React.ReactNode;
  style?: React.CSSProperties;
  tooltip?: string;
}

const StatLine: React.FC<StatLineProps> = ({
  title,
  stats,
  style = {},
  tooltip,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const tooltipStyle: React.CSSProperties = {
    position: "relative",
    cursor: "pointer",
  };

  const tooltipContentStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#333",
    color: "#fff",
    padding: "5px",
    borderRadius: "3px",
    fontSize: "12px",
    zIndex: 10,
    visibility: tooltipVisible ? "visible" : "hidden",
    width: "200px",
    whiteSpace: "normal",
  };

  return (
    <div
      style={{
        ...style,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "12px",
      }}
    >
      <div
        style={{
          flexBasis: "55%",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            marginRight: "8px",
            marginBottom: "10px", // Add bottom margin for more vertical space
            paddingLeft: "5px", // Add left padding for more horizontal space
          }}
        >
          <span style={{ display: "inline" }}>{title}</span>
          {tooltip && (
            <span
              style={{ ...tooltipStyle, marginLeft: "2px", display: "inline" }}
              onMouseOver={() => setTooltipVisible(true)}
              onMouseOut={() => setTooltipVisible(false)}
            >
              <QuestionMark />
              <div style={tooltipContentStyle}>{tooltip}</div>
            </span>
          )}
          <span style={{ display: "inline" }}>:</span>
        </h3>
      </div>
      <div style={{ flexBasis: "70%", textAlign: "center" }}>
        {typeof stats === "number" ? (isNaN(stats) ? "N/A" : stats) : stats}
      </div>
    </div>
  );
};

interface MetricRowProps {
  groupingTitle: string;
  statLines: React.ReactNode[];
}

const MetricRow: React.FC<MetricRowProps> = ({ groupingTitle, statLines }) => {
  const gridSize = 12 / (statLines.length + 1); // +1 for the grouping title

  return (
    <Grid
      container
      spacing={1}
      style={{
        border: "1px solid #ccc",
        borderRadius: "4px",
        marginBottom: "8px",
      }}
    >
      <Grid item xs={gridSize}>
        <div style={{ textAlign: "left" }}>
          <h3>{groupingTitle}</h3>
        </div>
      </Grid>
      {statLines.map((statLine, index) => (
        <Grid item xs={gridSize} key={index}>
          {statLine}
        </Grid>
      ))}
      <Grid item xs={12 - gridSize * (statLines.length + 1)}>
        {/* Empty Grid item to fill the remaining space */}
      </Grid>
    </Grid>
  );
};

export { StatLine, MetricRow };
