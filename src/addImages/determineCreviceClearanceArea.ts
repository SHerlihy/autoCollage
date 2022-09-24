import { withinEpsilonBounds } from "../perimeter/mathHelpers";
import { ICoordinates } from "../perimeter/pointsTypes";
import {
  radiansFromCoordinates,
  edgeLengthFromCoordinates,
  edgeLengthFromOppAngleAndEdges,
  getRadiansFromSideLengths,
  getRadiansFromSides,
  getNonHypotenuseSideFromSides,
  radiansToDegrees,
  getSideLengthFromDegreesAndSide,
  SOHOppositeSideFromDegrees,
} from "../perimeter/trigonometryHelpers";

export type ClearanceArea = { [key: string]: ICoordinates };

export const determineCreviceClearanceArea = (
  topLeft: ICoordinates,
  bottom: ICoordinates,
  topRight: ICoordinates,
  minWidth: number
): ClearanceArea | undefined => {
  const capWidth = edgeLengthFromCoordinates(topLeft, topRight);

  if (capWidth < minWidth) return;

  const rightEdgeLength = edgeLengthFromCoordinates(bottom, topRight);
  const leftEdgeLength = edgeLengthFromCoordinates(bottom, topLeft);

  const creviceDegrees = radiansToDegrees(
    radiansFromCoordinates(topLeft, bottom, topRight)
  );

  const minWidthToBottomDegrees = (180 - creviceDegrees) / 2;

  const bottomExcessDegrees = 90 - minWidthToBottomDegrees;

  const bottomEdgeLength = getSideLengthFromDegreesAndSide(
    minWidth,
    creviceDegrees,
    minWidthToBottomDegrees
  );

  // added here as thin crevices can lead to rounding errors
  // Non-confirmed
  if (bottomEdgeLength > rightEdgeLength || bottomEdgeLength > leftEdgeLength) {
    return;
  }

  const rightClearance = determineClearance(
    rightEdgeLength,
    leftEdgeLength,
    capWidth,
    bottomEdgeLength,
    bottomExcessDegrees
  );
  const leftClearance = determineClearance(
    leftEdgeLength,
    rightEdgeLength,
    capWidth,
    bottomEdgeLength,
    bottomExcessDegrees
  );

  const topRightToRightClearanceLength = edgeLengthFromOppAngleAndEdges(
    bottomExcessDegrees,
    rightClearance,
    rightEdgeLength - bottomEdgeLength
  );
  const topLeftToLeftClearanceLength = edgeLengthFromOppAngleAndEdges(
    bottomExcessDegrees,
    leftClearance,
    leftEdgeLength - bottomEdgeLength
  );

  const rightMinWidthCoordinate = determineCoordinatesAlongLine(
    bottom,
    topRight,
    bottomEdgeLength
  );
  const leftMinWidthCoordinate = determineCoordinatesAlongLine(
    bottom,
    topLeft,
    bottomEdgeLength
  );

  const rightTopClearanceCoordinate = determineCoordinatesAlongLine(
    topRight,
    topLeft,
    topRightToRightClearanceLength
  );
  const leftTopClearanceCoordinate = determineCoordinatesAlongLine(
    topLeft,
    topRight,
    topLeftToLeftClearanceLength
  );

  return {
    tl: leftTopClearanceCoordinate,
    tr: rightTopClearanceCoordinate,
    br: rightMinWidthCoordinate,
    bl: leftMinWidthCoordinate,
  };
};

const determineCoordinatesAlongLine = (
  coordinatesA: ICoordinates,
  coordinatesB: ICoordinates,
  lengthToCoordinate: number
): ICoordinates => {
  const lengthAB = edgeLengthFromCoordinates(coordinatesA, coordinatesB);

  const xAB = coordinatesB.x - coordinatesA.x;
  const yAB = coordinatesB.y - coordinatesA.y;

  if (withinEpsilonBounds(xAB, 0)) {
    const y =
      yAB < 0
        ? coordinatesA.y - lengthToCoordinate
        : coordinatesA.y + lengthToCoordinate;

    return {
      x: coordinatesA.x,
      y,
    };
  }

  if (withinEpsilonBounds(yAB, 0)) {
    const x =
      xAB < 0
        ? coordinatesA.x - lengthToCoordinate
        : coordinatesA.x + lengthToCoordinate;
    return {
      x,
      y: coordinatesA.y,
    };
  }

  const oppDegrees = radiansToDegrees(
    getRadiansFromSides(Math.abs(xAB), lengthAB, Math.abs(yAB))
  );

  const xANew = SOHOppositeSideFromDegrees(lengthToCoordinate, oppDegrees);

  const yANew = getNonHypotenuseSideFromSides(lengthToCoordinate, xANew);

  const x = xAB < 0 ? coordinatesA.x - xANew : coordinatesA.x + xANew;
  const y = yAB < 0 ? coordinatesA.y - yANew : coordinatesA.y + yANew;

  return {
    x,
    y,
  };
};

const determineClearance = (
  subjectEdgeLength: number,
  otherEdgeLength: number,
  capWidth: number,
  bottomEdgeLength: number,
  bottomIsoscelesAngle: number
) => {
  const topRightAngle = radiansToDegrees(
    getRadiansFromSideLengths(otherEdgeLength, capWidth, subjectEdgeLength)
  );

  const rightLeftAngle = 180 - bottomIsoscelesAngle - topRightAngle;

  const topEdgeLength = subjectEdgeLength - bottomEdgeLength;

  const clearance = getSideLengthFromDegreesAndSide(
    topEdgeLength,
    rightLeftAngle,
    topRightAngle
  );

  return clearance;
};
