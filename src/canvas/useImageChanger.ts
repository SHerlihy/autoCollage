import { useEffect } from "react";

export const useImageChanger = (
  canvasRef: React.MutableRefObject<HTMLCanvasElement | undefined>,
  currentImages: Array<string>,
  loadNewImages: (images: Array<string>) => Promise<void>,
  handleDrawAllItems: (context: CanvasRenderingContext2D) => void
) => {
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
};
