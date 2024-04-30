import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import { analyzeAndGenerateGPD } from "../../utils/statisticCalculations";
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
import { Trade } from "../../models/TradeTypes";

interface ProbabilityCurveChartProps {
  trades: Trade[];
}

const ProbabilityCurveChart: React.FC<ProbabilityCurveChartProps> = ({ trades }) => {
  const colorScheme = useAppColorScheme();

  // State to store the GPD data
  const [data, setData] = useState<Array<{ xValue: number; yValue: number }>>([]);
  
  // Initialize state for SVG dimensions
  const [svgDimensions, setSvgDimensions] = useState({
    width: window.innerWidth * 0.9,
    height: 400  // Keeping height fixed, adjust as necessary
  });

  useEffect(() => {
    // Function to handle resizing
    const handleResize = () => {
      setSvgDimensions({
        width: window.innerWidth * 0.9,
        height: 400  // Keep consistent with initial state
      });
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Assume analyzeAndGenerateGPD is synchronous, adjust if it's not
    const gpdData = analyzeAndGenerateGPD(trades);
    console.log(gpdData)
    setData(gpdData);  // Update state with new data

    // Remove previous chart elements (if any)
    const chartId = "probabilityCurve";
    d3.select(`#${chartId}`).select("svg").remove();

    const { width, height } = svgDimensions;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Initialize SVG
    const svg = d3.select(`#${chartId}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
      .domain([d3.min(data, d => d.xValue), d3.max(data, d => d.xValue)])
      .range([0, width - margin.left - margin.right]);

    const y = d3.scaleLog()
      .domain([d3.min(data, d => d.yValue > 0 ? d.yValue : null), d3.max(data, d => d.yValue)])
      .range([height, 0])
      .clamp(true);

    // Append axes
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Line generator
    const line = d3.line<{ xValue: number; yValue: number }>()
      .x(d => x(d.xValue))
      .y(d => y(d.yValue))
      .curve(d3.curveMonotoneX);

    // Draw the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colorScheme === "dark" ? "#E6E3D3" : "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

  }, [trades, colorScheme, svgDimensions]);  // Include dependencies

  return <div id="probabilityCurve"></div>;
};

export default ProbabilityCurveChart;