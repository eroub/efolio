// CumulativePLLineChart.tsx
import React, { useEffect } from "react";
import * as d3 from "d3";
// Trade Interface
import { Trade } from "../../models/TradeTypes";
// Format currency utility function
import { formatCurrency } from "../../utils/formatters";

interface CumulativePLChartProps {
  trades: Trade[];
  mode: "$" | "R:R";
}

interface ChartData {
  id: number;
  value: number;
}

const CumulativePLChart: React.FC<CumulativePLChartProps> = ({
  trades,
  mode,
}) => {
  const sanitizedMode = mode.replace(":", "").replace("$", "dollar");
  useEffect(() => {
    // Sort trades by ID
    const sortedTrades = [...trades].sort((a, b) => a.id - b.id);

    // Calculate cumulative P/L
    let cumulativePL = 0;
    const data: ChartData[] = sortedTrades.map((trade) => {
      if (mode === "$") {
        cumulativePL += trade.realPL ?? 0; // Replace with your USD field
      } else {
        cumulativePL += trade.realRR ?? 0;
      }
      return { id: trade.id, value: parseFloat(cumulativePL.toFixed(2)) };
    });

    // Remove existing SVG if present
    const id = `cumulativePL${sanitizedMode}`;
    d3.select("#" + id)
      .select("svg")
      .remove();

    // Initialize SVG
    const width = 500,
      height = 300;
    const svg = d3
      .select(`#cumulativePL${sanitizedMode}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create scales
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.id)!])
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

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - 50})`)
      .call(xAxis);
    svg.append("g").attr("transform", `translate(50, 0)`).call(yAxis);

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(50,0)`)
      .call(yAxis.tickSize(-width + 100).tickFormat(() => ""))
      .selectAll("line")
      .attr("stroke-dasharray", "2,2");

    // Axis labels
    svg
      .append("text")
      .attr("transform", `translate(${width / 2}, ${height - 10})`)
      .attr("text-anchor", "middle")
      .text("Trade ID");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Cumulative P/L");

    // Add Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`Net Cumulative P/L (${mode})`);

    // Create line generator
    const line = d3
      .line<{ id: number; value: number }>()
      .x((d) => x(d.id))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX); // Curve the line

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
          .attr("fill", "black")
          .text(
            `ID: ${d.id}, Value: ${
              mode === "$" ? formatCurrency(Number(d.value)) : d.value
            }`,
          );
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("fill", "steelblue");
        d3.select("#tooltip").remove();
      });
  }, [trades, mode, sanitizedMode]);

  return <div id={`cumulativePL${sanitizedMode}`}></div>;
};

export default CumulativePLChart;
