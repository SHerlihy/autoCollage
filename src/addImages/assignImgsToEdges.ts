import { ICoordinates } from "../perimeter/pointsTypes";
import { angleFromCoordinates, angleToRads, edgeLengthFromCoordinates, edgeLengthFromOppAngleAndEdges, getAngleFromSideLengths, getAngleFromSides, getHypotenuseSideFromSides, getNonHypotenuseSideFromSides, getSideLengthFromAnglesAndSide, sideLengthFromPairedSideAngle, SOHOppositeSide } from "../perimeter/triganomitryHelpers";
import { IEdge } from "./generateEdgesMap";

const determineCreviceClearanceArea = (topLeft: ICoordinates, bottom: ICoordinates, topRight: ICoordinates, minWidth: number) => {
  const capWidth = edgeLengthFromCoordinates(topLeft, topRight)

  if(capWidth < minWidth) return;

  const rightEdgeLength = edgeLengthFromCoordinates(bottom, topRight);
  const leftEdgeLength = edgeLengthFromCoordinates(bottom, topLeft);

  const creviceAngle = angleFromCoordinates(topLeft, bottom, topRight);

  const minWidthToBottomAngle = (180 - creviceAngle)/2;

  const bottomAngle = 90 - minWidthToBottomAngle;

  const bottomEdgeLength = sideLengthFromPairedSideAngle(minWidth, creviceAngle, minWidthToBottomAngle);

  const rightClearance = determineClearance(rightEdgeLength, leftEdgeLength, capWidth, bottomEdgeLength, bottomAngle)
  const leftClearance = determineClearance(leftEdgeLength, rightEdgeLength, capWidth, bottomEdgeLength, bottomAngle)

  const topRightToRightClearanceLength = edgeLengthFromOppAngleAndEdges(bottomAngle, rightClearance, rightEdgeLength-bottomEdgeLength)
  const topLeftToLeftClearanceLength = edgeLengthFromOppAngleAndEdges(bottomAngle, leftClearance, leftEdgeLength-bottomEdgeLength)

  const rightMinWidthCoordinate = determineCoordinatesAlongLine(bottom, topRight, rightEdgeLength, bottomEdgeLength)
  const leftMinWidthCoordinate = determineCoordinatesAlongLine(bottom, topLeft, leftEdgeLength, bottomEdgeLength)

  const rightTopClearanceCoordinate = determineCoordinatesAlongLine(topRight, topLeft, capWidth, topRightToRightClearanceLength)
  const leftTopClearanceCoordinate = determineCoordinatesAlongLine(topLeft, topRight, capWidth, topLeftToLeftClearanceLength)

  return {
    tl: leftTopClearanceCoordinate,
    tr: rightTopClearanceCoordinate,
    br: rightMinWidthCoordinate,
    bl: leftMinWidthCoordinate
  }
}

const determineCoordinatesAlongLine = (coordinatesA: ICoordinates, coordinatesB: ICoordinates, lengthAB: number, lengthToCoordinate: number): ICoordinates => {
  const xAB = coordinatesB.x - coordinatesA.x;
  const yAB = coordinatesB.y - coordinatesA.y;
  const someAngle = getAngleFromSides(Math.abs(xAB),lengthAB, Math.abs(yAB));

  const someRads = angleToRads(someAngle)

  const xANew = SOHOppositeSide(lengthToCoordinate, someRads)

  const yANew = getNonHypotenuseSideFromSides(lengthToCoordinate, xANew)

  return {
    x: coordinatesA.x + xANew,
    y: coordinatesA.y + yANew
  }
}

const determineClearance = (subjectEdgeLength: number, otherEdgeLength: number, capWidth: number, bottomEdgeLength: number, bottomIsoscelesAngle: number) => {
  const topRightAngle = getAngleFromSideLengths(otherEdgeLength, capWidth, subjectEdgeLength);

  const rightLeftAngle = 180 - bottomIsoscelesAngle - topRightAngle;

  const topEdgeLength = subjectEdgeLength - bottomEdgeLength;

  const clearance = sideLengthFromPairedSideAngle(topEdgeLength, rightLeftAngle, topRightAngle)

  return clearance;
}

// const orderImgsByMaxWidth = ():imgPointsMap: Map<string, IPoint> => {

// }