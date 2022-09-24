import { hasMatchingGradient, lineDirection } from "../addImages/shapeHelpers";
import { ICoordinates, IPointsMap } from "./pointsTypes";
import { getHypotenuseSideFromSides } from "./trigonometryHelpers";

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
        updatedPotentialPointIds.add(currentPotentialPointId);
      } else {
        updatedPotentialPointIds.add(currentPotentialPointId);
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
