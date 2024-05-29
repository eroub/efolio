// CorrelationMatrix.tsx
// External Libraries
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
// Internal Utilities / Assets / Themes
import { useAppColorScheme } from "../../hooks/useAppColorScheme";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface CorrelationMatrixProps {
  trades: Trade[];
}

// Helper function to calculate the Pearson correlation coefficient
const calculateCorrelation = (data: number[][]) => {
    const n = data.length;
    const mean = (values: number[]) => values.reduce((a, b) => a + b) / n;
    const stdDev = (values: number[], mean: number) =>
      Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
  
    const metricsCount = data[0].length;
    const correlations: number[][] = Array.from({ length: metricsCount }, () => Array(metricsCount).fill(0));
  
    for (let i = 0; i < metricsCount; i++) {
      for (let j = 0; j < metricsCount; j++) {
        if (i === j) {
          correlations[i][j] = 1;
        } else {
          const x = data.map(row => row[i]);
          const y = data.map(row => row[j]);
          const meanX = mean(x);
          const meanY = mean(y);
          const stdDevX = stdDev(x, meanX);
          const stdDevY = stdDev(y, meanY);
          const covXY = x.map((val, index) => (val - meanX) * (y[index] - meanY)).reduce((a, b) => a + b) / n;
          correlations[i][j] = covXY / (stdDevX * stdDevY);
        }
      }
    }
  
    return correlations;
  };  

  const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
    trades,
  }) => {
    // Styling
    const colorScheme = useAppColorScheme();
  
    // Initialize state for SVG dimensions
    const [svgDimensions, setSvgDimensions] = useState({
      width: window.innerWidth * 0.9,
      height: 500  // Keeping height fixed, but you can make it dynamic as needed
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
        // Extract relevant metrics from trades
        const metrics = trades.map(trade => [
          trade.realPL ?? 0,
          trade.realRR ?? 0,
          trade.percentChange ?? 0,
          trade.totalHrs ?? 0,
          trade.size,
          trade.risk,
          trade.estGain,
          trade.estRR,
          trade.mfe ?? 0,
          trade.mae ?? 0,
          trade.mfeRatio ?? 0,
          trade.maeRatio ?? 0,
        ]);
    
        const metricNames = [
          'Real P/L',
          'Real RR',
          'Percent Change',
          'Total Hrs',
          'Size',
          'Risk',
          'Est Gain',
          'Est RR',
          'MFE',
          'MAE',
          'MFE Ratio',
          'MAE Ratio'
        ];
    
        // Calculate correlation matrix
        const correlationMatrix = calculateCorrelation(metrics);
    
        // Remove existing SVG if present
        const id = `correlationMatrix`;
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
        const x = d3.scaleBand()
          .domain(d3.range(correlationMatrix.length).map(String))
          .range([100, width - 100])
          .padding(0.05);
    
        const y = d3.scaleBand()
          .domain(d3.range(correlationMatrix.length).map(String))
          .range([50, height - 50])
          .padding(0.05);
    
        const color = d3.scaleSequential(d3.interpolateRdBu)
          .domain([-1, 1]);
    
        // Append correlation matrix cells
        svg.selectAll()
          .data(correlationMatrix.flatMap((row, i) => row.map((value, j) => ({ x: i, y: j, value }))))
          .enter()
          .append("rect")
          .attr("x", d => x(d.x.toString())!)
          .attr("y", d => y(d.y.toString())!)
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .attr("fill", d => color(d.value));
    
        // Append X-axis labels
        svg.selectAll(".xLabel")
          .data(metricNames)
          .enter()
          .append("text")
          .attr("class", "xLabel")
          .attr("x", (d, i) => x(i.toString())! + x.bandwidth() / 2)
          .attr("y", height - 10)
          .style("text-anchor", "middle")
          .style("font-size", "10px") // Smaller font size
          .attr("transform", (d, i) => `translate(0, -${height - 50}) rotate(-45, ${x(i.toString())! + x.bandwidth() / 2}, ${height - 50})`)
          .text(d => d);
    
        // Append Y-axis labels
        svg.selectAll(".yLabel")
          .data(metricNames)
          .enter()
          .append("text")
          .attr("class", "yLabel")
          .attr("x", 90)
          .attr("y", (d, i) => y(i.toString())! + y.bandwidth() / 2)
          .style("text-anchor", "end")
          .style("font-size", "10px") // Smaller font size
          .attr("transform", "translate(-20,0)")
          .text(d => d);
    
        // Append legend
        const legendWidth = 300;
        const legendHeight = 20;
    
        const legend = svg.append("g")
          .attr("transform", `translate(${width / 2 - legendWidth / 2}, ${height - 40})`);
    
        const legendScale = d3.scaleLinear()
          .domain([-1, 1])
          .range([0, legendWidth]);
    
        const legendAxis = d3.axisBottom(legendScale)
          .ticks(5)
          .tickFormat(d3.format(".2f"));
    
        const legendGradient = legend.append("defs")
          .append("linearGradient")
          .attr("id", "legendGradient")
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "0%");
    
        legendGradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", color(-1));
    
        legendGradient.append("stop")
          .attr("offset", "50%")
          .attr("stop-color", color(0));
    
        legendGradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", color(1));
    
        legend.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#legendGradient)");
    
        legend.append("g")
          .attr("transform", `translate(0, ${legendHeight})`)
          .call(legendAxis);
    
      }, [trades, svgDimensions, colorScheme]);
    
    return <div id="correlationMatrix"></div>;
  };
  
  export default CorrelationMatrix;