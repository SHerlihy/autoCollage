import { determineCoordinatesOnEdge } from "./determineCoordinatesOnEdge";
import { determineLeftSideCoordinates } from "./determineLeftSideCoordinates";
import { ICoordinates, IPoint, IPointsMap } from "./pointsTypes";

const determineRectangleCoordinatesToCoverCoordinates = (
  givenCoordinates: ICoordinates[]
) => {
  const xSeed = givenCoordinates[0].x;
  const ySeed = givenCoordinates[0].y;

  const accumulatorSeed = {
    left: xSeed,
    top: ySeed,
    right: xSeed,
    low: ySeed,
  };

  const maxRect = givenCoordinates.reduce(
    (acc, { x: currentX, y: currentY }) => {
      const { left, top, right, low } = acc;

      if (currentX < left) {
        acc.left = currentX;
      }

      if (currentX > right) {
        acc.right = currentX;
      }

      if (currentY < top) {
        acc.top = currentY;
      }

      if (currentY > low) {
        acc.low = currentY;
      }

      return acc;
    },
    accumulatorSeed
  );

  const { left, top, right, low } = maxRect;

  return {
    cornerA: { x: left, y: top },
    cornerB: { x: right, y: low },
  };
};

export const identifyPointsInRectangle = (
  givenCoordinates: ICoordinates[],
  allPoints: Map<string, IPoint>
) => {
  const { cornerA, cornerB } =
    determineRectangleCoordinatesToCoverCoordinates(givenCoordinates);
  let pointIdsInXYBounds = new Set<string>();

  for (const [pointId, { coordinates }] of allPoints) {
    const pointInRectangle = coordinateWithinRectangle(
      coordinates,
      cornerA,
      cornerB
    );

    if (pointInRectangle) {
      pointIdsInXYBounds.add(pointId);
    }
  }

  if (pointIdsInXYBounds.size === 0) {
    return null;
  }

  return pointIdsInXYBounds;
};

const coordinateWithinRectangle = (
  coordinates: ICoordinates,
  cornerA: ICoordinates,
  cornerB: ICoordinates
) => {
  const { x: currentX, y: currentY } = cornerA;
  const { x: nextX, y: nextY } = cornerB;

  const { x: potentialX, y: potentialY } = coordinates;
  const inXCurToNext = currentX >= potentialX && potentialX >= nextX;
  const inXNextToCur = nextX >= potentialX && potentialX >= currentX;

  if (!inXCurToNext && !inXNextToCur) {
    return false;
  }

  const inYCurToNext = currentY >= potentialY && potentialY >= nextY;
  const inYNextToCur = nextY >= potentialY && potentialY >= currentY;

  if (!inYCurToNext && !inYNextToCur) {
    return false;
  }

  return true;
};

//Won't work if bounds have crevice
export const identifyPointIdsWithinBounds = (
  counterclockwiseBounds: ICoordinates[],
  potentialPointIds: Set<string>,
  allPoints: IPointsMap
) => {
  let updatedPotentialPointIds: Set<string> = new Set<string>(
    potentialPointIds
  );

  counterclockwiseBounds.forEach((startCoordinate, idx, arr) => {
    if (updatedPotentialPointIds === null) {
      return;
    }

    let potentialCoordinates = new Set<string>();

    const endCoordinate = idx === arr.length - 1 ? arr[0] : arr[idx + 1];

    const coordinatesToLeft = determineLeftSideCoordinates(
      updatedPotentialPointIds,
      allPoints,
      startCoordinate,
      endCoordinate
    );

    if (coordinatesToLeft) {
      potentialCoordinates = new Set([
        ...potentialCoordinates,
        ...coordinatesToLeft,
      ]);
    }

    updatedPotentialPointIds = potentialCoordinates;
  });

  counterclockwiseBounds.forEach((startCoordinate, idx, arr) => {
    const endCoordinate = idx === arr.length - 1 ? arr[0] : arr[idx + 1];

    const coordinatesOnEdge = determineCoordinatesOnEdge(
      potentialPointIds,
      allPoints,
      startCoordinate,
      endCoordinate
    );

    if (coordinatesOnEdge) {
      updatedPotentialPointIds = new Set([
        ...updatedPotentialPointIds,
        ...coordinatesOnEdge,
      ]);
    }
  });

  if (updatedPotentialPointIds.size === 0) {
    return null;
  }

  return updatedPotentialPointIds as Set<string> | null;
};
