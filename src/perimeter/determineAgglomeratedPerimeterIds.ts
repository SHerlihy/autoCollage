import { determineLeftSideCoordinates } from "./determineLeftSideCoordinates";
import { getMapFromMap } from "./mapHelpers";
import {
  coordinatesArrToLinkedPointsMap,
  determineCardinalPoints,
} from "./pointsHelper";
import { IPointsMap } from "./pointsTypes";

export const determineAgglomeratedPerimeterPoints = (
  perimeterPoints: IPointsMap
) => {
  const perimeterPointIds = determineAgglomeratedPerimeterIds(perimeterPoints);

  const { addToSubMap, getSubMap } = getMapFromMap(perimeterPoints);

  addToSubMap(perimeterPointIds);

  const perimeterPointsPre = getSubMap();

  const orderedPerimeterCoordinates = [...perimeterPointsPre.values()].map(
    ({ coordinates }) => coordinates
  );

  const perimeterPointsMap = coordinatesArrToLinkedPointsMap(
    orderedPerimeterCoordinates
  );

  return perimeterPointsMap;
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
