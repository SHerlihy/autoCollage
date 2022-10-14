import { getMapFromMap } from "./mapHelpers";
import { determineNextPoint } from "./nextPerimeterPoint";
import { determineTopPointId } from "./pointsHelper";
import { IPoint, IPointsMap } from "./pointsTypes";

export const determinePerimeterPoints = (perimeterPoints: IPointsMap) => {
  const topPointId = determineTopPointId(perimeterPoints);
  const nextImagePointId = perimeterPoints.get(topPointId)!.nextImgPointId;

  const perimeterPointIds = determineRemainingPerimeterPointIds(
    topPointId,
    nextImagePointId,
    perimeterPoints
  );

  return perimeterPointIds;
};

const determineRemainingPerimeterPointIds = (
  startingPointId: string,
  startingNextImagePointId: string,
  allPoints: IPointsMap
): IPointsMap => {
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
    allPoints,
    perimeterPoints
  );

  return perimeterPoints;
};

const setRemainingPerimeterPoints = (
  startingPointId: string,
  currentPointId: string,
  potentialNextPointId: string,
  allPoints: IPointsMap,
  perimeterPoints: Map<string, IPoint>,
  prevPointId?: string
) => {
  const potentialNextPoint = allPoints.get(potentialNextPointId)!;

  const currentPoint = allPoints.get(currentPointId)!;

  const { coordinates: currentImageCoordinate } = currentPoint;

  const allOtherPointIds = [...allPoints.keys()].filter(
    (allId) => allId !== currentPointId && allId !== prevPointId
  );

  const { addToSubMap, getSubMap } = getMapFromMap(allPoints);

  addToSubMap(allOtherPointIds);

  let allOtherPoints = getSubMap();

  let nextPointId = determineNextPoint(
    currentImageCoordinate,
    potentialNextPoint,
    allOtherPoints
  );

  const newCurrentPoint = { ...allPoints.get(currentPointId)! };
  newCurrentPoint.nextImgPointId = nextPointId;

  perimeterPoints.set(currentPointId, newCurrentPoint);

  if (nextPointId === startingPointId) {
    return;
  }

  const nextPointPotentialNextId = allPoints.get(nextPointId)!.nextImgPointId;

  setRemainingPerimeterPoints(
    startingPointId,
    nextPointId,
    nextPointPotentialNextId,
    allPoints,
    perimeterPoints,
    currentPointId
  );
};

const setFirstPerimeterPoints = (
  startingPointId: string,
  startingNextImagePointId: string,
  allPoints: IPointsMap
) => {
  const potentialNextPoint = allPoints.get(startingNextImagePointId)!;

  const { coordinates: currentImageCoordinate } =
    allPoints.get(startingPointId)!;

  const firstPassPoints = new Map(allPoints);

  firstPassPoints.delete(startingPointId);

  const nextPointId = determineNextPoint(
    currentImageCoordinate,
    potentialNextPoint,
    firstPassPoints
  );

  const newCurrentPoint = { ...allPoints.get(startingPointId)! };
  newCurrentPoint.nextImgPointId = nextPointId;

  return newCurrentPoint;
};
