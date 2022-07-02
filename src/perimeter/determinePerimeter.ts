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
    const currentPointValues = allPoints.get(currentPointId)!;
    const potentialNextPointValues = allPoints.get(potentialNextPointId)!;

    allOtherPoints.delete(currentPointId);

    const otherCoordinatesArr = [...allOtherPoints.values()].map(
      ({ coordinates }) => coordinates
    );

    const nextPointCoordinates = determineNextPoint(
      currentPointValues.coordinates,
      potentialNextPointValues.coordinates,
      offset,
      otherCoordinatesArr
    );

    const nextPointId = [...allOtherPoints.entries()].reduce(
      (acc, [key, { coordinates }]) => {
        if (
          coordinates.x === nextPointCoordinates.x &&
          coordinates.y === nextPointCoordinates.y
        ) {
          acc = key;
        }

        return acc;
      },
      startingPointId
    );

    // //might have to be careful here but above should run first (should!)
    // allOtherPoints.delete(potentialNextPointId);

    const nextImagePointId = allPoints.get(nextPointId)!.nextImgPointId;

    const newCurrentPoint = { ...allPoints.get(currentPointId)! };
    newCurrentPoint.nextImgPointId = nextPointId;

    perimeterPoints.set(currentPointId, newCurrentPoint);
    // perimeterPoints.set(nextPointId, allPoints.get(nextPointId)!);

    if (nextPointId === startingPointId) {
      return;
    }

    setPerimeterPoints(nextPointId, nextImagePointId);
  };

  setPerimeterPoints(startingPointId, startingNextImagePointId);

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
