import React, { useLayoutEffect } from "react";

export const Canvas = ({ canvasRef }) => {
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

  return (
    <>
      <canvas ref={canvasRef} width={"500"} height={"500"} />
    </>
  );
};
