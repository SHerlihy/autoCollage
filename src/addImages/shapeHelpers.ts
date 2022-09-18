import { ICoordinates } from "../perimeter/pointsTypes";

export const lineDirection = (
  lineStartCoordinates: ICoordinates,
  lineEndCoordinates: ICoordinates
) => {
  const horizontal = lineStartCoordinates.y === lineEndCoordinates.y;
  const vertical = lineStartCoordinates.x === lineEndCoordinates.x;

  const goingDown =
    lineStartCoordinates.y < lineEndCoordinates.y ? "down" : "up";
  const goingRight =
    lineStartCoordinates.x < lineEndCoordinates.x ? "right" : "left";

  return {
    yDirection: horizontal ? "horizontal" : goingDown,
    xDirection: vertical ? "vertical" : goingRight,
  };
};
