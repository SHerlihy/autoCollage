import { useEffect, useState } from "react";

const offsetClosure = (function () {
  let cameraOffset = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };

  function getCameraOffset() {
    const freshCameraOffset = cameraOffset;
    return freshCameraOffset;
  }

  function setCameraOffset(changeTo) {
    cameraOffset = changeTo;
  }

  return {
    getCameraOffset,
    setCameraOffset,
  };
})();

const usePan = (canvasRef, getZoom) => {
  let newPanStart;
  let moveHandler;
  const [panning, setPanning] = useState(false);
  const { getCameraOffset, setCameraOffset } = offsetClosure;

  const handleMouseMove = (ev, start) => {
    setOffsets(ev, getZoom, start, setCameraOffset);
  };

  useEffect(() => {
    canvasRef.current.addEventListener("mousedown", (event) => {
      event.preventDefault();
      setPanning(true);
      newPanStart = {
        x: event.clientX / getZoom() - getCameraOffset().x,
        y: event.clientY / getZoom() - getCameraOffset().y,
      };
      moveHandler = (ev) => handleMouseMove(ev, newPanStart);
      canvasRef.current.addEventListener("mousemove", moveHandler);
    });
  }, []);

  useEffect(() => {
    canvasRef.current.addEventListener("mouseup", (event) => {
      event.preventDefault();
      setPanning(false);
      canvasRef.current.removeEventListener("mousemove", moveHandler);
    });
  }, []);

  return { panning, getCameraOffset };
};

const setOffsets = (ev, getZoom, dragStart, setCameraOffset) => {
  ev.preventDefault();
  const updatedOffsets = {
    x: ev.clientX / getZoom() - dragStart.x,
    y: ev.clientY / getZoom() - dragStart.y,
  };

  setCameraOffset(updatedOffsets);
};

export default usePan;
