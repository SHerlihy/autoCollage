import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
// import { useImageChanger } from "./useImageChanger";
import { useCanvasPositioner } from "./useCanvasPositioner";
import { positionImagesClosure } from "./imagePositioning";

// @ts-ignore
// import cat03 from "../../src/assets/cat03.jpg";

import { determineAgglomeratedPerimeterIds } from "../perimeter/determineAgglomeratedPerimeterIds";

import { useHighlightPerimeter } from "./highlightPerimerterHook";

const {
  handleDrawAllItems,
  handleAddInitialItems,
  getAllImagePoints,
  setCanvasContext,
} = positionImagesClosure();

export const CanvasControl = () => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [perimeterIds, setPerimeterIds] = useState<Array<string>>();

  // can remove later
  useEffect(() => {
    handleAddInitialItems();
  }, []);

  useCanvasPositioner(canvasRef, handleDrawAllItems);

  useEffect(() => {
    const currentContext = canvasRef.current?.getContext("2d");
    if (currentContext) {
      setCanvasContext(currentContext);
    }
  }, [canvasRef.current]);

  useHighlightPerimeter(canvasRef, getAllImagePoints, perimeterIds);

  const handleAgglomerateImages = () => {
    const positionedImagesPoints = getAllImagePoints();

    const perimeterPointIds = determineAgglomeratedPerimeterIds(
      positionedImagesPoints
    );

    setPerimeterIds(perimeterPointIds);

    // save in state
  };

  const handleAddImages = () => {};

  return (
    <main>
      <Canvas canvasRef={canvasRef} />
      <article className="sidebar">
        <button
          onClick={() => {
            // so it loads
            // setImages([cat03]);
            // so it draws
            // handleAddInitialItems();
          }}
        >
          Cats!
        </button>
        <button onClick={handleAgglomerateImages}>Agglomerate</button>
        <button onClick={handleAddImages}>Add Images</button>
      </article>
    </main>
  );
};
