// AverageTradePerformanceByDay.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
// Internal Utilities / Assets / Themes
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface AverageTradePerformanceByDayProps {
  trades: Trade[];
}

const AverageTradePerformanceByDay: React.FC<AverageTradePerformanceByDayProps> = ({
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
    // Filter out trades with null realPL or realRR and group by day of the week
    const tradesByDay = d3.group(trades.filter(trade => trade.realPL !== null && trade.realRR !== null), 
                                  (d) => new Date(d.datetimeIn).getDay());

    // Calculate average performance for each day
    const data = Array.from(tradesByDay, ([day, trades]) => {
      if (day === 0) return null; // Skip Sunday
      const totalPL = d3.sum(trades, (d) => d.realPL ?? 0);
      const totalRR = d3.sum(trades, (d) => d.realRR ?? 0);
      const avgPL = totalPL / trades.length;
      const avgRR = totalRR / trades.length;
      console.log(`Day: ${day}, Avg PL: ${avgPL}, Avg RR: ${avgRR}`); // Log data for debugging
      return { day, avgPL, avgRR };
    }).filter(Boolean) as { day: number, avgPL: number, avgRR: number }[];

    // Sort data by day of the week (Monday = 1, ..., Saturday = 6)
    data.sort((a, b) => a.day - b.day);

    // Remove existing SVG if present
    const id = `averageTradePerformanceByDay`;
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
      .domain(data.map(d => d.day.toString()))
      .range([50, width - 50])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([d3.min(data, d => Math.min(d.avgPL, d.avgRR))!, d3.max(data, d => Math.max(d.avgPL, d.avgRR))!])
      .range([height - 50, 0]);

    // Create axis
    const xAxis = d3.axisBottom(x).tickFormat((d, i) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][+d - 1]);
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

    // Append bars for Average P/L
    svg.selectAll(".barPL")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "barPL")
      .attr("x", (d) => x(d.day.toString())!)
      .attr("y", (d) => y(d.avgPL))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => height - 50 - y(d.avgPL))
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange");

        // Calculate the position for the tooltip
        const tooltipX = x(d.day.toString())! + x.bandwidth() / 4;
        const tooltipY = y(d.avgPL) - 10;
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
          .text(`Avg PL: ${d.avgPL.toFixed(2)}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue");
        d3.select("#tooltip").remove();
      });

    // Append bars for Average Realized R:R
    svg.selectAll(".barRR")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "barRR")
      .attr("x", (d) => x(d.day.toString())! + x.bandwidth() / 2)
      .attr("y", (d) => y(d.avgRR))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => height - 50 - y(d.avgRR))
      .attr("fill", "green")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange");

        // Calculate the position for the tooltip
        const tooltipX = x(d.day.toString())! + (3 * x.bandwidth()) / 4;
        const tooltipY = y(d.avgRR) - 10;
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
          .text(`Avg RR: ${d.avgRR.toFixed(2)}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "green");
        d3.select("#tooltip").remove();
      });

  }, [trades, svgDimensions, colorScheme]);

  return <div id="averageTradePerformanceByDay"></div>;
};

export default AverageTradePerformanceByDay;
