// TradePerformanceHeatmap.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
// Internal Utilities / Assets / Themes
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface TradePerformanceHeatmapProps {
  trades: Trade[];
}

const TradePerformanceHeatmap: React.FC<TradePerformanceHeatmapProps> = ({
  trades,
}) => {
  // Styling
  const colorScheme = useAppColorScheme();

  // Initialize state for SVG dimensions
  const [svgDimensions, setSvgDimensions] = useState({
    width: window.innerWidth * 0.9,
    height: 500,  // Adjust height as necessary
  });

  useEffect(() => {
    // Function to handle resizing
    const handleResize = () => {
      setSvgDimensions({
        width: window.innerWidth * 0.9,
        height: 500,  // Adjust as necessary
      });
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);  // Empty dependency array ensures this runs once on mount and unmount

  useEffect(() => {
    // Initialize the data with all days and hours
    const days = Array.from({ length: 5 }, (_, i) => i + 1); // Monday to Friday
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm

    const data = [];
    for (const day of days) {
      for (const hour of hours) {
        const tradesAtTime = trades.filter(trade => {
          const tradeDate = new Date(trade.datetimeIn);
          return tradeDate.getDay() === day && tradeDate.getHours() === hour;
        });
        const totalRR = d3.sum(tradesAtTime, (d) => d.realRR ?? 0);
        const avgRR = tradesAtTime.length ? totalRR / tradesAtTime.length : 0;
        data.push({ day, hour, avgRR });
      }
    }

    // Remove existing SVG if present
    const id = `combinedTradePerformanceHeatmap`;
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

    // Create scales
    const x = d3
      .scaleBand()
      .domain(hours.map(String))
      .range([50, width - 50])
      .padding(0.05);

    const y = d3
      .scaleBand()
      .domain(days.map(String))
      .range([50, height - 50])
      .padding(0.05);

    const color = d3.scaleSequential()
      .interpolator(d3.interpolateRdYlGn)
      .domain([d3.min(data, d => d.avgRR) ?? 0, d3.max(data, d => d.avgRR) ?? 0]);

    // Create axes
    const xAxis = d3.axisBottom(x).tickFormat(d => `${d}:00`);
    const yAxis = d3.axisLeft(y).tickFormat(d => ["Mon", "Tue", "Wed", "Thu", "Fri"][+d - 1]);

    // Append X-axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - 50})`)
      .call(xAxis);

    // Append Y-axis
    svg
      .append("g")
      .attr("transform", `translate(50, 0)`)
      .call(yAxis);

    // Append cells for heatmap
    svg.selectAll(".cell")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => x(d.hour.toString())!)
      .attr("y", (d) => y(d.day.toString())!)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", (d) => color(d.avgRR))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);

        // Calculate the position for the tooltip
        const tooltipX = x(d.hour.toString())! + x.bandwidth() / 2;
        const tooltipY = y(d.day.toString())! - 10;
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
          .text(`Day: ${["Mon", "Tue", "Wed", "Thu", "Fri"][d.day - 1]}, HR: ${d.hour}:00, Avg RR: ${d.avgRR.toFixed(2)}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "none");
        d3.select("#tooltip").remove();
      });

  }, [trades, svgDimensions, colorScheme]);

  return <div id="combinedTradePerformanceHeatmap"></div>;
};

export default TradePerformanceHeatmap;
