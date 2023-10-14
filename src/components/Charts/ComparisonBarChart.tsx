// RRComparisonBarChart.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect } from "react";
// Internal Utilities / Assets / Themes
import { formatCurrency } from "../../utils/formatters";
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface ComparisonChartProps {
  trades: Trade[];
  mode: "$" | "R:R";
}

interface ChartData {
  label: string;
  value: number;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ trades, mode }) => {
  // Styling
  const colorScheme = useAppColorScheme();
  const sanitizedMode = mode.replace(":", "").replace("$", "dollar"); // Sanitize the mode
  useEffect(() => {
    // Aggregate Real ($/R:R) for Winning and Losing trades
    let winValue = 0,
      lossValue = 0;

    trades.forEach((trade) => {
      if (mode === "$") {
        // Assuming trade.realPL is your profit/loss in $
        trade.realPL !== null &&
          (trade.realPL > 0
            ? (winValue += trade.realPL)
            : (lossValue += trade.realPL));
      } else {
        // For R:R
        trade.realRR !== null &&
          (trade.realRR > 0
            ? (winValue += trade.realRR)
            : (lossValue += trade.realRR));
      }
    });

    const data: ChartData[] = [
      { label: `Winning ${mode}`, value: winValue },
      { label: `Losing ${mode}`, value: lossValue },
    ];

    // Define dimensions
    const width = 300,
      height = 200;

    // Remove existing SVG if present
    d3.select(`#comparisonBarChart-${sanitizedMode} svg`).remove();

    const svg = d3
      .select(`#comparisonBarChart-${sanitizedMode}`)
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
      .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
      .text(`Win/Loss Comparison (${mode})`);

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
      .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
      .text((d) => (d.value > 0 ? "Gain" : "Loss"));

    // Add Values at the end of bars
    svg
      .selectAll(".bar-value")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-value")
      .attr("x", (d) => x(Math.abs(d.value)) - (mode === "$" ? 70 : 40)) // Adjust this value to place the text at the end of the bar
      .attr("y", (d) => y(d.label)! + 25) // Adjust this value to place the text on top of the bar
      .attr("dy", ".35em")
      .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
      .text((d) => {
        if (mode === "$") {
          return formatCurrency(Number(d.value)); // Use formatCurrency for "$" mode
        }
        return d.value.toFixed(2); // Keep as-is for "R:R" mode
      });
  }, [trades, mode, sanitizedMode, colorScheme]);

  return <div id={`comparisonBarChart-${sanitizedMode}`}></div>;
};

export default ComparisonChart;
