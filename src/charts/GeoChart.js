import * as d3 from "d3";
import {
 useCallback,
 useEffect,
 useLayoutEffect,
 useRef,
 useState,
} from "react";

import DenmarkGeo from "../src/assets/DenmarkGeo.json";

const BarChart = ({ chartRef }) => {
 const lattop = 57.9;
 const lonleft = 7.8;
 const lonright = 15.3;
 const scalemap = 56;

 const [totalWidth, setTotalWidth] = useState(0);
 const [windowInnerHeight, setWindowInnerHeight] = useState(0);
 const [isResized, setIsResized] = useState(false);
 const [isResetCalled, setIsResetCalled] = useState(false);

 //get clientWidth
 //  const handleResize = () => {
 //   setIsResized(true);
 //   updateClientWidth();
 //  };
 const updateClientWidth = () => {
  setTotalWidth(chartRef.current.clientWidth);
 };

 useEffect(() => {
  updateClientWidth();
  setWindowInnerHeight(window.innerHeight);
 }, [updateClientWidth]);

 //  useEffect(() => {
 //   window.addEventListener("resize", handleResize);

 //   return () => {
 //    window.removeEventListener("resize", handleResize);
 //   };
 //  });

 useLayoutEffect(() => {
  if (isResetCalled) {
   initD3();
  }
 }, [isResetCalled]);

 useLayoutEffect(() => {
  initD3();
 });

 const initD3 = () => {
  if (totalWidth === 0) return false;

  //set d3 width
  //Map properties
  const setWidth = d3.min([totalWidth, windowInnerHeight / 0.8]);

  //width and height
  let w = setWidth * 0.95;
  let h = w * 0.8;
  let zoonExtent = 500;
  let scale = (scalemap * w) / (lonright - lonleft);
  let kommune = "";
  let textHeight = h * 0.032;

  //define map projection
  let projection = d3.geoMercator().scale(scale).translate([0, 0]);

  //   let projection = d3.geoMercator().fitExtent(
  //    [
  //     [0, 0],
  //     [w, h],
  //    ],
  //    DenmarkGeo
  //   );

  //let trans1 = d3.geoProjection[(lonleft, lattop)];
  let trans = projection([lonleft, lattop]);
  if (!trans) {
   trans = [1131.0243189064836, -10350.78454590789];
  }
  projection.translate([-1 * trans[0], -1 * trans[1]]);

  const zoom = d3
   .zoom()
   .scaleExtent([1, zoonExtent])
   .translateExtent([
    [0, 0],
    [w, h],
   ])
   .on("zoom", zoomed);

  //Define path generator
  const path = d3.geoPath(projection);
  let xPosition = 20;
  let yPosition = 20;
  let xZoomScale = 1;
  let yZoomScale = 1;

  //Create svg element
  let svg = d3
   .select(chartRef.current)
   .append("svg")
   .attr("id", "svg")
   .attr("width", w)
   .attr("height", h);

  svg
   .append("rect")
   .attr("class", "background")
   .attr("width", w)
   .attr("height", h);

  let g = svg.append("g");
  svg.call(zoom);

  //   let csv = await d3.csv(require("../src/assets/ordTimer.csv"));
  // d3.csv(
  //  "https://raw.githubusercontent.com/kgronpug/d3map/master/ordTimer.csv",
  //  function (csv) {
  //   csv.forEach((d) => {
  //    d.VALUE = +d.VALUE;
  //   });

  d3
   .csv("https://raw.githubusercontent.com/kgronpug/d3map/master/ordTimer.csv")
   .then(function (csv) {
    csv.forEach((d) => {
     d.VALUE = +d.VALUE;
    });

    let maxValue = d3.max(csv, (d) => {
     return d.VALUE;
    });

    //Load GeoJSON data
    //   let json = await d3.json(require("../src/assets/kommuner2.json"));
    d3
     .json(
      "https://raw.githubusercontent.com/kgronpug/d3map/master/kommuner2.json"
     )
     .then(function (json) {
      for (let i = 0; i < csv.length; i++) {
       //Grab state name
       let csvKom = csv[i].KOMNAVN;

       //Grab data value, and convert from string to float
       let csvValue = parseFloat(csv[i].VALUE);
       let csvRegion = csv[i].REGION;

       for (let j = 0; j < json.features.length; j++) {
        let jsonKom = json.features[j].properties.KOMNAVN;

        if (csvKom == jsonKom) {
         //Copy the data value into the JSON
         json.features[j].properties.value = csvValue;
         json.features[j].properties.region = csvRegion;
        }
       }
      }

      //Bind data and create one path per GeoJSON feature
      g.selectAll("path")
       .append("g")
       .data(json.features)
       .enter()
       .append("path")
       .attr("d", path)
       .attr("fill", "teal")
       .attr("stroke", "lightgray")
       .attr("stroke-width", "0.2")
       .on("click", clicked)
       .on("wheel", resetColor)
       .on("mouseover", function (evt, d) {
        var highlightKom = d.properties.KOMNAVN;
        d3
         .selectAll("path")
         .filter(function (d) {
          return d.properties.KOMNAVN == highlightKom;
         })
         .attr("fill-opacity", "0.7");
        tooltip.style("display", null);
       })
       .on("mouseout", function (evt, d) {
        var highlightKom = d.properties.KOMNAVN;
        d3
         .selectAll("path")
         .filter(function (d) {
          return d.properties.KOMNAVN == highlightKom;
         })
         .attr("fill-opacity", "1");
        tooltip.style("display", "none");
       })
       .on("mousemove", function (evt, d) {
        var xPosition = d3.pointer(evt)[0] - 5 / xZoomScale;
        var yPosition = d3.pointer(evt)[1] - 5 / yZoomScale;
        tooltip.attr(
         "transform",
         "translate(" + xPosition + "," + yPosition + ")"
        );
        tooltip.text(d.properties.KOMNAVN);
       });

      var tooltip = g
       .append("text")
       .attr("id", "tooltip")
       .style("display", "none")
       .style("text-anchor", "end")
       .attr("font-size", textHeight)
       .attr("font-weight", "bold");

      function clicked(evt, d) {
       const event = evt || window.Event;
       //  event.stopPropagation();
       //  event.stopImmediatePropagation();
       let zoomExtent = 500;
       //removeChart();
       tooltip.style("display", "none");

       if (d.properties.KOMNAVN == kommune) return reset();
       d3.selectAll("path").attr("fill", "teal");

       kommune = d.properties.KOMNAVN;
       let region = d.properties.region;

       let ChartData = csv.filter(function (d) {
        return (
         d.KOMNAVN == kommune ||
         d.KOMNAVN == region ||
         d.KOMNAVN == "Hele landet"
        );
       }); /** end of ChartData */

       var filteredFeatures = json.features.filter(function (f) {
        return f.properties.KOMNAVN == kommune;
       });

       var kommuneFeatures = {
        type: "FeatureCollection",
        features: filteredFeatures,
       };

       var bounds = path.bounds(kommuneFeatures),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(
         1,
         Math.min(zoomExtent, 0.95 / Math.max(dx / w, dy / h))
        ),
        translate = [w / 2 - scale * x, h / 2 - scale * y];

       svg
        .transition()
        .duration(750)
        .call(
         zoom.transform,
         d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );

       d3
        .selectAll("path")
        .filter(function (d) {
         return d.properties.KOMNAVN == kommune;
        })
        .attr("fill", "darkred");

       drawChart(ChartData, maxValue);
      } //clicked ends
     });
   });

  function zoomed(event) {
   g.attr("transform", event.transform);
   g.selectAll("text")
    .attr("font-size", function () {
     var textHeight = (h * 0.032) / event.transform.k;
     return textHeight;
    })
    .attr("transform", function () {
     xZoomScale = event.transform.k;
     yZoomScale = event.transform.k;
     //var xPosition = (mouse(this)[0])-5/xZoomScale;
     //var yPosition = (mouse(this)[1])-5/yZoomScale;
     //console.log(xPosition, yPosition);
     //return "translate(" + xPosition + "," + yPosition + ")"
    });
  }

  function drawChart(ChartData, maxValue) {
   //Hvid gennemsigtig baggrund

   svg
    .append("rect")
    .attr("id", "chartRect")
    .on("click", reset)
    .on("wheel", reset)
    .attr("fill", "whitesmoke")
    .style("opacity", 0)
    .transition()
    .delay(0)
    .duration(750)
    .style("opacity", 0.85)
    .attr("width", w)
    .attr("height", h)
    .attr("x", 0)
    .attr("y", 0);

   //Titel tekst
   svg
    .append("text")
    .attr("id", "introText")
    .attr("font-size", h * 0.055)
    .style("opacity", 0)
    .attr("x", w * 0.1)
    .attr("y", h * 0.12)
    .transition()
    .delay(500)
    .duration(750)
    .style("opacity", 1)
    .text("Hoved Titel her");

   //Beskrivende tekst
   svg
    .append("text")
    .attr("id", "introText")
    .attr("font-size", h * 0.04)
    .style("opacity", 0)
    .attr("x", w * 0.1)
    .attr("y", h * 0.17)
    .transition()
    .delay(500)
    .duration(750)
    .style("opacity", 1)
    .text("Sub Titel");
   //  svg
   //   .append("text")
   //   .attr("id", "introText")
   //   .attr("font-size", h * 0.04)
   //   .style("opacity", 0)
   //   .attr("x", w * 0.1)
   //   .attr("y", h * 0.22)
   //   .transition()
   //   .delay(500)
   //   .duration(750)
   //   .style("opacity", 1)
   //   .text("samtidig med at de har modtaget kontanthjælp i november 2017.");

   //Bars til figuren
   svg
    .selectAll("chartBars")
    .data(ChartData)
    .enter()
    .append("g")
    .append("rect")
    .attr("width", 0)
    .attr("height", h * 0.13)
    .attr("x", w * 0.1)
    .attr("y", function (d, i) {
     return i * (h * 0.2) + h * 0.35;
    })
    .attr("id", "chartBars")
    .attr("fill", "teal")
    .transition()
    .delay(500)
    .duration(750)
    .attr("width", function (d, i) {
     return (d.VALUE / 26) * (w * 0.8);
    });

   svg
    .selectAll("labelText")
    .data(ChartData)
    .enter()
    .append("text")
    .attr("id", "labelText")
    .attr("font-size", h * 0.055)
    .style("opacity", 0)
    .attr("x", w * 0.1)
    .attr("y", function (d, i) {
     return i * (h * 0.2) + h * 0.335;
    })
    .transition()
    .delay(500)
    .duration(750)
    .style("opacity", 1)
    .text(function (d) {
     return d.KOMNAVN;
    });

   svg
    .selectAll("valueText")
    .data(ChartData)
    .enter()
    .append("text")
    .attr("id", "valueText")
    .attr("text-anchor", "end")
    .attr("font-size", h * 0.06)
    .style("fill", function (d) {
     if (d.VALUE < 1) {
      return "black";
     } else {
      return "white";
     }
    })
    .style("opacity", 0)
    .attr("x", function (d) {
     return d3.max([(d.VALUE / maxValue) * (w * 0.8) + w * 0.08, w * 0.12]);
    })
    .attr("y", function (d, i) {
     return i * (h * 0.2) + h * 0.435;
    })
    .transition()
    .delay(1000)
    .duration(750)
    .style("opacity", 1)
    .text(function (d) {
     if (d.VALUE == 0) {
      return "-";
     } else {
      return d3.format(".1f")(d.VALUE);
     }
    });
  }

  function removeChart() {
   d3
    .select(chartRef.current)
    .transition()
    .duration(750)
    .style("opacity", 0)
    .remove();
   d3.selectAll("#chartBars").remove();
   d3.selectAll("#introText").remove();
   d3.selectAll("#labelText").remove();
   d3.selectAll("#valueText").remove();
  } //end of function removeChart()

  function newRemoveChart() {
   const group = d3.select(chartRef.current);
   group.exit().remove();
  }

  function resetColor() {
   removeChart();
   kommune = "";

   d3.selectAll("path").transition().attr("fill", "teal");
  }

  function reset() {
   //removeChart();
   kommune = "";
   svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
   d3.selectAll("path").transition().attr("fill", "teal");

   d3.selectAll("#chartBars").remove();
   d3.selectAll("#introText").remove();
   d3.selectAll("#labelText").remove();
   d3.selectAll("#valueText").remove();

   //d3.select("#myChart").transition().duration(750).remove();

   //initD3();
  }

  function zoomed(event) {
   g.attr("transform", event.transform);
   g.selectAll("text")
    .attr("font-size", function () {
     var textHeight = (h * 0.032) / event.transform.k;
     return textHeight;
    })
    .attr("transform", function () {
     xZoomScale = event.transform.k;
     yZoomScale = event.transform.k;
     //var xPosition = (mouse(this)[0])-5/xZoomScale;
     //var yPosition = (mouse(this)[1])-5/yZoomScale;
     //console.log(xPosition, yPosition);
     //return "translate(" + xPosition + "," + yPosition + ")"
    });
  }
 };
 return null;
};
export default BarChart;
