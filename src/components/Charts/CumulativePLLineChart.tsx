// CumulativePLLineChart.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
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

  // Initialize state for SVG dimensions
  const [svgDimensions, setSvgDimensions] = useState({
    width: window.innerWidth * 0.9,
    height: 400  // Keeping height fixed, but you can make it dynamic as needed
  });

  useEffect(() => {
    // Function to handle resizing
    const handleResize = () => {
      setSvgDimensions({
        width: window.innerWidth * 0.9,
        height: 500  // Adjust as necessary
      });
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);  // Empty dependency array ensures this runs once on mount and unmount

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
    const { width, height } = svgDimensions;
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

    // Calculate the buffer for y-axis
    const maxValue = d3.max(data, (d) => d.value);
    const minValue = d3.min(data, (d) => d.value);
    const buffer = 0.05 * (maxValue! - minValue!); // 5% buffer

    const y = d3
      .scaleLinear()
      .domain([(minValue ?? 0) - buffer, (maxValue ?? 0) + buffer])
      .range([height - 50, 0]);

    // Create axis
    const xAxis = d3.axisBottom(x).ticks(10);
    const yAxis = d3.axisLeft(y).ticks(10);

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
        const circleRadius = 8;
        d3.select(this).attr("r", circleRadius).attr("fill", "orange");
      
        // Calculate the position for the tooltip
        const tooltipX = x(d.id);
        const tooltipY = y(d.value) - 10;
        const tooltipWidth = 100; // Approximate width of the tooltip
        const tooltipHeight = 20; // Approximate height of the tooltip
      
        // Adjust tooltip position to prevent overflow
        const adjustedX = tooltipX + tooltipWidth > width
          ? tooltipX - tooltipWidth - 10 // Shift left if overflowing right
          : tooltipX;
      
        const adjustedY = tooltipY - tooltipHeight < 0
          ? tooltipY + tooltipHeight + 20 // Shift down if overflowing top
          : tooltipY;
      
        svg
          .append("text")
          .attr("id", "tooltip")
          .attr("x", adjustedX)
          .attr("y", adjustedY)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
          .text(`Trade #: ${d.id}, Value: ${
            mode === "$" ? formatCurrency(Number(d.value)) : d.value
          }`);
      })      
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("fill", "steelblue");
        d3.select("#tooltip").remove();
      });      
  }, [trades, mode, sanitizedMode, colorScheme, svgDimensions]);

  return <div id={`cumulativePL${sanitizedMode}`}></div>;
};

export default CumulativePLChart;
