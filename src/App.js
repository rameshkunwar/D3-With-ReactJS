import { useEffect, useRef, useState } from "react";
import axios from "axios";
import DanmarkKort from "./charts/DanmarkKort";
import GeoDanmark from "./charts/GeoChart";
import BarChart from "./charts/GeoChart";

function App() {
  //   const [mapData, setMapData] = useState([]);

  const kortRef = useRef();

  //   useEffect(() => {
  //     const fetchCoordinates = async () => {
  //       return await axios("./kommuner2.json");
  //     };
  //     fetchCoordinates().then((result) => setMapData(result.data));
  //   }, []);

  //  useEffect(() => {
  //   async function getJsonCoordinates() {
  //    const res = await fetch("./kommuner2.json");
  //    const result = await res.json();
  //    return result;
  //   }
  //   getJsonCoordinates().then((data) => setMapData(data));
  //  }, []);

  return (
    <div className='App'>
      {/* <h2>D3 med kort eksempel</h2> */}
      <div id='dkgeo' ref={kortRef}>
        {/* <DanmarkKort
     width={800}
     height={600}
     landKortData={mapData}
     svgParentDivRef={kortRef}
    /> */}
        <BarChart chartRef={kortRef} />
      </div>
    </div>
  );
}

export default App;
