import {
  isCoordinateOutside,
  lineDirection,
} from "../addImages/generateEdgesMap";
import { ICoordinates, IPoint, IPointsMap } from "./pointsTypes";
import {
  getRadiansFromSides,
  getHypotenuseSideFromSides,
  getNonHypotenuseSideFromSides,
  getRadiansFromNonHypotenuseSides,
  SOHOppositeSideFromRadians,
} from "./triganomitryHelpers";

export const determineNextPoint = (
  currentImageCoordinate: ICoordinates,
  nextImagePointId: string,
  allOtherPoints: IPointsMap
) => {
  const { coordinates: nextImageCoordinate } =
    allOtherPoints.get(nextImagePointId)!;

  const thresholdArea = validArea(
    currentImageCoordinate,
    nextImageCoordinate,
    5
  );

  const { TL, TR, BR, BL } = thresholdArea;

  // using this simpler algorithm reduce number of coordinates
  // going into next more complex algorithm
  const pointIdsInRectangle = identifyPointsInRectangle(
    { x: BL.x, y: TL.y },
    { x: TR.x, y: BR.y },
    allOtherPoints
  );

  if (pointIdsInRectangle === null) {
    return nextImagePointId;
  }

  const areaBoundedPointIds = identifyPointIdsWithinBounds(
    Object.values(thresholdArea),
    pointIdsInRectangle,
    allOtherPoints
  );

  if (areaBoundedPointIds === null) {
    return nextImagePointId;
  }

  const nextPointId = identifyClosestCoordinateToCoordinate(
    currentImageCoordinate,
    nextImagePointId,
    areaBoundedPointIds,
    allOtherPoints
  );

  return nextPointId;
};

const identifyClosestCoordinateToCoordinate = (
  principleCoordinate: ICoordinates,
  nextImgPointId: string,
  potentialPointIds: Set<string>,
  allOtherPoints: IPointsMap
) => {
  let closestPointId = nextImgPointId;

  const { x: principleX, y: principleY } = principleCoordinate;
  const { coordinates } = allOtherPoints.get(nextImgPointId)!;

  let closestPointDistance = getHypotenuseSideFromSides(
    Math.abs(principleX - coordinates.x),
    Math.abs(principleY - coordinates.y)
  );

  for (const pointId of potentialPointIds) {
    const { coordinates } = allOtherPoints.get(pointId)!;

    const distanceToOrigin = getHypotenuseSideFromSides(
      Math.abs(principleX - coordinates.x),
      Math.abs(principleY - coordinates.y)
    );

    if (distanceToOrigin < closestPointDistance) {
      closestPointId = pointId;
      closestPointDistance = distanceToOrigin;
    }
  }

  return closestPointId;
};

//need to define an area of acceptable next points

const validArea = (
  currentImageCoordinate: ICoordinates,
  nextImageCoordinate: ICoordinates,
  offset: number
) => {
  const { yDirection, xDirection } = lineDirection(
    currentImageCoordinate,
    nextImageCoordinate
  );

  if (yDirection === "horizontal") {
    return validAreaOnAxisLine(
      currentImageCoordinate,
      nextImageCoordinate,
      offset,
      xDirection
    );
  }

  if (xDirection === "vertical") {
    return validAreaOnAxisLine(
      currentImageCoordinate,
      nextImageCoordinate,
      offset,
      yDirection
    );
  }

  const { x: currentX, y: currentY } = currentImageCoordinate;
  const { x: nextX, y: nextY } = nextImageCoordinate;

  const opposite = nextY - currentY;
  const adjacent = nextX - currentX;

  // Need directionality

  const oppositeRadians = getRadiansFromNonHypotenuseSides(
    Math.abs(opposite),
    Math.abs(adjacent)
  );

  const hyp = Math.abs(offset);

  const xLength = SOHOppositeSideFromRadians(hyp, oppositeRadians);

  const yLength = getNonHypotenuseSideFromSides(hyp, xLength);

  const BL = { x: currentX, y: currentY };

  let BRx, BRy, TRx, TRy, TLx, TLy;

  if (xDirection === "right") {
    BRx = nextX + xLength;
    if (yDirection === "down") {
      BRy = nextY + yLength;

      TRx = BRx + yLength;
      TRy = BRy - xLength;

      TLx = BL.x + yLength;
      TLy = BL.y - xLength;
    } else {
      BRy = nextY - yLength;

      TRx = BRx - yLength;
      TRy = BRy - xLength;

      TLx = BL.x - yLength;
      TLy = BL.y - xLength;
    }
  } else {
    BRx = nextX - xLength;
    if (yDirection === "down") {
      BRy = nextY + yLength;

      TRx = BRx + yLength;
      TRy = BRy + xLength;

      TLx = BL.x + yLength;
      TLy = BL.y + xLength;
    } else {
      BRy = nextY - yLength;

      TRx = BRx - yLength;
      TRy = BRy + xLength;

      TLx = BL.x - yLength;
      TLy = BL.y + xLength;
    }
  }

  const BR = { x: BRx, y: BRy };

  const TL = { x: TLx, y: TLy };
  const TR = { x: TRx, y: TRy };

  const validArea = { TL, TR, BR, BL };

  return validArea;
};

const validAreaOnAxisLine = (
  { x: currentX, y: currentY }: ICoordinates,
  { x: nextX, y: nextY }: ICoordinates,
  offset: number,
  direction: string
) => {
  if (direction === "right") {
    const BL = { x: currentX, y: currentY };
    const BR = { x: nextX + offset, y: nextY };

    const TL = { x: BL.x, y: BL.y - offset };
    const TR = { x: BR.x, y: BR.y - offset };

    const validArea = { TL, TR, BR, BL };
    return validArea;
  }
  if (direction === "left") {
    const BL = { x: currentX, y: currentY };
    const BR = { x: nextX - offset, y: nextY };

    const TL = { x: BL.x, y: BL.y + offset };
    const TR = { x: BR.x, y: BR.y + offset };

    const validArea = { TL, TR, BR, BL };
    return validArea;
  }

  if (direction === "down") {
    const BL = { x: currentX, y: currentY };
    const BR = { x: nextX, y: nextY + offset };

    const TL = { x: BL.x + offset, y: BL.y };
    const TR = { x: BR.x + offset, y: BR.y };

    const validArea = { TL, TR, BR, BL };
    return validArea;
  }

  if (direction === "up") {
    const BL = { x: currentX, y: currentY };
    const BR = { x: nextX, y: nextY - offset };

    const TL = { x: BL.x - offset, y: BL.y };
    const TR = { x: BR.x - offset, y: BR.y };

    const validArea = { TL, TR, BR, BL };
    return validArea;
  }

  throw new Error("Incorrect direction given");
};

const identifyPointIdsWithinBounds = (
  bounds: ICoordinates[],
  potentialPointIds: Set<string>,
  allPoints: IPointsMap
) => {
  let updatedPotentialPointIds: Set<string> | null = new Set<string>(
    potentialPointIds
  );

  bounds.forEach((startCoordinate, idx, arr) => {
    if (updatedPotentialPointIds === null) {
      return;
    }

    const endCoordinate = idx === arr.length - 1 ? arr[0] : arr[idx + 1];

    const planeEdge =
      startCoordinate.x === endCoordinate.x
        ? "y"
        : startCoordinate.y === endCoordinate.y
        ? "x"
        : null;

    if (planeEdge) {
      const identifierFn =
        planeEdge === "x"
          ? potentialPointIdsAlongXPlaneEdge
          : potentialPointIdsAlongYPlaneEdge;
      const planePotentialPointIds = identifierFn(
        updatedPotentialPointIds,
        allPoints,
        startCoordinate,
        endCoordinate
      );

      updatedPotentialPointIds = planePotentialPointIds;

      return;
    }

    const potentialCoordinates = determineLeftSideCoordinates(
      updatedPotentialPointIds,
      allPoints,
      startCoordinate,
      endCoordinate
    );

    updatedPotentialPointIds = potentialCoordinates;
  });

  return updatedPotentialPointIds as Set<string> | null;
};

const potentialPointIdsAlongXPlaneEdge = (
  currentPotentialPointIds: Set<string>,
  allPoints: IPointsMap,
  startCoordinate: ICoordinates,
  endCoordinate: ICoordinates
) => {
  let updatedPotentialPointIds = new Set<string>();

  for (const pointId of currentPotentialPointIds) {
    const { coordinates } = allPoints.get(pointId)!;
    const hasPotential = identifyPotentialCoordinateFromXPlaneEdge(
      coordinates.x,
      startCoordinate.y,
      startCoordinate.x,
      endCoordinate.x
    );

    if (hasPotential) {
      updatedPotentialPointIds.add(pointId);
    }
  }

  if (updatedPotentialPointIds.size === 0) {
    return null;
  }

  return updatedPotentialPointIds;
};

const potentialPointIdsAlongYPlaneEdge = (
  currentPotentialPointIds: Set<string>,
  allPoints: IPointsMap,
  startCoordinate: ICoordinates,
  endCoordinate: ICoordinates
) => {
  let potentialPointIds = new Set<string>();

  for (const pointId of currentPotentialPointIds) {
    const { coordinates } = allPoints.get(pointId)!;
    const hasPotential = identifyPotentialCoordinateFromYPlaneEdge(
      coordinates.y,
      startCoordinate.x,
      startCoordinate.y,
      endCoordinate.y
    );

    if (hasPotential) {
      potentialPointIds.add(pointId);
    }
  }

  if (potentialPointIds.size === 0) {
    return null;
  }

  return potentialPointIds;
};

const identifyPotentialCoordinateFromXPlaneEdge = (
  potentialNonPlaneValue: number,
  planeValue: number,
  startEdgeValue: number,
  endEdgeValue: number
) => {
  if (startEdgeValue < endEdgeValue) {
    return potentialNonPlaneValue >= planeValue;
  } else {
    return potentialNonPlaneValue <= planeValue;
  }
};

const identifyPotentialCoordinateFromYPlaneEdge = (
  potentialNonPlaneValue: number,
  planeValue: number,
  startEdgeValue: number,
  endEdgeValue: number
) => {
  if (startEdgeValue < endEdgeValue) {
    return potentialNonPlaneValue <= planeValue;
  } else {
    return potentialNonPlaneValue >= planeValue;
  }
};

const determineLeftSideCoordinates = (
  currentPotentialPointIds: Set<string>,
  allPoints: IPointsMap,
  lineStart: ICoordinates,
  lineEnd: ICoordinates
) => {
  let potentialCoordinates = new Set<string>();

  for (const pointId of currentPotentialPointIds) {
    const { coordinates } = allPoints.get(pointId)!;
    const externalCoordinate = isCoordinateOutside(
      lineStart,
      lineEnd,
      coordinates,
      0
    );

    if (!externalCoordinate) {
      potentialCoordinates.add(pointId);
    }
  }

  if (potentialCoordinates.size === 0) {
    return null;
  }

  return potentialCoordinates;
};

const identifyPointsInRectangle = (
  cornerA: ICoordinates,
  cornerB: ICoordinates,
  allPoints: Map<string, IPoint>
) => {
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
