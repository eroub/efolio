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
    // Initialize the data with all hours from 6am to 11pm
    const hours = Array.from({ length: 18 }, (_, i) => i + 6);
    const data = hours.map(hour => {
      const tradesAtHour = trades.filter(trade => new Date(trade.datetimeIn).getHours() === hour);
      const totalPL = d3.sum(tradesAtHour, (d) => d.realPL ?? 0);
      const totalRR = d3.sum(tradesAtHour, (d) => d.realRR ?? 0);
      const avgPL = tradesAtHour.length ? totalPL / tradesAtHour.length : 0;
      const avgRR = tradesAtHour.length ? totalRR / tradesAtHour.length : 0;
      return { hour, avgPL, avgRR };
    });

    // Remove existing SVG if present
    const id = `tradePerformanceHeatmap`;
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

    // Calculate the shared domain for the y-axes
    const minPL = d3.min(data, d => d.avgPL) ?? 0;
    const maxPL = d3.max(data, d => d.avgPL) ?? 0;
    const minRR = d3.min(data, d => d.avgRR) ?? 0;
    const maxRR = d3.max(data, d => d.avgRR) ?? 0;

    const minY = Math.min(minPL, minRR);
    const maxY = Math.max(maxPL, maxRR);

    const x = d3
      .scaleBand()
      .domain(data.map(d => d.hour.toString()))
      .range([50, width - 50])
      .padding(0.2);

    const yPL = d3
      .scaleLinear()
      .domain([minY, maxY])
      .range([height - 50, 0]);

    const yRR = d3
      .scaleLinear()
      .domain([minY, maxY])
      .range([height - 50, 0]);

    // Create axes
    const xAxis = d3.axisBottom(x).tickFormat(d => `${d}:00`);
    const yAxisPL = d3.axisLeft(yPL).ticks(10).tickFormat(d3.format(".2f"));
    const yAxisRR = d3.axisRight(yRR).ticks(10).tickFormat(d3.format(".2f"));

    // Append X-axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - 50})`)
      .call(xAxis);

    // Append Y-axis for P/L
    svg
      .append("g")
      .attr("class", "grid") // Add a class for easier selection
      .attr("transform", `translate(50, 0)`)
      .call(yAxisPL);

    // Append Y-axis for R:R
    svg
      .append("g")
      .attr("class", "grid") // Add a class for easier selection
      .attr("transform", `translate(${width - 50}, 0)`)
      .call(yAxisRR);

    // Add grid lines for P/L
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(50,0)`)
      .call(yAxisPL.tickSize(-width + 100).tickFormat(() => ""))
      .selectAll("line")
      .attr("stroke-dasharray", "2,2");

    // Append zero line for P/L
    svg
      .append("line")
      .attr("x1", 50)
      .attr("x2", width - 50)
      .attr("y1", yPL(0))
      .attr("y2", yPL(0))
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Append Y-axis label for P/L
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -height / 2)
      .attr("dy", "-5.1em")
      .style("text-anchor", "middle")
      .text("Average P/L")
      .attr("fill", "black");

    // Append Y-axis label for R:R
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -width + 60)
      .attr("x", -height / 2)
      .attr("dy", "5.1em")
      .style("text-anchor", "middle")
      .text("Average R:R")
      .attr("fill", "black");

    // Append bars for Average P/L
    svg.selectAll(".barPL")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "barPL")
      .attr("x", (d) => x(d.hour.toString())!)
      .attr("y", (d) => yPL(d.avgPL))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => height - 50 - yPL(d.avgPL))
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange");

        // Calculate the position for the tooltip
        const tooltipX = x(d.hour.toString())! + x.bandwidth() / 4;
        const tooltipY = yPL(d.avgPL) - 10;
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
          .text(`Hour: ${d.hour}:00, Avg PL: ${d.avgPL.toFixed(2)}`);
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
      .attr("x", (d) => x(d.hour.toString())! + x.bandwidth() / 2)
      .attr("y", (d) => yRR(d.avgRR))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => height - 50 - yRR(d.avgRR))
      .attr("fill", "green")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange");

        // Calculate the position for the tooltip
        const tooltipX = x(d.hour.toString())! + (3 * x.bandwidth()) / 4;
        const tooltipY = yRR(d.avgRR) - 10;
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
          .text(`Hour: ${d.hour}:00, Avg RR: ${d.avgRR.toFixed(2)}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "green");
        d3.select("#tooltip").remove();
      });

  }, [trades, svgDimensions, colorScheme]);

  return <div id="tradePerformanceHeatmap"></div>;
};

export default TradePerformanceHeatmap;
