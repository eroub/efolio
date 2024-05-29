// TradeDurationHistogram.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
// Internal Utilities / Assets / Themes
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface TradeDurationHistogramProps {
  trades: Trade[];
}

const TradeDurationHistogram: React.FC<TradeDurationHistogramProps> = ({
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
    // Filter out trades with null totalHrs
    const validTrades = trades.filter(trade => trade.totalHrs !== null) as { totalHrs: number }[];

    // Remove existing SVG if present
    const id = `tradeDurationHistogram`;
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
      .scaleLinear()
      .domain([0, d3.max(validTrades, (d) => d.totalHrs)!])
      .range([50, width - 50]);

    const histogram = d3.histogram()
      .value((d: any) => d.totalHrs)
      .domain(x.domain() as [number, number])
      .thresholds(x.ticks(100)); // Adjust number of bins as necessary

    const bins = histogram(validTrades);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length)!])
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

    // Append bars for histogram
    svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.x0!) + 1)
      .attr("y", (d) => y(d.length))
      .attr("width", (d) => x(d.x1!) - x(d.x0!) - 1)
      .attr("height", (d) => height - 50 - y(d.length))
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange");

        // Calculate the position for the tooltip
        const tooltipX = x((d.x0! + d.x1!) / 2);
        const tooltipY = y(d.length) - 10;
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
          .text(`HR: ${((d.x0! + d.x1!) / 2).toFixed(0)}, #: ${d.length}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue");
        d3.select("#tooltip").remove();
      });

  }, [trades, svgDimensions, colorScheme]);

  return <div id="tradeDurationHistogram"></div>;
};

export default TradeDurationHistogram;