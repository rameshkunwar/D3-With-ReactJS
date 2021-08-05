import React, { createRef, useState } from "react";

const useRefDimensions = (ref) => {
  const [dimension, setDimensions] = useState({});
  React.useEffect(() => {
    if (ref.current) {
      const { current } = ref;
      const boundingRect = current.getBoundingClientRect();
      const { width, height } = boundingRect;
      console.info("width: " + width);
      setDimensions({ width: width, height: height });
    }
  }, [ref]);
  return dimension;
};
export default function DynamicWidth() {
  const divRef = createRef();
  const dimensions = useRefDimensions(divRef);
  const divWidth = 348;
  const divHeight = 177;
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <div
        ref={divRef}
        style={{
          margin: "50px",
          width: "70%",
          height: "70%",
          border: "1px solid black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Dimensions: {dimensions.width}w {dimensions.height}h
      </div>
    </div>
  );
}
