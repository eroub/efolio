// WinLossPieChart.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect } from "react";
// Internal Utilities / Assets / Themes
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface PieChartProps {
  trades: Trade[];
}

interface ChartData {
  label: string;
  count: number;
}

const WinLossPieChart: React.FC<PieChartProps> = ({ trades }) => {
  // Styling
  const colorScheme = useAppColorScheme();
  useEffect(() => {
    let wins = 0,
      losses = 0;
    trades.forEach((trade) => {
      if (trade.realPL !== null) {
        trade.realPL > 0 ? wins++ : losses++;
      }
    });

    const data: ChartData[] = [
      { label: "Wins", count: wins },
      { label: "Losses", count: losses },
    ];

    // Remove existing SVG if present
    d3.select("#winLossPie svg").remove();

    // Define color scale
    const color = d3.scaleOrdinal([
      "rgba(0, 255, 0, 0.5)",
      "rgba(255, 0, 0, 0.5)",
    ]);

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3
      .select("#winLossPie")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<ChartData>().value((d: ChartData) => d.count);
    const path = d3
      .arc<d3.PieArcDatum<ChartData>>()
      .outerRadius(radius - 10)
      .innerRadius(0);

    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => color(d.data.label))
      .on("mouseover", function (event, d: d3.PieArcDatum<ChartData>) {
        d3.select(this)
          .attr("stroke", d.data.label === "Wins" ? "darkgreen" : "darkred")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function (event, d: d3.PieArcDatum<ChartData>) {
        d3.select(this).attr("stroke", "none").attr("stroke-width", 0);
      });

    // Center text labels
    arcs
      .append("text")
      .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
      .attr("transform", (d) => `translate(${path.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .attr("dy", "0.35em")
      .text(
        (d) =>
          `${Math.round(((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100)}%`,
      );
  }, [trades, colorScheme]);

  return <div id="winLossPie"></div>;
};

export default WinLossPieChart;
