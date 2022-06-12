import {
  getRadiansFromSides,
  getHypotenuseSideFromSides,
  getNonHypotenuseSideFromSides,
  getRadiansFromNonHypotenuseSides,
  SOHOppositeSideFromRadians,
} from "./triganomitryHelpers";

export const determineNextPoint = (
  currentImageCoordinate,
  nextImageCoordinate,
  offset,
  allOtherPoints
) => {
  const { TL, TR, BR, BL } = validArea(
    currentImageCoordinate,
    nextImageCoordinate,
    offset
  );

  const boxBoundedPoints = whatsInTheBox(
    { x: BL.x, y: TL.y },
    { x: TR.x, y: BR.y },
    allOtherPoints
  );

  const ascendingY = boxBoundedPoints.sort(({ y: aY }, { y: bY }) => {
    return aY - bY;
  });

  const nextPoint = ascendingY.find((point) => {
    const inDepth = determinePointBetweenParallelPoints(point, BR, TR);
    const inBreadth = determinePointBetweenParallelPoints(point, BL, BR);

    return inDepth && inBreadth;
  });

  return nextPoint || nextImageCoordinate;
};

//need to define an area of acceptable next points

const validArea = (currentImageCoordinate, nextImageCoordinate, offset) => {
  const { x: currentX, y: currentY } = currentImageCoordinate;
  const { x: nextX, y: nextY } = nextImageCoordinate;

  const opposite = nextY - currentY;
  const adjacent = nextX - currentX;

  const oppositeRadians = getRadiansFromNonHypotenuseSides(opposite, adjacent);

  const hyp = Math.abs(offset);

  const xLength = SOHOppositeSideFromRadians(hyp, oppositeRadians);

  const yLength = getNonHypotenuseSideFromSides(hyp, xLength);

  const BL = { x: currentX - xLength, y: currentY - yLength };
  const BR = { x: nextX + xLength, y: nextY + yLength };

  const TL = { x: BL.x + yLength, y: BL.y - xLength };
  const TR = { x: BR.x + yLength, y: BR.y - xLength };

  const validArea = { TL, TR, BR, BL };

  return validArea;
};

const whatsInTheBox = (pointA, pointB, allPoints) => {
  const { x: currentX, y: currentY } = pointA;
  const { x: nextX, y: nextY } = pointB;

  const coordinatesInXBounds = allPoints.reduce((acc, cur) => {
    const { x: potentialX } = cur;
    const inXCurToNext = currentX > potentialX && potentialX > nextX;
    const inXNextToCur = nextX > potentialX && potentialX > currentX;

    if (inXCurToNext || inXNextToCur) {
      acc.push(cur);
    }

    return acc;
  }, []);

  const coordinatesInYBounds = coordinatesInXBounds.reduce((acc, cur) => {
    const { y: potentialY } = cur;

    const inYCurToNext = currentY > potentialY && potentialY > nextY;
    const inYNextToCur = nextY > potentialY && potentialY > currentY;

    if (inYCurToNext || inYNextToCur) {
      acc.push(cur);
    }

    return acc;
  }, []);

  return coordinatesInYBounds;
};

const determinePointBetweenParallelPoints = (point, rightPoint, leftPoint) => {
  const lengthRight = getHypotenuseSideFromSides(
    rightPoint.x - leftPoint.x,
    leftPoint.y - rightPoint.y
  );

  const lengthRightTo = getHypotenuseSideFromSides(
    rightPoint.x - point.x,
    rightPoint.y - point.y
  );

  const lengthLeftTo = getHypotenuseSideFromSides(
    leftPoint.x - point.x,
    leftPoint.y - point.y
  );

  const leftAngle = getRadiansFromSides(
    lengthLeftTo,
    lengthRightTo,
    lengthRight
  );
  const RightAngle = getRadiansFromSides(
    lengthRightTo,
    lengthLeftTo,
    lengthRight
  );

  return leftAngle < 90 && RightAngle < 90;
};
