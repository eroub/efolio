// CumulativePLLineChart.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect } from "react";
// Internal Utilities / Assets / Themes
import { formatCurrency } from "../../utils/formatters";
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface CumulativePLChartProps {
  trades: Trade[];
  mode: string;
}

interface ChartData {
  id: number;
  value: number;
}

const CumulativePLChart: React.FC<CumulativePLChartProps> = ({
  trades,
  mode,
}) => {
  // Styling
  const colorScheme = useAppColorScheme();

  const sanitizedMode = mode.replace(":", "").replace("$", "dollar");
  useEffect(() => {
    // Sort trades by ID
    const sortedTrades = [...trades].sort((a, b) => a.id - b.id);

    // Calculate cumulative P/L
    let cumulativePL = 0;
    // Map trades to sequential indices for the x-axis
    const data: ChartData[] = sortedTrades.map((trade, index) => {
      cumulativePL += mode === "$" ? trade.realPL ?? 0 : trade.realRR ?? 0;
      // Use index + 1 to ensure the x-axis starts at 1
      return { id: index + 1, value: parseFloat(cumulativePL.toFixed(2)) };
    });

    // Remove existing SVG if present
    const id = `cumulativePL${sanitizedMode}`;
    d3.select("#" + id)
      .select("svg")
      .remove();

    // Initialize SVG
    const width = 850,
      height = 500;
    const svg = d3
      .select(`#cumulativePL${sanitizedMode}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create scales
    const x = d3
      .scaleLinear()
      .domain([1, data.length]) // Use the length of the data array
      .range([50, width - 50]);

    const y = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.value)!, d3.max(data, (d) => d.value)!])
      .range([height - 50, 50]);

    // Create axis
    const xAxis = d3.axisBottom(x).ticks(5);
    const yAxis = d3.axisLeft(y).ticks(5);

    if (mode === "$") {
      yAxis.tickFormat((d: any) => formatCurrency(Number(d)) as any);
    }

    // Append X-axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - 50})`)
      .call(xAxis);

    // Append Y-axis
    svg
      .append("g")
      .attr("class", "grid") // Add a class for easier selection
      .attr("transform", `translate(50, 0)`)
      .call(yAxis);

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(50,0)`)
      .call(yAxis.tickSize(-width + 100).tickFormat(() => ""))
      .selectAll("line")
      .attr("stroke-dasharray", "2,2");

    // Create line generator
    const line = d3
      .line<ChartData>()
      .x((d) => x(d.id)) // Access the sequential index
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Draw the line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add circles for each data point
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.id))
      .attr("cy", (d) => y(d.value))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 8).attr("fill", "orange");
        svg
          .append("text")
          .attr("id", "tooltip")
          .attr("x", x(d.id))
          .attr("y", y(d.value) - 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
          .text(
            `Trade #: ${d.id}, Value: ${
              mode === "$" ? formatCurrency(Number(d.value)) : d.value
            }`,
          );
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("fill", "steelblue");
        d3.select("#tooltip").remove();
      });
  }, [trades, mode, sanitizedMode, colorScheme]);

  return <div id={`cumulativePL${sanitizedMode}`}></div>;
};

export default CumulativePLChart;
