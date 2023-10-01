// MetricRow.tsx
import React from "react";
import Grid from "@mui/material/Grid";

interface StatLineProps {
  title: string;
  stats: React.ReactNode;
  style?: React.CSSProperties;
}

const StatLine: React.FC<StatLineProps> = ({ title, stats, style = {} }) => {
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
      <div style={{ flexBasis: "30%", textAlign: "left" }}>
        <h3>{title}</h3>
      </div>
      <div style={{ flexBasis: "70%", textAlign: "center" }}>{stats}</div>
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
    <Grid container spacing={1} style={{ border: '1px solid #ccc', borderRadius: '4px', marginBottom: '8px' }}>
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
