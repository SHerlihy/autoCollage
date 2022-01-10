import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import usePan from "./usePan/usePan";
import useZoom from "./useZoom/useZoom";

export const Canvas = () => {
  const [canvasContext, setCanvasContext] = useState();

  const canvasRef = useRef(null);

  const { zooming, getZoom } = useZoom(canvasRef);
  const { panning, getCameraOffset } = usePan(canvasRef, getZoom);

  useLayoutEffect(() => {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
  }, []);

  useLayoutEffect(() => {
    window.onscroll = () => {
      window.scroll(0, 0);
    };
  }, []);

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    setCanvasContext(context);
    drawZoomAndPosition(getZoom, context, canvasRef, getCameraOffset);
    drawItems(context);
  }, []);

  useEffect(() => {
    if (!zooming && !panning) return;

    animateCanvas(
      zooming || panning,
      () =>
        drawZoomAndPosition(getZoom, canvasContext, canvasRef, getCameraOffset),
      () => drawItems(canvasContext)
    );
  }, [zooming, panning]);

  return (
    <>
      <canvas ref={canvasRef} width={"500"} height={"500"} />
    </>
  );
};

const animateCanvas = (animate, ...args) => {
  const renew = animate;

  for (const arg of args) {
    arg();
  }

  if (!renew) return;

  requestAnimationFrame(() => animateCanvas(animate, ...args));
};

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

function drawItems(ctx) {
  ctx.fillStyle = "#991111";
  ctx.fillRect(-50, -50, 100, 100);
}

function initImage(ctx) {
  const img = new Image();

  img.onload = function () {
    ctx.fillRect(130, 190, 40, 60);
    ctx.drawImage(img, 100, 100);
  };

  img.src = "logo192.png";

  return img;
}
