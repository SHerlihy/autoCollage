import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { loadImages } from "../drawings/imageLoader";
import { drawAllItems } from "../drawings/sampleDrawing";
import usePan from "./usePan/usePan";
import useZoom from "./useZoom/useZoom";

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

const { animating, animateCanvas, setAnimate } = animateCanvasClosure();

export const Canvas = ({ currentImages }) => {
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D>();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { zooming, getZoom } = useZoom(canvasRef);
  const { panning, getCameraOffset } = usePan(canvasRef, getZoom);

  const loadThenDraw = async (context: CanvasRenderingContext2D) => {
    await loadNewImages(currentImages);
    handleDrawAllItems(context);
  };

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");

    if (currentImages && context) {
      loadThenDraw(context);
    }
  }, [currentImages, canvasRef.current]);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  }, []);

  useLayoutEffect(() => {
    window.onscroll = () => {
      window.scroll(0, 0);
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");

      if (context) {
        setCanvasContext(context);
        drawZoomAndPosition(getZoom, context, canvasRef, getCameraOffset);

        handleDrawAllItems(context);
      }
    }
  }, []);

  useEffect(() => {
    const animate = zooming || panning;

    if (animate && !animating && canvasContext) {
      console.log("animating canvas start");
      setAnimate(true);

      animateCanvas(
        () =>
          drawZoomAndPosition(
            getZoom,
            canvasContext,
            canvasRef,
            getCameraOffset
          ),
        () => handleDrawAllItems(canvasContext)
      );
    } else {
      setAnimate(animate);
    }
  }, [zooming, panning]);

  return (
    <>
      <canvas ref={canvasRef} width={"500"} height={"500"} />
    </>
  );
};

function animateCanvasClosure() {
  let animating = false;

  function animateCanvas(...args) {
    if (!animating) {
      return;
    }

    for (const arg of args) {
      arg();
    }

    requestAnimationFrame(() => animateCanvas(...args));
  }

  function setAnimate(progress) {
    animating = progress;
  }

  return { animating, animateCanvas, setAnimate };
}

function drawZoomAndPosition(getZoom, ctx, canvasRef, getCameraOffset) {
  canvasRef.current.width = window.innerWidth;
  canvasRef.current.height = window.innerHeight;

  ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
  ctx.scale(getZoom(), getZoom());
  const OGWidth = -window.innerWidth / 2;
  const OGHeight = -window.innerHeight / 2;

  ctx.translate(OGWidth + getCameraOffset().x, OGHeight + getCameraOffset().y);

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}
