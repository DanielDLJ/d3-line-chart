import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import styles from "../styles/components/LineChart.module.css";
import precipitationDataStatic from "../constants/precipitationData"
import temperatureDataStatic from "../constants/temperatureData"
import axios from "axios";

interface climateWebData {
  year: number | Date ;
  data: number;
}

interface lineChartProps {
  width: number;
  height: number;
}

interface formatDataProps {
  temperature: climateWebData[];
  precipitation: climateWebData[];
}

export function LineChart(props: lineChartProps) {
  const [temperatureData, setTemperatureData] = useState<climateWebData[] | null>(null)
  const [precipitationData, setPrecipitationData] = useState<climateWebData[] | null>(null)
  const [minTemperature, setMinTemperature] = useState<climateWebData | null>(null)
  const [maxTemperature, setMaxTemperature] = useState<climateWebData | null>(null)
  const [isFormatted, setIsFormatted] = useState<Boolean>(false)


  let width = props.width;
  let height = props.height;

  let tooltip ;
  let tooltipLine
  let states, tipBox;

  var xScale;
  var svg;

  useEffect(()=>{
    getAllData()
  },[])

  useEffect(()=>{
    if(isFormatted)
      renderMultiChart();
  },[isFormatted])

  async function getAllData(){
    let promiseArray = [
      axios.get("http://climatedataapi.worldbank.org/climateweb/rest/v1/country/cru/tas/year/bra"),
      axios.get("http://climatedataapi.worldbank.org/climateweb/rest/v1/country/cru/pr/year/bra")
    ]
    Promise.all(promiseArray).then(values => {
      formatData({temperature: values[0].data, precipitation: values[1].data})
    }).catch(error=> {
      formatData({temperature: temperatureDataStatic, precipitation: precipitationDataStatic})
    });
  }


  function formatData(props: formatDataProps) {
    let minAux: climateWebData | null = null, maxAux: climateWebData | null = null;
    setTemperatureData(()=> {
      return props.temperature.map( (item: climateWebData, idx: number) => {
        item.year = new Date(item.year as number,1,1)
        if (idx === 0) {
          minAux = { data: item.data, year: item.year };
          maxAux = { data: item.data, year: item.year };
        } else {
          if (item.data < minAux.data) minAux = { data: item.data, year: item.year };
          if (item.data > maxAux.data) maxAux = { data: item.data, year: item.year };
        }
        return item
      });
    })

    setMaxTemperature(()=>{return maxAux})
    setMinTemperature(()=>{return minAux})

    setPrecipitationData(()=> {
      return props.precipitation.map((item: climateWebData) => {
        // console.log("2",parseDate(String(item.year)))
        item.year = new Date(item.year as number,1,1)
        return item
      });
    })

    setIsFormatted(true)
  }


  function renderMultiChart() {
    var margin = { top: 20, right: 50, bottom: 40, left: 45 };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;
    var lineOpacity = "0.6";


    /* Scale */
    xScale = d3
      .scaleTime()
      .domain(d3.extent(temperatureData, (d: climateWebData) => d.year))
      .range([0, width])

    var yScaleTemperature = d3
      .scaleLinear()
      .domain([0, d3.max(temperatureData, (d: climateWebData) => d.data)])
      .range([height, 0]);

    var yScalePrecipitation = d3
      .scaleLinear()
      .domain([0, d3.max(precipitationData, (d: climateWebData) => d.data)])
      .range([height, 0]);

    /* Add SVG */
    //remove Old
    d3.select("svg").remove();
    //create new
    svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /* Temperature Line */
    var lineTemperature = d3
      .line<climateWebData>()
      .x((d: climateWebData) => xScale(d.year))
      .y((d: climateWebData) => yScaleTemperature(d.data));

    svg
      .append("path")
      .datum(temperatureData)
      .attr("class", "line")
      .attr("d", lineTemperature)
      .style("stroke", "var(--purple)")
      .style("opacity", lineOpacity);

    /* Precipitation Line */
    var linePrecipitation = d3
      .line<climateWebData>()
      .x((d: climateWebData) => xScale(d.year))
      .y((d: climateWebData) => yScalePrecipitation(d.data));
    svg
      .append("path")
      .datum(precipitationData)
      .attr("class", "line")
      .attr("d", linePrecipitation)
      .style("stroke", "var(--orage)")
      .style("opacity", lineOpacity);
    /* */
    tipBox = svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', 0)
      .on('mousemove', (event: Event)=>drawTooltip(event))
      .on('mouseout', removeTooltip)


    tooltipLine = svg.append('line');
    tooltip = d3.select('#tooltip');

    /* Add Axis into SVG */
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScaleTemperature).ticks(8);
    var yAxis2 = d3.axisRight(yScalePrecipitation).ticks(7);

    //X year
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .style("font-size", 15)
      // .attr("y", 40)
      .attr(
        "transform",
        "translate(" + width / 2 + "," + (margin.bottom - 7) + ")"
      )
      .attr("fill", "black")
      .text("Time");

    //Y Temperatura
    svg
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .style("font-size", 19)
      // .attr("y", 30)
      .attr("transform", "translate(-30," + height / 4 + ")rotate(-90)")
      .attr("fill", "var(--purple)")
      .text("Temperatura");

    //Y Precipitation
    svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis2)
      .append("text")
      .style("font-size", 19)
      // .attr("y", 40)
      .attr("transform", "translate(45," + height / 2 + ")rotate(-90)")
      .attr("fill", "var(--orage)")
      .text("Precipitation");

    //Min temperatura
    if(minTemperature !== null){
      svg
        .append("rect")
        .attr("x", xScale(minTemperature.year))
        .attr("width", 3)
        .attr("height", height)
        // .attr("stroke", "black")
        .style("fill", "var(--blue-light)")
        .style("fill-opacity", 0.2);

  
      //Max temperatura
      svg
        .append("rect")
        .attr("x", xScale(maxTemperature.year))
        .attr("width", 3)
        .attr("height", height)
        // .attr("stroke", "black")
        .style("fill", "var(--red-dark)")
        .style("fill-opacity", 0.3);
    }

  }

  function removeTooltip() {
    if (tooltip) tooltip.style('display', 'none');
    if (tooltipLine) tooltipLine.attr('stroke', 'none');
  }
  
  function drawTooltip(event: Event) {
    const year = xScale.invert(d3.pointer(event)[0])
    let auxTemperatureData = temperatureData.filter(fitem => (fitem.year as Date).getFullYear() === year.getFullYear())
    let auxPrecipitationData = precipitationData.filter(fitem => (fitem.year as Date).getFullYear() === year.getFullYear())

    tooltipLine.attr('stroke', 'black')
      .attr('x1', xScale(year))
      .attr('x2', xScale(year))
      .attr('y1', 0)
      .attr('y2', height);
  }

  return (
    <div className={styles.ContainerLineChart}>
      <div className={styles.chart} id="chart" />
    </div>
  );
}
