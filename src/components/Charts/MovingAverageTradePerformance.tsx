// MovingAverageTradePerformance.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
// Internal Utilities / Assets / Themes
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface MovingAverageTradePerformanceProps {
  trades: Trade[];
  mode?: string; // Mode is optional
}

const MovingAverageTradePerformance: React.FC<MovingAverageTradePerformanceProps> = ({
  trades,
  mode = "$",
}) => {
  // Default to "$" if mode is not provided
  const effectiveMode = mode ?? "$";
  // Styling
  const colorScheme = useAppColorScheme();
  const sanitizedMode = effectiveMode.replace(":", "").replace("$", "dollar");

  // Initialize state for SVG dimensions
  const [svgDimensions, setSvgDimensions] = useState({
    width: window.innerWidth * 0.9,
    height: 400, // Keeping height fixed, but you can make it dynamic as needed
  });

  useEffect(() => {
    // Function to handle resizing
    const handleResize = () => {
      setSvgDimensions({
        width: window.innerWidth * 0.9,
        height: 500, // Adjust as necessary
      });
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array ensures this runs once on mount and unmount

  useEffect(() => {
    // Sort trades by datetimeIn
    const sortedTrades = [...trades].sort((a, b) => new Date(a.datetimeIn).getTime() - new Date(b.datetimeIn).getTime());

    // Calculate moving average
    const movingAverageData = sortedTrades.map((trade, index) => {
      const start = 0;
      const end = index + 1;
      const windowTrades = sortedTrades.slice(start, end);
      const avgValue = effectiveMode === "$" ? d3.mean(windowTrades, (d) => d.realPL ?? 0) : d3.mean(windowTrades, (d) => d.realRR ?? 0);
      return { datetime: new Date(trade.datetimeIn), avgValue };
    });

    // Remove existing SVG if present
    const id = `movingAverageTradePerformance${sanitizedMode}`;
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
      .scaleTime()
      .domain(d3.extent(movingAverageData, (d) => d.datetime) as [Date, Date])
      .range([50, width - 50]);

    // Calculate the buffer for y-axis
    const maxValue = d3.max(movingAverageData, (d) => d.avgValue);
    const minValue = d3.min(movingAverageData, (d) => d.avgValue);
    const buffer = 0.05 * (maxValue! - minValue!); // 5% buffer

    const y = d3
      .scaleLinear()
      .domain([(minValue ?? 0) - buffer, (maxValue ?? 0) + buffer])
      .range([height - 50, 0]);

    // Create axis
    const xAxis = d3
      .axisBottom(x)
      .tickFormat(d3.timeFormat("%b %d") as unknown as (d: Date | number, i: number) => string)
      .tickValues(
        sortedTrades.map((trade) => {
          const date = new Date(trade.datetimeIn);
          return new Date(date.getFullYear(), date.getMonth() + 1, 0);
        })
      );
    const yAxis = d3.axisLeft(y).ticks(10);

    if (effectiveMode === "$") {
      yAxis.tickFormat((d: any) => `$${d}`);
    }

    // Append X-axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - 50})`)
      .call(xAxis)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("y2", -height + 50)
          .attr("stroke-opacity", 0.1)
      )
      .selectAll("text")
      .style("font-size", "12px") // Adjust font size for better clarity
      .style("font-family", "Arial, sans-serif") // Change font family
      .attr("text-anchor", "end") // Align text to the end for better readability
      .attr("transform", "rotate(-45)"); // Rotate text for better clarity

    // Append Y-axis
    svg
      .append("g")
      .attr("transform", `translate(50, 0)`)
      .call(yAxis)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", width - 100)
          .attr("stroke-opacity", 0.1)
      )
      .selectAll("text")
      .style("font-size", "12px") // Adjust font size for better clarity
      .style("font-family", "Arial, sans-serif"); // Change font family

    // Create line generator
    const line = d3
      .line<any>()
      .x((d) => x(d.datetime))
      .y((d) => y(d.avgValue))
      .curve(d3.curveMonotoneX);

    // Draw the moving average line
    svg
      .append("path")
      .datum(movingAverageData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add circles for each data point in the moving average
    svg
      .selectAll("circle")
      .data(movingAverageData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.datetime))
      .attr("cy", (d) => y(d.avgValue))
      .attr("r", 3)
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 6).attr("fill", "orange");
        const tooltipX = x(d.datetime);
        const tooltipY = y(d.avgValue) - 10;

        svg
          .append("text")
          .attr("id", "tooltip")
          .attr("x", tooltipX)
          .attr("y", tooltipY)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
          .text(`Avg ${effectiveMode}: ${d.avgValue.toFixed(2)}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 3).attr("fill", "steelblue");
        d3.select("#tooltip").remove();
      });

    // Append zero line for Y-axis
    svg
      .append("line")
      .attr("x1", 50)
      .attr("x2", width - 50)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Append X-axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .text("Time")
      .attr("fill", "black")
      .style("font-size", "14px") // Adjust font size for better clarity
      .style("font-family", "Arial, sans-serif"); // Change font family

    // Append Y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -height / 2)
      .attr("dy", "-5.1em")
      .style("text-anchor", "middle")
      .text(`Average ${effectiveMode}`)
      .attr("fill", "black")
      .style("font-size", "14px") // Adjust font size for better clarity
      .style("font-family", "Arial, sans-serif"); // Change font family
  }, [trades, effectiveMode, sanitizedMode, svgDimensions, colorScheme]);

  return <div id={`movingAverageTradePerformance${sanitizedMode}`}></div>;
};

export default MovingAverageTradePerformance;
