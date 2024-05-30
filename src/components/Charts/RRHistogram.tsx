import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import { useAppColorScheme } from "../../hooks/useAppColorScheme"; // Assuming you have this hook for color schemes
import { calculateMaxAdverseExcursionRatio, calculateMaxFavorableExcursionRatio } from "../../utils/statisticCalculations";
import { Trade } from "../../models/TradeTypes"; // Import your Trade type

interface RealizedRRHistogramProps {
  trades: Trade[];
}

const RealizedRRHistogram: React.FC<RealizedRRHistogramProps> = ({ trades }) => {
  // Styling
  const colorScheme = useAppColorScheme();

  // Calculate average MAE and MFE ratios
  const avgMAERatio = -calculateMaxAdverseExcursionRatio(trades);
  const avgMFERatio = calculateMaxFavorableExcursionRatio(trades);

  // Initialize state for SVG dimensions
  const [svgDimensions, setSvgDimensions] = useState({
    width: window.innerWidth * 0.9,
    height: 400,  // Keeping height fixed, but you can make it dynamic as needed
  });

  useEffect(() => {
    // Function to handle resizing
    const handleResize = () => {
      setSvgDimensions({
        width: window.innerWidth * 0.9,
        height: 500,  // Adjust as necessary
      });
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);  // Empty dependency array ensures this runs once on mount and unmount

  useEffect(() => {
    // Filter trades to get realized R:R values
    const rrValues = trades.map(trade => trade.realRR ?? 0);
  
    // Define histogram parameters
    const histogram = d3.histogram()
      .value((d: number) => d)
      .domain(d3.extent(rrValues) as [number, number])
      .thresholds(d3.range(d3.min(rrValues)!, d3.max(rrValues)! + 0.1, 0.1));
  
    const bins = histogram(rrValues);
  
    // Remove existing SVG if present
    const id = `realizedRRHistogram`;
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
    const x = d3.scaleLinear()
      .domain([d3.min(rrValues)! - 1, d3.max(rrValues)! + 1])
      .range([50, width - 50]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)! + 2])
      .range([height - 50, 0]);
  
    // Create axis
    const xAxis = d3.axisBottom(x).tickFormat(d3.format(".1f"));
    const yAxis = d3.axisLeft(y).ticks(10);
  
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
      .style("font-family", "Arial, sans-serif"); // Change font family
  
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
  
    // Create bars with tooltips
    const bar = svg.selectAll(".bar")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 1)
      .attr("transform", d => `translate(${x(d.x0!)}, ${y(d.length)})`)
      .attr("width", x(bins[0].x1!) - x(bins[0].x0!) - 1)
      .attr("height", d => height - 50 - y(d.length))
      .attr("fill", "steelblue")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("fill", "orange");
  
        const tooltipX = x(d.x0!) + (x(d.x1!) - x(d.x0!)) / 2;
        const tooltipY = y(d.length) - 10;
  
        svg
          .append("text")
          .attr("id", "tooltip")
          .attr("x", tooltipX)
          .attr("y", tooltipY)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", colorScheme === "dark" ? "#E6E3D3" : "black")
          .text(`R:R Range: ${d.x0!.toFixed(1)} - ${d.x1!.toFixed(1)}, #: ${d.length}`);
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", "steelblue");
        d3.select("#tooltip").remove();
      });
  
    // Append X-axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .text("Realized R:R")
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
      .text("Frequency")
      .attr("fill", "black")
      .style("font-size", "14px") // Adjust font size for better clarity
      .style("font-family", "Arial, sans-serif"); // Change font family
  
    // Plot average MAE and MFE ratios as lines
    svg.append("line")
      .attr("x1", x(avgMAERatio))
      .attr("x2", x(avgMAERatio))
      .attr("y1", y(0))
      .attr("y2", y(d3.max(bins, d => d.length)!))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4");
  
    svg.append("text")
      .attr("x", x(avgMAERatio))
      .attr("y", height - 35)
      .style("text-anchor", "middle")
      .style("fill", "red")
      .style("font-size", "12px")
      .style("font-family", "Arial, sans-serif")
      .text(`Avg MAE: ${avgMAERatio.toFixed(2)}`);
  
    svg.append("line")
      .attr("x1", x(avgMFERatio))
      .attr("x2", x(avgMFERatio))
      .attr("y1", y(0))
      .attr("y2", y(d3.max(bins, d => d.length)!))
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4");
  
    svg.append("text")
      .attr("x", x(avgMFERatio))
      .attr("y", height - 35)
      .style("text-anchor", "middle")
      .style("fill", "green")
      .style("font-size", "12px")
      .style("font-family", "Arial, sans-serif")
      .text(`Avg MFE: ${avgMFERatio.toFixed(2)}`);
  
    // Add a black line at x = 0
    svg.append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", y(0))
      .attr("y2", y(d3.max(bins, d => d.length)!))
      .attr("stroke", "black")
      .attr("stroke-width", 2);
    
    // Create the density curve
    const kde = kernelDensityEstimator(kernelEpanechnikov(0.3), x.ticks(100));
    const density = kde(rrValues);
    
    // Scale the density to fit the histogram
    const densityScale = d3.scaleLinear()
      .domain([0, d3.max(density, d => d[1])!])
      .range([height - 50, 0]);

    // Append the density curve
    svg.append("path")
      .datum(density)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x((d: any) => x(d[0]))
        .y((d: any) => densityScale(d[1]))
      );
  
  }, [trades, svgDimensions, colorScheme, avgMAERatio, avgMFERatio]);

  return <div id={`realizedRRHistogram`}></div>;
};

// Kernel Density Estimator function
function kernelDensityEstimator(kernel, X) {
  return function (V) {
    return X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
  };
}

function kernelEpanechnikov(k) {
  return function (v) {
    return Math.abs(v / k) <= 1 ? 0.75 * (1 - (v / k) ** 2) / k : 0;
  };
}

export default RealizedRRHistogram;
