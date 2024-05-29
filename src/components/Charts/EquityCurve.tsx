// EquityCurve.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
// Internal Utilities / Assets / Themes
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface EquityCurveProps {
  trades: Trade[];
}

const EquityCurve: React.FC<EquityCurveProps> = ({ trades }) => {
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
    // Calculate expected equity curve
    const sortedTrades = [...trades].sort((a, b) => new Date(a.datetimeIn).getTime() - new Date(b.datetimeIn).getTime());
    let initialEquity = sortedTrades[0]?.equity ?? 0;
    let cumulativePL = 0;
    const expectedEquityData = sortedTrades.map(trade => {
      cumulativePL += trade.realPL ?? 0;
      return { datetime: new Date(trade.datetimeIn), value: initialEquity + cumulativePL, type: 'expected' };
    });

    // Calculate actual equity curve
    const actualEquityData = sortedTrades.map(trade => {
      return { datetime: new Date(trade.datetimeIn), value: trade.equity, type: 'actual' };
    });

    // Combine both datasets for common scale calculations
    const combinedData = [...expectedEquityData, ...actualEquityData];

    // Remove existing SVG if present
    const id = `equityCurve`;
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
    const x = d3.scaleTime()
      .domain(d3.extent(combinedData, d => d.datetime) as [Date, Date])
      .range([50, width - 50]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(combinedData, d => d.value)!,
        d3.max(combinedData, d => d.value)! * 1.1  // Add padding at the top
      ])
      .range([height - 50, 0]);

    // Create axis
    const xAxis = d3.axisBottom(x)
      .tickFormat(d3.timeFormat("%b %d"))
      .tickValues(sortedTrades.map(trade => {
        const date = new Date(trade.datetimeIn);
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
      }));
    const yAxis = d3.axisLeft(y);

    // Append X-axis
    svg.append("g")
      .attr("transform", `translate(0, ${height - 50})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
        .attr("y2", -height + 50)
        .attr("stroke-opacity", 0.1))
      .selectAll("text")
      .style("font-size", "12px") // Adjust font size for better clarity
      .style("font-family", "Arial, sans-serif") // Change font family
      .attr("text-anchor", "end") // Align text to the end for better readability
      .attr("transform", "rotate(-45)"); // Rotate text for better clarity

    // Append Y-axis
    svg.append("g")
      .attr("transform", `translate(50, 0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - 100)
        .attr("stroke-opacity", 0.1))
      .selectAll("text")
      .style("font-size", "12px") // Adjust font size for better clarity
      .style("font-family", "Arial, sans-serif"); // Change font family

    // Create line generators
    const lineExpected = d3.line<any>()
      .x(d => x(d.datetime))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const lineActual = d3.line<any>()
      .x(d => x(d.datetime))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Draw the expected equity line
    svg.append("path")
      .datum(expectedEquityData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", lineExpected);

    // Draw the actual equity line
    svg.append("path")
      .datum(actualEquityData)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 2)
      .attr("d", lineActual);

    // Add circles for each data point in the actual equity curve
    svg.selectAll("circle.actual")
      .data(actualEquityData)
      .enter()
      .append("circle")
      .attr("class", "actual")
      .attr("cx", d => x(d.datetime))
      .attr("cy", d => y(d.value))
      .attr("r", 3)
      .attr("fill", "orange")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 6).attr("fill", "red");
        const tooltipX = x(d.datetime);
        const tooltipY = y(d.value) - 10;

        svg.append("text")
          .attr("id", "tooltip")
          .attr("x", tooltipX)
          .attr("y", tooltipY)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
          .text(`Equity: ${d.value.toFixed(2)}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 3).attr("fill", "orange");
        d3.select("#tooltip").remove();
      });

    // Add circles for each data point in the expected equity curve
    svg.selectAll("circle.expected")
      .data(expectedEquityData)
      .enter()
      .append("circle")
      .attr("class", "expected")
      .attr("cx", d => x(d.datetime))
      .attr("cy", d => y(d.value))
      .attr("r", 3)
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 6).attr("fill", "red");
        const tooltipX = x(d.datetime);
        const tooltipY = y(d.value) - 10;

        svg.append("text")
          .attr("id", "tooltip")
          .attr("x", tooltipX)
          .attr("y", tooltipY)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
          .text(`Expected: ${d.value.toFixed(2)}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 3).attr("fill", "steelblue");
        d3.select("#tooltip").remove();
      });

    // Append X-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .text("Time")
      .attr("fill", "black")
      .style("font-size", "14px") // Adjust font size for better clarity
      .style("font-family", "Arial, sans-serif"); // Change font family

    // Append Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -height / 2)
      .attr("dy", "-5.1em")
      .style("text-anchor", "middle")
      .text("Equity")
      .attr("fill", "black")
      .style("font-size", "14px") // Adjust font size for better clarity
      .style("font-family", "Arial, sans-serif"); // Change font family

    // Append legend
    const legend = svg.append("g")
      .attr("transform", `translate(50, ${height - 40})`);

    legend.append("rect")
      .attr("width", 100)
      .attr("height", 30)
      .attr("fill", "white")
      .attr("stroke", "black");

    legend.append("circle")
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 5)
      .attr("fill", "steelblue");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 10)
      .text("Expected Equity")
      .attr("alignment-baseline", "middle")
      .style("font-size", "10px");

    legend.append("circle")
      .attr("cx", 10)
      .attr("cy", 20)
      .attr("r", 5)
      .attr("fill", "orange");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 20)
      .text("Actual Equity")
      .attr("alignment-baseline", "middle")
      .style("font-size", "10px");

  }, [trades, svgDimensions, colorScheme]);

  return <div id="equityCurve"></div>;
};

export default EquityCurve;
