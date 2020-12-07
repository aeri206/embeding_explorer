import React, { useEffect, useState } from 'react';

import * as d3 from 'd3';


let xAxis, yAxis, x, y, series, color, svg, tooltip;

const width = 800;
const height = 200;
const margin = {top : 30, left : 50, bottom : 30, right : 30};




const BottomBarChart = (props) => {

    const [isCount, setCount] = useState(true);

    const onClick = () => {
        setCount(old => !old);
    }
    
    const {data, label, points, update} = props;

    const res = label.reduce((a,b)=> (a[b]=0,a),{});

    let cnt_data = [{name:"false", ...res, }, {name:"missing", ...res}];
    let val_data = [{name:"false", ...res, }, {name:"missing", ...res}];

    svg = d3.select("#bottomBarChart");


    useEffect(() => {
        if (update){
            points.forEach(n => {
                if (data[n].cont > 0){ // missing
                    val_data[1][data[n].label] += data[n].cont;
                    cnt_data[1][data[n].label] += 1;
                }
                if (data[n].trust > 0){
                    val_data[0][data[n].label] += data[n].trust;
                    cnt_data[0][data[n].label] += 1;
                }
            });

            series = d3.stack()
                .keys(label)(cnt_data)
                .map(d => (d.forEach(v => v.key = d.key), d));

            x = d3.scaleLinear()
                .domain([0,data.length])
                .range([margin.left, width - margin.right]);

            y = d3.scaleBand()
                .domain(["missing", "false"])
                .range([margin.top, height - margin.bottom])
                .padding(0.08);

            color = d3.scaleOrdinal()
                .domain(label)
                .range(d3.schemeSpectral[series.length])
                .unknown("#ccc");

            xAxis = g => g
                .attr("transform", `translate(0,${margin.top + (height - margin.top - margin.bottom) * 0.04})`)
                .call(d3.axisTop(x).ticks(width / 100, "s"))
                .call(g => g.selectAll(".domain").remove());

            yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).tickSizeOuter(0))
                .call(g => g.selectAll(".domain").remove());

            
        svg.attr("viewBox", [0, 0, width, height]);


            svg.append("g")
                .selectAll("g")
                .data(series)
                .join("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                .attr("x", d => x(d[0]))
                .attr("y", (d, i) => y(d.data.name))
                .attr("width", d => x(d[1]) - x(d[0]))
                .attr("height", y.bandwidth())
                .on("mouseover", function() { tooltip.style("display", null); })
                .on("mouseout", function() { tooltip.style("display", "none"); })
                .on("mousemove", function(d) {
                    tooltip.attr("transform", `translate(${d.offsetX - 15}, ${d.offsetY - 25} )`);
                    tooltip.select("text").text(d.target.getAttribute("text"));
                })
                .attr("text", d => `${d.key}: ${d[1] - d[0]}`)

                svg.append("g")
                    .call(xAxis);

                svg.append("g")
                    .call(yAxis);

            tooltip = svg.append("g")
                .attr("class", "tooltip")
                .style("display", "none");
                      
                  tooltip.append("rect")
                    .attr("width", 30)
                    .attr("height", 20)
                    .attr("fill", "white")
                    .style("opacity", 0.5);
                  
                  tooltip.append("text")
                    .attr("x", 15)
                    .attr("dy", "1.2em")
                    .style("text-anchor", "middle")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold");
            
        }
        else {
            svg.selectAll("g").remove();
        }
    },[props.update, isCount]);



    return (
        <div id="detailview">
            <button onClick={onClick}>change</button>
            <svg id="bottomBarChart"></svg>
        </div>
    )
    
};

export default BottomBarChart;