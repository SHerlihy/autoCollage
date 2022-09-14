import { determineNextPoint } from "./nextPerimeterPoint";
import { IPoint, IPointsMap } from "./pointsTypes";

export const determinePerimeterPoints = (allPoints: IPointsMap) => {
  const topPointId = determineTopPointId(allPoints);
  const nextImagePointId = allPoints.get(topPointId)!.nextImgPointId;

  const perimeterPointIds = determineRemainingPerimeterPointIds(
    topPointId,
    nextImagePointId,
    allPoints
  );

  return perimeterPointIds;
};

const determineRemainingPerimeterPointIds = (
  startingPointId: string,
  startingNextImagePointId: string,
  allPoints: IPointsMap
): IPointsMap => {
  const allOtherPoints = new Map([...allPoints]);
  const perimeterPoints = new Map<string, IPoint>();

  const newCurrentPoint = setFirstPerimeterPoints(
    startingPointId,
    startingNextImagePointId,
    allPoints
  );

  const { nextImgPointId: newNextImgPointId } = newCurrentPoint;

  perimeterPoints.set(startingPointId, newCurrentPoint);

  if (newNextImgPointId === startingPointId) {
    return perimeterPoints;
  }

  const nextNextId = allPoints.get(newNextImgPointId)!.nextImgPointId;

  setRemainingPerimeterPoints(
    startingPointId,
    newNextImgPointId,
    nextNextId,
    allOtherPoints,
    allPoints,
    perimeterPoints
  );

  return perimeterPoints;
};

const setRemainingPerimeterPoints = (
  startingPointId: string,
  currentPointId: string,
  potentialNextPointId: string,
  allOtherPoints: Map<string, IPoint>,
  allPoints: IPointsMap,
  perimeterPoints: Map<string, IPoint>
) => {
  const { coordinates: currentImageCoordinate } =
    allOtherPoints.get(currentPointId)!;

  allOtherPoints.delete(currentPointId);

  const nextPointId = determineNextPoint(
    currentImageCoordinate,
    potentialNextPointId,
    allOtherPoints
  );

  const nextImagePointId = allPoints.get(nextPointId)!.nextImgPointId;

  const newCurrentPoint = { ...allPoints.get(currentPointId)! };
  newCurrentPoint.nextImgPointId = nextPointId;

  perimeterPoints.set(currentPointId, newCurrentPoint);

  if (nextPointId === startingPointId) {
    allOtherPoints.delete(startingPointId);
    return;
  }

  setRemainingPerimeterPoints(
    startingPointId,
    nextPointId,
    nextImagePointId,
    allOtherPoints,
    allPoints,
    perimeterPoints
  );
};

const setFirstPerimeterPoints = (
  startingPointId: string,
  startingNextImagePointId: string,
  allPoints: IPointsMap
) => {
  const { coordinates: currentImageCoordinate } =
    allPoints.get(startingPointId)!;

  const firstPassPoints = new Map(allPoints);

  firstPassPoints.delete(startingPointId);

  const nextPointId = determineNextPoint(
    currentImageCoordinate,
    startingNextImagePointId,
    firstPassPoints
  );

  const newCurrentPoint = { ...allPoints.get(startingPointId)! };
  newCurrentPoint.nextImgPointId = nextPointId;

  return newCurrentPoint;
};

const determineTopPointId = (points: IPointsMap) => {
  const topPoint = [...points.entries()].reduce((topId, [curId, curVal]) => {
    const topVal = points.get(topId) || null;

    if (topVal === null || curVal.coordinates.y < topVal.coordinates.y) {
      topId = curId;
    }

    return topId;
  }, "");

  return topPoint;
};
