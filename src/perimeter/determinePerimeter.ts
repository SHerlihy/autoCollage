import { determineNextPoint } from "./nextPerimeterPoint";
import { IPoint, IPointsMap } from "./pointsTypes";

export const determinePerimeterPoints = (
  allPoints: IPointsMap,
  offset: number
) => {
  const topPointId = determineTopPointId(allPoints);
  const nextImagePointId = allPoints.get(topPointId)!.nextImgPointId;

  const perimeterPointIds = determineRemainingPerimeterPointIds(
    topPointId,
    nextImagePointId,
    offset,
    allPoints
  );

  return perimeterPointIds;
};

const determineRemainingPerimeterPointIds = (
  startingPointId: string,
  startingNextImagePointId: string,
  offset: number,
  allPoints: IPointsMap
): IPointsMap => {
  const allOtherPoints = new Map([...allPoints]);
  const perimeterPoints = new Map<string, IPoint>();

  const setPerimeterPoints = (
    currentPointId: string,
    potentialNextPointId: string
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

    setPerimeterPoints(nextPointId, nextImagePointId);
  };

  const { coordinates: currentImageCoordinate } =
    allOtherPoints.get(startingPointId)!;

  const firstPassPoints = new Map(allOtherPoints);

  firstPassPoints.delete(startingPointId);

  const nextPointId = determineNextPoint(
    currentImageCoordinate,
    startingNextImagePointId,
    firstPassPoints
  );

  const nextImagePointId = allPoints.get(nextPointId)!.nextImgPointId;

  const newCurrentPoint = { ...allPoints.get(startingPointId)! };
  newCurrentPoint.nextImgPointId = nextPointId;

  perimeterPoints.set(startingPointId, newCurrentPoint);

  if (nextPointId === startingPointId) {
    return perimeterPoints;
  }

  setPerimeterPoints(nextPointId, nextImagePointId);

  return perimeterPoints;
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
