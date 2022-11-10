import React, { useEffect, useState } from "react";
import usePan from "./usePan/usePan";
import useZoom from "./useZoom/useZoom";

const animateCanvasClosure = () => {
  let animating = false;

  function animateCanvas(...args: Array<() => void>) {
    if (!animating) {
      return;
    }

    for (const arg of args) {
      arg();
    }

    requestAnimationFrame(() => animateCanvas(...args));
  }

  function setAnimate(progress: boolean) {
    animating = progress;
  }

  return { animating, animateCanvas, setAnimate };
};

const drawZoomAndPosition = (
  getZoom: () => number,
  ctx: CanvasRenderingContext2D,
  canvasRef: HTMLCanvasElement,
  getCameraOffset: () => {
    x: number;
    y: number;
  }
) => {
  canvasRef.width = window.innerWidth;
  canvasRef.height = window.innerHeight;

  ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
  ctx.scale(getZoom(), getZoom());
  const OGWidth = -window.innerWidth / 2;
  const OGHeight = -window.innerHeight / 2;

  ctx.translate(OGWidth + getCameraOffset().x, OGHeight + getCameraOffset().y);

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
};

const { animating, animateCanvas, setAnimate } = animateCanvasClosure();

export const useCanvasPositioner = (
  canvasRef: React.MutableRefObject<HTMLCanvasElement | undefined>,
  handleDrawAllItems: (context: CanvasRenderingContext2D) => void
) => {
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D>();

  const { zooming, getZoom } = useZoom(canvasRef);
  const { panning, getCameraOffset } = usePan(canvasRef, getZoom);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");

      if (context) {
        setCanvasContext(context);
        drawZoomAndPosition(
          getZoom,
          context,
          canvasRef.current,
          getCameraOffset
        );

        handleDrawAllItems(context);
      }
    }
  }, []);

  useEffect(() => {
    const animate = zooming || panning;

    if (animate && !animating && canvasContext && canvasRef.current) {
      setAnimate(true);

      // mutate positioned images
      // no need coordinates stay the same

      animateCanvas(
        () =>
          drawZoomAndPosition(
            getZoom,
            canvasContext,
            canvasRef.current!,
            getCameraOffset
          ),
        () => handleDrawAllItems(canvasContext)
      );
    } else {
      setAnimate(animate);
    }
  }, [zooming, panning]);
};
