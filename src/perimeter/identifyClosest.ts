import { ICoordinates, IPointsMap } from "./pointsTypes";
import { getHypotenuseSideFromSides } from "./trigonometryHelpers";

// regardless of direction
export const identifyClosestCoordinateToCoordinate = (
  principleCoordinate: ICoordinates,
  potentialPoints: IPointsMap
) => {
  const { x: principleX, y: principleY } = principleCoordinate;

  const [initialPoint] = potentialPoints.values();

  const { coordinates: initialCoordinates } = initialPoint;

  let closestPointId = initialPoint.currentImgPointId;

  let closestPointDistance = getHypotenuseSideFromSides(
    Math.abs(principleX - initialCoordinates.x),
    Math.abs(principleY - initialCoordinates.y)
  );

  for (const [potentialPointId, potentialPointValue] of potentialPoints) {
    const { coordinates } = potentialPointValue;

    const distanceToOrigin = getHypotenuseSideFromSides(
      Math.abs(principleX - coordinates.x),
      Math.abs(principleY - coordinates.y)
    );

    if (!closestPointDistance) {
      closestPointId = potentialPointId;
      closestPointDistance = distanceToOrigin;
    }

    if (distanceToOrigin < closestPointDistance) {
      closestPointId = potentialPointId;
      closestPointDistance = distanceToOrigin;
    }
  }

  return closestPointId;
};
