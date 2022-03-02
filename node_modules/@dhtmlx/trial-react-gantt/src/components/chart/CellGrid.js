import React, { useEffect, useState } from "react";
import { grid } from "@dhtmlx/trial-lib-gantt";

const CellGrid = ({ width, height, borders, color = "#ebebeb" }) => {
  const [bg, setBg] = useState(null);
  useEffect(() => setBg(grid(width, height, color, borders)), [
    width,
    height,
    color,
    borders,
  ]);

  if (!bg) return null;

  return (
    <div
      style={{ width: "100%", height: "100%", backgroundImage: `url(${bg})` }}
    ></div>
  );
};

export default CellGrid;
