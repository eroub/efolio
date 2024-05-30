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
    const validTrades = trades.filter(trade => trade.risk !== null && trade.realRR !== null) as { risk: number, realRR: number, direction: "Long" | "Short", volume: number }[];

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
      .domain([d3.min(validTrades, (d) => d.realRR)!, d3.max(validTrades, (d) => d.realRR)!])
      .range([height - 50, 0]);

    // Create axis
    const xAxis = d3.axisBottom(x).ticks(10);
    const yAxis = d3.axisLeft(y).ticks(10);

    // Append X-axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - 50})`)
      .call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Risk");

    // Append Y-axis
    svg
      .append("g")
      .attr("class", "grid") // Add a class for easier selection
      .attr("transform", `translate(50, 0)`)
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Reward (R:R)");

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
      .attr("cy", (d) => y(d.realRR))
      .attr("r", 5)
      .attr("fill", (d) => color(d.direction))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 8).attr("fill", "orange");

        // Calculate the position for the tooltip
        const tooltipX = x(d.risk);
        const tooltipY = y(d.realRR) - 10;
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
          .text(`Risk: ${d.risk.toFixed(2)}, Reward: ${d.realRR.toFixed(2)}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("fill", (d) => color(d.direction));
        d3.select("#tooltip").remove();
      });

    // Calculate linear regression line
    const xValues = validTrades.map(d => x(d.risk));
    const yValues = validTrades.map(d => y(d.realRR));
    const regression = linearRegression(xValues, yValues);

    // Append regression line
    svg.append("line")
      .attr("x1", x(minRisk))
      .attr("y1", y(regression.predict(minRisk)))
      .attr("x2", x(maxRisk))
      .attr("y2", y(regression.predict(maxRisk)))
      .attr("stroke", "blue")
      .attr("stroke-width", 2);

  }, [trades, svgDimensions, colorScheme]);

  return <div id="riskRewardScatterPlot"></div>;
};

// Helper function for linear regression
function linearRegression(x, y) {
  const n = x.length;
  const sumX = d3.sum(x);
  const sumY = d3.sum(y);
  const sumXY = d3.sum(x.map((d, i) => d * y[i]));
  const sumXX = d3.sum(x.map(d => d * d));

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
    predict: x => slope * x + intercept
  };
}

export default RiskRewardScatterPlot;
