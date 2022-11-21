import { ICoordinates } from "../perimeter/pointsTypes";
import {
  radiansFromCoordinates,
  edgeLengthFromCoordinates,
  edgeLengthFromOppAngleAndEdges,
  getRadiansFromSideLengths,
  radiansToDegrees,
  getSideLengthFromDegreesAndSide,
} from "../perimeter/trigonometryHelpers";
import { determineCoordinatesAlongLine } from "./shapeHelpers";

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

  // map would be better for iterating through
  return {
    tl: leftTopClearanceCoordinate,
    tr: rightTopClearanceCoordinate,
    br: rightMinWidthCoordinate,
    bl: leftMinWidthCoordinate,
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
