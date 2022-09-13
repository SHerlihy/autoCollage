import { calculateAreaBeyondEdge } from "./calculateAreaBeyondEdge";
import { identifyClosestCoordinateToCoordinate } from "./identifyClosest";
import {
  identifyPointIdsWithinBounds,
  identifyPointsInRectangle,
} from "./identifyPointsWithin";
import { ICoordinates, IPointsMap } from "./pointsTypes";

export const determineNextPoint = (
  currentImageCoordinate: ICoordinates,
  nextImagePointId: string,
  allOtherPoints: IPointsMap,
  areaBeyondEdgeThreshold = 5
) => {
  const { coordinates: nextImageCoordinate } =
    allOtherPoints.get(nextImagePointId)!;

  const thresholdArea = calculateAreaBeyondEdge(
    currentImageCoordinate,
    nextImageCoordinate,
    areaBeyondEdgeThreshold
  );

  const { BL, BR, TR, TL } = thresholdArea;

  // using this simpler algorithm reduce number of coordinates
  // going into next more complex algorithm
  const pointIdsInRectangle = identifyPointsInRectangle(
    [...Object.values(thresholdArea)],
    allOtherPoints
  );

  if (pointIdsInRectangle === null) {
    return nextImagePointId;
  }

  const areaBoundedPointIds = identifyPointIdsWithinBounds(
    [BL, BR, TR, TL],
    pointIdsInRectangle,
    allOtherPoints
  );

  if (areaBoundedPointIds === null) {
    return nextImagePointId;
  }

  const nextPointId = identifyClosestCoordinateToCoordinate(
    currentImageCoordinate,
    nextImagePointId,
    areaBoundedPointIds,
    allOtherPoints
  );

  return nextPointId;
};
