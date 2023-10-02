// RRComparisonBarChart.tsx
import React, { useEffect } from "react";
import * as d3 from "d3";
// Trade Interface
import { Trade } from "../../models/TradeTypes";

interface BarChartProps {
  trades: Trade[];
}

interface ChartData {
  label: string;
  value: number;
}

const RRBarChart: React.FC<BarChartProps> = ({ trades }) => {
  useEffect(() => {
    // Aggregate Real R:R for Winning and Losing trades
    let winRR = 0,
      lossRR = 0;
    trades.forEach((trade) => {
      if (trade.realRR !== null) {
        trade.realRR > 0 ? (winRR += trade.realRR) : (lossRR += trade.realRR);
      }
    });

    const data: ChartData[] = [
      { label: "Winning R:R", value: winRR },
      { label: "Losing R:R", value: lossRR },
    ];

    // Define dimensions
    const width = 400,
      height = 200;

    // Remove existing SVG if present
    d3.select("#rrBarChart svg").remove();

    const svg = d3
      .select("#rrBarChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create scales
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.abs(d.value))!])
      .range([0, width - 100]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, height])
      .padding(0.4);

    // Add Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Win/Loss P/L Comparison (R:R)");

    // Create bars
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => y(d.label)!)
      .attr("width", (d) => x(Math.abs(d.value)))
      .attr("height", y.bandwidth())
      .attr("fill", (d) =>
        d.value >= 0 ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)",
      );

    // Add Labels
    svg
      .selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", 5)
      .attr("y", (d) => y(d.label)! + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .text((d) => (d.value > 0 ? "Gain" : "Loss"));

    // Add Values at the end of bars
    // Add Values at the end of bars, on top
    svg
      .selectAll(".bar-value")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-value")
      .attr("x", (d) => x(Math.abs(d.value)) - 40) // Adjust this value to place the text at the end of the bar
      .attr("y", (d) => y(d.label)! + 25) // Adjust this value to place the text on top of the bar
      .attr("dy", ".35em")
      .text((d) => d.value.toFixed(2));
  }, [trades]);

  return <div id="rrBarChart"></div>;
};

export default RRBarChart;
