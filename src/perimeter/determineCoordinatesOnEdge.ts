import { lineDirection } from "../addImages/shapeHelpers";
import { ICoordinates, IPointsMap } from "./pointsTypes";
import { getHypotenuseSideFromSides } from "./triganomitryHelpers";

const distanceBetweenCoordinates = (
  { x: startX, y: startY }: ICoordinates,
  { x: endX, y: endY }: ICoordinates
) => {
  const diffX = Math.abs(endX - startX);
  const diffY = Math.abs(endY - startY);

  return getHypotenuseSideFromSides(diffX, diffY);
};

export const determineCoordinatesOnEdge = (
  currentPotentialPointIds: Set<string>,
  allPoints: IPointsMap,
  lineStart: ICoordinates,
  lineEnd: ICoordinates
) => {
  const updatedPotentialPointIds = new Set<string>();

  const edgeDistance = distanceBetweenCoordinates(lineStart, lineEnd);

  const planeEdge =
    lineStart.x === lineEnd.x ? "y" : lineStart.y === lineEnd.y ? "x" : null;

  for (const currentPotentialPointId of currentPotentialPointIds) {
    const { coordinates: currentCoordinates } = allPoints.get(
      currentPotentialPointId
    )!;

    const { yDirection, xDirection } = lineDirection(lineStart, lineEnd);
    const { yDirection: yToPointDirection, xDirection: xToPointDirection } =
      lineDirection(lineStart, currentCoordinates);

    if (yDirection !== yToPointDirection) continue;
    if (xDirection !== xToPointDirection) continue;

    if (planeEdge) {
      const distanceToCurrent = distanceBetweenCoordinates(
        lineStart,
        currentCoordinates
      );

      if (distanceToCurrent > edgeDistance) continue;

      if (planeEdge === "x") {
        const coordinateOnEdge = identifyPotentialCoordinateFromXPlaneEdge(
          currentCoordinates.x,
          lineStart.y,
          lineStart.x,
          lineEnd.x
        );

        if (coordinateOnEdge) {
          updatedPotentialPointIds.add(currentPotentialPointId);
        }
      } else {
        const coordinateOnEdge = identifyPotentialCoordinateFromYPlaneEdge(
          currentCoordinates.y,
          lineStart.x,
          lineStart.y,
          lineEnd.y
        );

        if (coordinateOnEdge) {
          updatedPotentialPointIds.add(currentPotentialPointId);
        }
      }
    } else {
      const matchingGradient = hasMatchingGradient(
        lineStart,
        lineEnd,
        currentCoordinates
      );

      if (matchingGradient)
        updatedPotentialPointIds.add(currentPotentialPointId);
    }
  }

  if (updatedPotentialPointIds.size === 0) {
    return null;
  }

  return updatedPotentialPointIds;
};

const identifyPotentialCoordinateFromXPlaneEdge = (
  potentialNonPlaneValue: number,
  planeValue: number,
  startEdgeValue: number,
  endEdgeValue: number
) => {
  if (startEdgeValue < endEdgeValue) {
    return potentialNonPlaneValue >= planeValue;
  } else {
    return potentialNonPlaneValue <= planeValue;
  }
};

const identifyPotentialCoordinateFromYPlaneEdge = (
  potentialNonPlaneValue: number,
  planeValue: number,
  startEdgeValue: number,
  endEdgeValue: number
) => {
  if (startEdgeValue < endEdgeValue) {
    return potentialNonPlaneValue <= planeValue;
  } else {
    return potentialNonPlaneValue >= planeValue;
  }
};

const hasMatchingGradient = (
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
