import { useEffect } from "react";
import { getMapFromMap } from "../perimeter/mapHelpers";
import { IPoint } from "../perimeter/pointsTypes";

export const useHighlightPerimeter = (
  canvasRef: React.MutableRefObject<HTMLCanvasElement | undefined>,
  getAllPoints: () => Map<string, IPoint>,
  perimeterIds: string[] | undefined
) => {
  useEffect(() => {
    if (perimeterIds) {
      const allPoints = getAllPoints();

      const { addToSubMap, getSubMap } = getMapFromMap(allPoints);

      addToSubMap(perimeterIds);

      const currentPerimeterPoints = getSubMap();

      const currentPointsArr = [...currentPerimeterPoints.values()];

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
    }
  }, [perimeterIds]);
};
