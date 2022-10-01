import React, { useRef } from "react";
import { loadImages } from "../drawings/imageLoader";
import { drawAllItems } from "../drawings/sampleDrawing";
import { Canvas } from "./Canvas";
import { useImageChanger } from "./useImageChanger";
import { useCanvasPositioner } from "./useCanvasPositioner";

const loadedImagesClosure = () => {
  let loadedImages: PromiseSettledResult<HTMLImageElement>[] | undefined;

  const loadNewImages = async (images: Array<string>) => {
    const { getLoadedImages } = loadImages(images);
    loadedImages = await getLoadedImages();
    console.log(loadedImages);
    return;
  };

  const getLoadedImages = () => {
    return loadedImages;
  };

  return { getLoadedImages, loadNewImages };
};

const { getLoadedImages, loadNewImages } = loadedImagesClosure();

const handleDrawAllItems = (context: CanvasRenderingContext2D) => {
  const loadedImages = getLoadedImages();
  if (context && loadedImages) {
    drawAllItems(context, loadedImages);
  }
};

export const CanvasControl = ({ currentImages }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useImageChanger(canvasRef, currentImages, loadNewImages, handleDrawAllItems);

  useCanvasPositioner(canvasRef, handleDrawAllItems);

  return <Canvas canvasRef={canvasRef} />;
};
