import { ICoordinates, IPointsMap } from "./pointsTypes";
import { getHypotenuseSideFromSides } from "./trigonometryHelpers";

// regardless of direction
export const identifyClosestCoordinateToCoordinate = (
  principleCoordinate: ICoordinates,
  nextImgPointId: string,
  potentialPointIds: Set<string>,
  allOtherPoints: IPointsMap
) => {
  let closestPointId = nextImgPointId;

  const { x: principleX, y: principleY } = principleCoordinate;
  const { coordinates } = allOtherPoints.get(nextImgPointId)!;

  let closestPointDistance = getHypotenuseSideFromSides(
    Math.abs(principleX - coordinates.x),
    Math.abs(principleY - coordinates.y)
  );

  for (const pointId of potentialPointIds) {
    const { coordinates } = allOtherPoints.get(pointId)!;

    const distanceToOrigin = getHypotenuseSideFromSides(
      Math.abs(principleX - coordinates.x),
      Math.abs(principleY - coordinates.y)
    );

    if (distanceToOrigin < closestPointDistance) {
      closestPointId = pointId;
      closestPointDistance = distanceToOrigin;
    }
  }

  return closestPointId;
};
