import * as d3 from "d3";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

function DanmarkKort({ width, height, landKortData, svgParentDivRef }) {
 const svgRef = useRef();
 const localDivRef = useRef();

 const [localData, setLocalData] = useState([]);
 const [widthHeightScale, setWidthHeightScale] = useState(null);

 const lattop = 57.9;
 const lonleft = 7.8;
 const lonright = 15.3;
 const scalemap = 56;

 useEffect(() => {
  const totalWidth = localDivRef.current.clientWidth;
  console.info("svgParentDivRef.current.clientWidth: " + totalWidth);

  if (totalWidth === 0) return false;

  //Set width for d3
  const windowInnerHeight = window.innerHeight;
  console.info("window.innerHeight: " + window.innerHeight);
  const d3MinWidth = d3.min([totalWidth, windowInnerHeight / 0.8]);

  //set width and height
  const width = d3MinWidth * 0.95;
  const height = width * 0.8;
  const scale = (scalemap * width) / (lonright - lonleft);

  setWidthHeightScale({ height: height, width: width, scale: scale });
 }, []);

 useEffect(() => {
  if (widthHeightScale !== null) {
   drawGeoMap({ ...widthHeightScale });
  }
 }, [landKortData]);

 useLayoutEffect(() => {
  if (localData.length !== 0) {
   //drawGeoMap();
   const params = { ...widthHeightScale, kommunalData: localData };
   drawSingleKommune({ ...params });
  }
 }, [localData]);

 const handleClick = (evt, item) => {
  console.warn("click event captured from handleClick function");
  console.log("properties: ");
  console.log({ item });
  //   let prop = d.path[0].__data__.properties;
  //   console.info({ prop });
  setLocalData(item);
 };

 const drawGeoMap = ({ height, width, scale }) => {
  //   const lattop = 57.9;
  //   const lonleft = 7.8;
  //   const lonright = 15.3;
  //   const scalemap = 56;

  //   const totalWidth = localDivRef.current.clientWidth;
  //   console.info("svgParentDivRef.current.clientWidth: " + totalWidth);

  //   if (totalWidth === 0) return false;
  //   if (landKortData.length === 0) return false;

  //   //Set width for d3
  //   const windowInnerHeight = window.innerHeight;
  //   console.info("window.innerHeight: " + window.innerHeight);
  //   const d3MinWidth = d3.min([totalWidth, windowInnerHeight / 0.8]);

  //   //set width and height
  //   const width = d3MinWidth * 0.95;
  //   const height = width * 0.8;
  //   const scale = (scalemap * width) / (lonright - lonleft);

  //projection
  let projection = d3.geoMercator().scale(scale).translate([0, 0]);
  const projectionPoint = projection([lonleft, lattop]);

  if (!projectionPoint) alert("obs! invalid projection point from projection");

  console.info(
   "projectionPoint: " + projectionPoint[0] + " - " + projectionPoint[1]
  );

  projection.translate([-1 * projectionPoint[0], -1 * projectionPoint[1]]);

  //define path generator
  const path = d3.geoPath(projection);

  //create svg element
  const svg = d3
   .select(localDivRef.current)
   .append("svg")
   .attr("id", "dkkort")
   .attr("width", width)
   .attr("height", height);

  svg
   .append("rect")
   .attr("class", "background")
   .attr("width", width)
   .attr("height", height);

  const g = svg.append("g");

  g.selectAll("path")
   .append("g")
   .data(landKortData.features)
   .enter()
   .append("path")
   .attr("d", path)
   .attr("fill", "teal")
   .attr("stroke", "lightgray")
   .attr("stroke-width", "0.2")
   .on("click", (d, item) => {
    let komm = item.properties;
    console.info({ komm });
    handleClick(d, item);
   });
 }; /** end of function drawGeoMap */

 function drawSingleKommune({ height, width, scale, kommunalData }) {
  //projection
  let projection = d3.geoMercator().scale(scale).translate([0, 0]);
  const projectionPoint = projection([lonleft, lattop]);

  if (!projectionPoint) alert("obs! invalid projection point from projection");

  console.info(
   "projectionPoint: " + projectionPoint[0] + " - " + projectionPoint[1]
  );

  projection.translate([-1 * projectionPoint[0], -1 * projectionPoint[1]]);

  //define path generator
  const path = d3.geoPath(projection);

  //create svg element
  const svg = d3
   .select(localDivRef.current)
   .append("svg")
   .attr("id", "dkkort")
   .attr("width", width)
   .attr("height", height);

  svg
   .append("rect")
   .attr("class", "background")
   .attr("width", width)
   .attr("height", height);

  const g = svg.append("g");
  const individualFeature = [];
  individualFeature.push(kommunalData);

  g.selectAll("path")
   .append("g")
   .data(individualFeature)
   .enter()
   .append("path")
   .attr("d", path)
   .attr("fill", "teal")
   .attr("stroke", "lightgray")
   .attr("stroke-width", "0.2")
   .on("click", (d, item) => {
    let komm = item.properties;
    console.info({ komm });
    handleClick(d, item);
   });
 }

 return (
  <div className='kort-placeholder' ref={localDivRef}>
   {/* <svg ref={svgRef}></svg> */}
  </div>
 );
}
export default DanmarkKort;
