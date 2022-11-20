import { calculateAreaBeyondEdge } from "./calculateAreaBeyondEdge";
import { identifyClosestCoordinateToCoordinate } from "./identifyClosest";
import {
  identifyPointIdsWithinBounds,
  identifyPointsInRectangle,
} from "./identifyPointsWithin";
import { getMapFromMap } from "./mapHelpers";
import { ICoordinates, IPoint, IPointsMap } from "./pointsTypes";

export const determineNextPoint = (
  currentPoint: IPoint,
  potentialNextPoint: IPoint,
  allPoints: IPointsMap,
  visitedPoints: string[],
  areaBeyondEdgeThreshold = 5
): string => {
  const {
    currentImgPointId: currentPointId,
    coordinates: currentImageCoordinate,
  } = currentPoint;
  const { coordinates: nextImageCoordinate } = potentialNextPoint;

  const modBeyondEdge =
    currentPoint.thresholdMod && potentialNextPoint.thresholdMod
      ? areaBeyondEdgeThreshold + currentPoint.thresholdMod
      : areaBeyondEdgeThreshold;

  const thresholdArea = calculateAreaBeyondEdge(
    currentImageCoordinate,
    nextImageCoordinate,
    modBeyondEdge
  );

  const { BL, BR, TR, TL } = thresholdArea;

  const allOtherPoints = new Map(allPoints);

  allOtherPoints?.delete(currentPointId);
  allOtherPoints?.delete(potentialNextPoint.currentImgPointId);

  // allPoints.delete(potentialNextPoint.currentImgPointId);

  // using this simpler algorithm reduce number of coordinates
  // going into next more complex algorithm
  const pointIdsInRectangle = identifyPointsInRectangle(
    [...Object.values(thresholdArea)],
    allOtherPoints
  )!;

  // if (pointIdsInRectangle === null) {
  //   pointIdsInRectangle = new Set([potentialNextPoint.currentImgPointId]);
  // }

  const areaBoundedPointIds =
    pointIdsInRectangle === null
      ? null
      : identifyPointIdsWithinBounds(
          [BL, BR, TR, TL],
          pointIdsInRectangle,
          allOtherPoints
        )!;

  const firstPoint =
    areaBoundedPointIds === null
      ? potentialNextPoint
      : allPoints.get([...areaBoundedPointIds.keys()][0])!;

  // pointIdsInRectangle.size === 1 &&
  // visitedPoints.includes(firstPoint.currentImgPointId) &&
  // firstPoint.imgId === currentPoint.imgId

  const idsVisited = areaBoundedPointIds
    ? [...areaBoundedPointIds].every((idIn) => {
        return visitedPoints.includes(idIn);
      })
    : true;

  if (
    visitedPoints.includes(potentialNextPoint.currentImgPointId) &&
    idsVisited
  ) {
    const thresholdArea = calculateAreaBeyondEdge(
      firstPoint.coordinates,
      currentImageCoordinate,
      areaBeyondEdgeThreshold
    );

    const { BL, BR, TR, TL } = thresholdArea;

    const pointIdsInRectangle = identifyPointsInRectangle(
      [...Object.values(thresholdArea)],
      allPoints
    )!;

    const areaBannedPointIds =
      pointIdsInRectangle === null
        ? new Set()
        : identifyPointIdsWithinBounds(
            [BL, BR, TR, TL],
            pointIdsInRectangle,
            allPoints
          )!;

    // find last point on prev image and run with banned list

    const prevImgPointId = visitedPoints.reverse().find((visitedId) => {
      const visitedPoint = allPoints.get(visitedId);

      if (!visitedPoint) {
        return false;
      }

      return visitedPoint.imgId !== currentPoint.imgId;
    })!;

    const prevImgPoint = allPoints.get(prevImgPointId)!;

    const nextImgPoint = allPoints.get(prevImgPoint.nextImgPointId)!;

    const { addToSubMap, getSubMap } = getMapFromMap(allPoints);

    const allPointIds = [...allPoints.keys()];

    const allowedPointIds = allPointIds.filter((pointId) => {
      return ![...areaBannedPointIds].includes(pointId);
    });

    addToSubMap(allowedPointIds);

    const allAllowedPoints = getSubMap();

    return determineNextPoint(
      prevImgPoint,
      nextImgPoint,
      allAllowedPoints,
      visitedPoints
    );
  }

  visitedPoints.push(potentialNextPoint.currentImgPointId);

  if (areaBoundedPointIds === null) {
    return potentialNextPoint.currentImgPointId;
  }

  const { addToSubMap, getSubMap } = getMapFromMap(allPoints);

  addToSubMap([...areaBoundedPointIds]);

  const nextPointId = identifyClosestCoordinateToCoordinate(
    currentImageCoordinate,
    getSubMap()
  );

  return nextPointId;
};
