// PairPerformanceBarChart.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect } from "react";
// Internal Utilities / Assets / Themes
import { formatCurrency } from "../../utils/formatters";
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface PairPerformanceProps {
  trades: Trade[];
  mode: string;
}

interface ChartData {
  ticker: string;
  value: number;
}

const PairPerformanceChart: React.FC<PairPerformanceProps> = ({
  trades,
  mode,
}) => {
  // Styling
  const colorScheme = useAppColorScheme();
  const sanitizedMode = mode.replace(":", "").replace("$", "S"); // Replacing $ with S for clarity
  useEffect(() => {
    // Data Aggregation
    const pairData: { [key: string]: number } = {};
    trades.forEach((trade) => {
      if (trade.ticker && trade.realPL !== null && trade.realRR !== null) {
        if (!pairData[trade.ticker]) pairData[trade.ticker] = 0;
        pairData[trade.ticker] += mode === "$" ? trade.realPL : trade.realRR;
      }
    });

    const data: ChartData[] = Object.keys(pairData)
      .map((ticker) => ({
        ticker,
        value: pairData[ticker],
      }))
      .sort((a, b) => a.ticker.localeCompare(b.ticker));
    // Remove existing SVG
    const id = `pairPerformance${sanitizedMode}`;
    d3.select(`#${id} svg`).remove();

    // Initialize SVG and Dimensions
    const margin = { top: 50, right: 30, bottom: 50, left: 60 },
      width = 850 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const svg = d3
      .select(`#${id}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Initialize Scales and Axes
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.ticker))
      .range([0, width])
      .padding(0.2);
    // Create scales
    const yMax = d3.max(data, (d) => Math.abs(d.value))!;
    const yMin = -yMax;
    const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    // X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Y-axis
    const yAxis = d3
      .axisLeft(y)
      .tickSize(-width) // this extends the ticks across the chart
      .tickFormat((d) => (mode === "$" ? `$${d}` : d.toString()));

    const yAxisG = svg.append("g").call(yAxis);

    // Modify the lines to be dotted
    yAxisG.selectAll(".tick line").attr("stroke-dasharray", "2,2"); // the numbers control the dash pattern

    // Render the bars
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.ticker) ?? 0)
      .attr("y", (d) => y(Math.max(0, d.value)))
      .attr("width", x.bandwidth())
      .attr("height", (d) => Math.abs(y(d.value) - y(0)))
      .attr("fill", (d) =>
        d.value >= 0 ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)",
      )
      .on("mouseover", function (event, d) {
        const xPosition = x(d.ticker) ?? 0; // Provide a default value
        d3.select(this)
          .attr("stroke", d.value >= 0 ? "darkgreen" : "darkred")
          .attr("stroke-width", 2);

        // Show the y-axis value
        svg
          .append("text")
          .attr("id", "hoverText")
          .attr("x", xPosition + x.bandwidth() / 2)
          .attr("y", y(d.value) - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
          .text(() => (mode === "$" ? formatCurrency(d.value) : d.value));
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", "none").attr("stroke-width", 0);

        // Remove the y-axis value
        svg.select("#hoverText").remove();
      });
  }, [trades, mode, sanitizedMode, colorScheme]);

  return <div id={`pairPerformance${sanitizedMode}`}></div>;
};

export default PairPerformanceChart;
