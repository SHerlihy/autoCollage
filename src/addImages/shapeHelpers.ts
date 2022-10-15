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

export const hasMatchingGradient = (
  lineStart: ICoordinates,
  lineEnd: ICoordinates,
  subjectCoordinate: ICoordinates,
  deltaThreshold = 1
) => {
  const lineGrad = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
  const toPointGrad =
    (subjectCoordinate.y - lineStart.y) / (subjectCoordinate.x - lineStart.x);

  const yComparison =
    Math.trunc(lineGrad * 1000) - Math.trunc(toPointGrad * 1000);

  if (Math.abs(yComparison) <= deltaThreshold) {
    return true;
  } else {
    return false;
  }
};
