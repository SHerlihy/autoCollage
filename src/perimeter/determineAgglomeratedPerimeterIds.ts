import { determineLeftSideCoordinates } from "./determineLeftSideCoordinates";
import { getMapFromMap } from "./mapHelpers";
import { determineCardinalPoints } from "./pointsHelper";
import { IPoint, IPointsMap } from "./pointsTypes";

type pointsMapEntry = [string, IPoint];

export const determineAgglomeratedPerimeterPoints = (
  perimeterPoints: IPointsMap
) => {
  const perimeterPointIds = determineAgglomeratedPerimeterIds(perimeterPoints);

  const { addToSubMap, getSubMap } = getMapFromMap(perimeterPoints);

  addToSubMap(perimeterPointIds);

  const orderedPerimeterPointsPre = getSubMap();

  const agglomeratedPerimeterPointsPre = [
    ...orderedPerimeterPointsPre.entries(),
  ];

  const [lastPointId, lastPoint] =
    agglomeratedPerimeterPointsPre[agglomeratedPerimeterPointsPre.length - 1];

  const lastPointEntry: pointsMapEntry = [
    lastPointId,
    { ...lastPoint, nextImgPointId: agglomeratedPerimeterPointsPre[0][0] },
  ];

  const updatedPoints = agglomeratedPerimeterPointsPre.map(
    ([curId, curPoint], idx) => {
      if (idx === agglomeratedPerimeterPointsPre.length - 1) {
        return lastPointEntry;
      }
      const nextPointId = agglomeratedPerimeterPointsPre[idx + 1][0];
      const updatedPoint = { ...curPoint, nextImgPointId: nextPointId };

      return [curId, updatedPoint] as pointsMapEntry;
    }
  );

  return new Map(updatedPoints);
};

export const determineAgglomeratedPerimeterIds = (
  perimeterPoints: IPointsMap
) => {
  const cardinalPointsArr = determineCardinalPoints(perimeterPoints);

  const perimeter = cardinalPointsArr.map((curPointId, idx) => {
    const nextPointIdx = idx === cardinalPointsArr.length - 1 ? 0 : idx + 1;
    const nextPointId = cardinalPointsArr[nextPointIdx];

    const potentialIdsSet = new Set([...perimeterPoints.keys()]);

    const { coordinates: curCoordinates } = perimeterPoints.get(curPointId)!;
    const { coordinates: nextCoordinates } = perimeterPoints.get(nextPointId)!;

    const pointsLeft = determineLeftSideCoordinates(
      potentialIdsSet,
      perimeterPoints,
      curCoordinates,
      nextCoordinates
    );

    if (pointsLeft === null) {
      return [nextPointId];
    }

    return determineOuterPoints(
      curPointId,
      nextPointId,
      pointsLeft,
      perimeterPoints
    );
  });

  return perimeter.flat();
};

const determineOuterPoints = (
  initialId: string,
  endId: string,
  potentialPointIds: Set<string>,
  allPointIds: IPointsMap
): string[] => {
  let leftMost = initialId;

  const perimeterQuart = [] as Array<string>;

  const leftPointsPool = new Set([...potentialPointIds, endId]);

  while (leftMost !== endId) {
    const leftMostPoint = [...leftPointsPool].find((id) => {
      const potentialIdsSetQuart = new Set([...potentialPointIds, endId]);

      const { coordinates: curCoordinatesQuart } = allPointIds.get(leftMost)!;
      const { coordinates: nextCoordinatesQuart } = allPointIds.get(id)!;

      const pointsLeftQuart = determineLeftSideCoordinates(
        potentialIdsSetQuart,
        allPointIds,
        curCoordinatesQuart,
        nextCoordinatesQuart
      );

      return pointsLeftQuart === null;
    });

    if (leftMostPoint === undefined) {
      perimeterQuart.push(endId);

      leftMost = endId;

      return perimeterQuart;
    }

    leftPointsPool.delete(leftMostPoint);

    perimeterQuart.push(leftMostPoint);

    leftMost = leftMostPoint;
  }

  return perimeterQuart;
};
