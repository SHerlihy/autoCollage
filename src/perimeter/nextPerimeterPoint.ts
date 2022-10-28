import { calculateAreaBeyondEdge } from "./calculateAreaBeyondEdge";
import { identifyClosestCoordinateToCoordinate } from "./identifyClosest";
import {
  identifyPointIdsWithinBounds,
  identifyPointsInRectangle,
} from "./identifyPointsWithin";
import { getMapFromMap } from "./mapHelpers";
import { ICoordinates, IPoint, IPointsMap } from "./pointsTypes";

export const determineNextPoint = (
  currentImageCoordinate: ICoordinates,
  potentialNextPoint: IPoint,
  allPoints: IPointsMap,
  areaBeyondEdgeThreshold = 5
) => {
  const { coordinates: nextImageCoordinate } = potentialNextPoint;

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
    allPoints
  )!;

  const areaBoundedPointIds = identifyPointIdsWithinBounds(
    [BL, BR, TR, TL],
    pointIdsInRectangle,
    allPoints
  )!;

  const { addToSubMap, getSubMap } = getMapFromMap(allPoints);

  addToSubMap([...areaBoundedPointIds]);

  const nextPointId = identifyClosestCoordinateToCoordinate(
    currentImageCoordinate,
    getSubMap()
  );

  return nextPointId;
};
