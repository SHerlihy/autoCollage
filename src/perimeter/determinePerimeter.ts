import { determineNextPoint } from "./nextPerimeterPoint";
import { IPointsMap } from "./pointsTypes";

export const determinePerimeterPoints = (allPoints: IPointsMap, offset: number) => {
  const topPointId = determineTopPointId(allPoints);
  const nextImagePointId = allPoints.get(topPointId)!.nextImgPointId;

  const perimeterPointIds = determineRemainingPerimeterPointIds(
    topPointId,
    nextImagePointId,
    offset,
    allPoints
  );

  return perimeterPointIds
};

const determineRemainingPerimeterPointIds = (
  startingPointId: string,
  startingNextImagePointId: string,
  offset: number,
  allPoints: IPointsMap
) => {
  const perimeterPointIds: string[] = [];
  const allOtherPoints = new Map([...allPoints]);

  const setPerimeterPoints = (currentPointId: string, potentialNextPointId: string) => {
    const currentPointValues = allPoints.get(currentPointId)!;
    const potentialNextPointValues = allPoints.get(potentialNextPointId)!;

    allOtherPoints.delete(currentPointId);

    const nextPointId = determineNextPoint(
      currentPointValues.coordinates,
      potentialNextPointValues.coordinates,
      offset,
      allOtherPoints
    );

    // //might have to be careful here but above should run first (should!)
    // allOtherPoints.delete(potentialNextPointId);

    if (nextPointId === startingPointId ) {
      return;
    }

    perimeterPointIds.push(nextPointId);

    const nextImagePointId = allPoints.get(nextPointId)!.nextImgPointId;

    setPerimeterPoints(nextPointId, nextImagePointId);
  };

  perimeterPointIds.push(startingPointId);

  setPerimeterPoints(startingPointId, startingNextImagePointId);

  return perimeterPointIds;
};

const determineTopPointId = (points: IPointsMap) => {
  const topPoint = [...points.entries()].reduce(
    (topId, [curId, curVal]) => {
      const topVal = points.get(topId) || null;

      if (topVal === null || curVal.coordinates.y < topVal.coordinates.y) {
        topId = curId;
      }

      return topId;
    }, '');

  return topPoint;
};
