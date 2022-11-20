import { withinEpsilonBounds } from "../perimeter/mathHelpers";
import { ICoordinates, IPointsMap } from "../perimeter/pointsTypes";
import {
  edgeLengthFromCoordinates,
  getHypotenuseSideFromSides,
  getNonHypotenuseSideFromSides,
  getRadiansFromSides,
  radiansToDegrees,
  SOHOppositeSideFromDegrees,
} from "../perimeter/trigonometryHelpers";

export const lineDirection = (
  lineStartCoordinates: ICoordinates,
  lineEndCoordinates: ICoordinates
) => {
  const horizontal = withinEpsilonBounds(
    lineStartCoordinates.y,
    lineEndCoordinates.y,
    99999
  );
  const vertical = withinEpsilonBounds(
    lineStartCoordinates.x,
    lineEndCoordinates.x,
    99999
  );

  const goingDown =
    lineStartCoordinates.y < lineEndCoordinates.y ? "down" : "up";
  const goingRight =
    lineStartCoordinates.x < lineEndCoordinates.x ? "right" : "left";

  return {
    yDirection: horizontal ? "horizontal" : goingDown,
    xDirection: vertical ? "vertical" : goingRight,
  };
};

export const hasMatchingGradient = (
  lineStart: ICoordinates,
  lineEnd: ICoordinates,
  subjectCoordinate: ICoordinates,
  deltaThreshold = 1
) => {
  const lineGrad = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
  const toPointGrad =
    (subjectCoordinate.y - lineStart.y) / (subjectCoordinate.x - lineStart.x);

  const yComparison =
    Math.trunc(lineGrad * 1000) - Math.trunc(toPointGrad * 1000);

  if (Math.abs(yComparison) <= deltaThreshold) {
    return true;
  } else {
    return false;
  }
};

export const determineCoordinatesAlongLine = (
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

export const distanceBetweenCoordinates = (
  { x: startX, y: startY }: ICoordinates,
  { x: endX, y: endY }: ICoordinates
) => {
  const diffX = Math.abs(endX - startX);
  const diffY = Math.abs(endY - startY);

  return getHypotenuseSideFromSides(diffX, diffY);
};

export const validatePerimeter = (
  validPerimeter: IPointsMap,
  subjectPerimeter: IPointsMap
) => {
  const validOrderedCoordinates = [...validPerimeter.values()].map(
    ({ coordinates }) => coordinates
  );
  const subjectOrderedCoordinates = [...subjectPerimeter.values()].map(
    ({ coordinates }) => coordinates
  );

  let lastValidIdx = 0;

  let subjectIsValid = true;

  for (const validCoordiante of validOrderedCoordinates) {
    const { x: validX, y: validY } = validCoordiante;

    const validIdx = subjectOrderedCoordinates.findIndex(({ x, y }) => {
      return validX === x && validY === y;
    });

    if (validIdx === -1 || validIdx > lastValidIdx) {
      subjectIsValid = false;
      break;
    }

    lastValidIdx = validIdx;
  }

  return subjectIsValid ? subjectPerimeter : validPerimeter;
};
