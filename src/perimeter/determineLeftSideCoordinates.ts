import { isCoordinateLeftOfEdge } from "../addImages/generateEdgesMap";
import { ICoordinates, IPointsMap } from "./pointsTypes";

export const determineLeftSideCoordinates = (
  currentPotentialPointIds: Set<string>,
  allPoints: IPointsMap,
  lineStart: ICoordinates,
  lineEnd: ICoordinates
) => {
  let leftOfEdgeCoordinates = new Set<string>();

  for (const pointId of currentPotentialPointIds) {
    const { coordinates } = allPoints.get(pointId)!;
    const coordinateLeftOfEdge = isCoordinateLeftOfEdge(
      lineStart,
      lineEnd,
      coordinates,
      0
    );

    if (coordinateLeftOfEdge) {
      leftOfEdgeCoordinates.add(pointId);
    }
  }

  if (leftOfEdgeCoordinates.size === 0) {
    return null;
  }

  return leftOfEdgeCoordinates;
};
