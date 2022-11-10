import { useEffect } from "react";
import { IPoint } from "../perimeter/pointsTypes";

export const useHighlightPerimeter = (
  canvasRef: React.MutableRefObject<HTMLCanvasElement | undefined>,
  perimeterIds: string[] | undefined,
  getCurrentPerimeterPoints: (
    perimeterIds: string[] | undefined
  ) => Map<string, IPoint>
) => {
  useEffect(() => {
    const currentPointsArr = [
      ...getCurrentPerimeterPoints(perimeterIds).values(),
    ];

    const context = canvasRef.current?.getContext("2d");

    const firstPoint = currentPointsArr.shift();

    if (!firstPoint || !context) {
      return;
    }

    context.beginPath();
    context.moveTo(firstPoint.coordinates.x, firstPoint.coordinates.y);

    for (const { coordinates } of currentPointsArr) {
      context.lineTo(coordinates.x, coordinates.y);
    }

    context.closePath();
    context.stroke();
  }, [perimeterIds]);
};
