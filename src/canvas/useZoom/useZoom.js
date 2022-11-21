import { useEffect, useState } from "react";

const zoomClosure = (function () {
  let zoom = 1;

  function getZoom() {
    const freshZoom = zoom;
    return freshZoom;
  }

  function setZoom(delta) {
    zoom = zoom + delta;
  }

  return {
    getZoom,
    setZoom,
  };
})();

const useZoom = (canvasRef) => {
  let prev;
  const [zooming, setZooming] = useState(false);
  const { getZoom, setZoom } = zoomClosure;

  useEffect(() => {
    canvasRef.current.addEventListener("wheel", (event) => {
      setZoom(event.wheelDelta / 3600);

      if (zooming) return;

      setZooming(true);

      const handleZooming = setInterval(() => {
        if (prev === getZoom()) {
          clearInterval(handleZooming);
          setZooming(false);
          return;
        }

        prev = getZoom();
      }, 500);
    });
  }, []);

  return { zooming, getZoom };
};

export default useZoom;
