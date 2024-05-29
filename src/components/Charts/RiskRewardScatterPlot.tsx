// RiskRewardScatterPlot.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
// Internal Utilities / Assets / Themes
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface RiskRewardScatterPlotProps {
  trades: Trade[];
}

const RiskRewardScatterPlot: React.FC<RiskRewardScatterPlotProps> = ({
  trades,
}) => {
  // Styling
  const colorScheme = useAppColorScheme();

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
    // Filter out trades with null risk or reward
    const validTrades = trades.filter(trade => trade.risk !== null && trade.realPL !== null) as { risk: number, realPL: number, direction: "Long" | "Short" }[];

    // Remove existing SVG if present
    const id = `riskRewardScatterPlot`;
    d3.select("#" + id)
      .select("svg")
      .remove();

    // Initialize SVG
    const { width, height } = svgDimensions;
    const svg = d3
      .select(`#${id}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Adjusted x-domain to start from minimum risk value
    const minRisk = d3.min(validTrades, (d) => d.risk)!;
    const maxRisk = d3.max(validTrades, (d) => d.risk)!;

    // Create scales
    const x = d3
      .scaleLog()
      .domain([Math.max(minRisk, 0.1), maxRisk])
      .range([50, width - 50]);

    const y = d3
      .scaleLinear()
      .domain([d3.min(validTrades, (d) => d.realPL)!, d3.max(validTrades, (d) => d.realPL)!])
      .range([height - 50, 0]);

    // Create axis
    const xAxis = d3.axisBottom(x).ticks(10);
    const yAxis = d3.axisLeft(y).ticks(10);

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

    // Color scale for trade direction
    const color = d3.scaleOrdinal()
      .domain(["Long", "Short"])
      .range(["green", "red"]);

    // Append circles for scatter plot
    svg.selectAll("circle")
      .data(validTrades)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.risk))
      .attr("cy", (d) => y(d.realPL))
      .attr("r", 5)
      .attr("fill", (d) => color(d.direction))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 8).attr("fill", "orange");

        // Calculate the position for the tooltip
        const tooltipX = x(d.risk);
        const tooltipY = y(d.realPL) - 10;
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
          .text(`Risk: ${d.risk.toFixed(2)}, Reward: ${d.realPL.toFixed(2)}, ${d.direction}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("fill", (d) => color(d.direction));
        d3.select("#tooltip").remove();
      });

  }, [trades, svgDimensions, colorScheme]);

  return <div id="riskRewardScatterPlot"></div>;
};

export default RiskRewardScatterPlot;
