import {
  isCoordinateOutside,
  lineDirection,
} from "../addImages/generateEdgesMap";
import { ICoordinates } from "./pointsTypes";
import {
  getRadiansFromSides,
  getHypotenuseSideFromSides,
  getNonHypotenuseSideFromSides,
  getRadiansFromNonHypotenuseSides,
  SOHOppositeSideFromRadians,
} from "./triganomitryHelpers";

export const determineNextPoint = (
  currentImageCoordinate: ICoordinates,
  nextImageCoordinate: ICoordinates,
  offset: number,
  allOtherPoints: ICoordinates[]
) => {
  const thresholdArea = validArea(
    currentImageCoordinate,
    nextImageCoordinate,
    5
  );

  const { TL, TR, BR, BL } = thresholdArea;

  // using this simpler algorithm reduce number of coordinates
  // going into next more complex algorithm
  const boxBoundedCoordinates = whatsInTheBox(
    { x: BL.x, y: TL.y },
    { x: TR.x, y: BR.y },
    allOtherPoints
  );

  const areaBoundedCoordinates = identifyCoordinatesWithinBounds(
    Object.values(thresholdArea),
    boxBoundedCoordinates
  );

  const identifyClosestCoordinateToCoordinate = (
    principleCoordinate: ICoordinates,
    otherCoordinates: ICoordinates[]
  ) => {
    const { x: principleX, y: principleY } = principleCoordinate;

    const closestCoordinate = otherCoordinates.reduce(
      (acc, otherCoordinate) => {
        const { x: otherX, y: otherY } = otherCoordinate;

        const otherDistance = getHypotenuseSideFromSides(
          Math.abs(principleX - otherX),
          Math.abs(principleY - otherY)
        );

        if (!acc.distance || otherDistance < acc.distance) {
          acc = {
            closestCoordinate: otherCoordinate,
            distance: otherDistance,
          };
        }

        return acc;

        //need to sort out distance, set to distance between edge coordinates
      },
      {} as { closestCoordinate: ICoordinates; distance: number }
    );

    return closestCoordinate;
  };

  const { closestCoordinate: nextBoxPoint } =
    identifyClosestCoordinateToCoordinate(currentImageCoordinate, [
      ...boxBoundedCoordinates,
      nextImageCoordinate,
    ]);

  const { closestCoordinate: nextPoint } =
    identifyClosestCoordinateToCoordinate(currentImageCoordinate, [
      ...areaBoundedCoordinates,
      nextImageCoordinate,
    ]);

  if (nextBoxPoint.x !== nextPoint.x) {
    console.log(nextBoxPoint);
    console.log(nextPoint);
  }

  if (nextBoxPoint.y !== nextPoint.y) {
    console.log(nextBoxPoint);
    console.log(nextPoint);
  }

  return nextPoint || nextImageCoordinate;
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

const identifyCoordinatesWithinBounds = (
  bounds: ICoordinates[],
  allCoordinates: ICoordinates[]
) => {
  let potentialCoordinatesArr = [...allCoordinates];

  bounds.forEach((startCoordinate, idx, arr) => {
    const endCoordinate = idx === arr.length - 1 ? arr[0] : arr[idx + 1];

    const planeEdge =
      startCoordinate.x === endCoordinate.x
        ? "y"
        : startCoordinate.y === endCoordinate.y
        ? "x"
        : null;

    if (planeEdge) {
      const planePotentialCoordiantes =
        determinePotentialCoordinatesFromPlaneEdge(
          potentialCoordinatesArr,
          planeEdge,
          startCoordinate,
          endCoordinate
        );

      potentialCoordinatesArr = [...planePotentialCoordiantes];

      return;
    }

    const { potentialCoordinates } = determineLeftSideCoordinates(
      startCoordinate,
      endCoordinate,
      potentialCoordinatesArr
    );

    potentialCoordinatesArr = [...potentialCoordinates];
  });

  return potentialCoordinatesArr;
};

const determinePotentialCoordinatesFromPlaneEdge = (
  potentialCoordinatesArr: ICoordinates[],
  planeEdge: "x" | "y",
  startCoordinate: ICoordinates,
  endCoordinate: ICoordinates
) => {
  const xPlane = planeEdge === "x";

  const planeValue = xPlane ? startCoordinate.y : startCoordinate.x;

  const startEdgeValue = xPlane ? startCoordinate.x : startCoordinate.y;
  const endEdgeValue = xPlane ? endCoordinate.x : endCoordinate.y;

  return potentialCoordinatesArr.reduce((acc, potentialCoordinate) => {
    const hasPotential = determinePotentialCoordinateFromPlaneEdge(
      xPlane,
      planeValue,
      startEdgeValue,
      endEdgeValue,
      potentialCoordinate
    );

    if (hasPotential) {
      acc.push(potentialCoordinate);
    }

    return acc;
  }, [] as ICoordinates[]);
};

const determinePotentialCoordinateFromPlaneEdge = (
  xPlane: boolean,
  planeValue: number,
  startEdgeValue: number,
  endEdgeValue: number,
  potentialCoordinate: ICoordinates
) => {
  const potentialEdgeValue = xPlane
    ? potentialCoordinate.x
    : potentialCoordinate.y;
  const potentialNonPlaneValue = xPlane
    ? potentialCoordinate.y
    : potentialCoordinate.x;

  if (startEdgeValue < endEdgeValue) {
    if (xPlane) {
      return potentialNonPlaneValue >= planeValue;
    } else {
      return potentialNonPlaneValue <= planeValue;
    }
  } else {
    if (xPlane) {
      return potentialNonPlaneValue <= planeValue;
    } else {
      return potentialNonPlaneValue >= planeValue;
    }
  }
};

const determineLeftSideCoordinates = (
  lineStart: ICoordinates,
  lineEnd: ICoordinates,
  allCoordinates: ICoordinates[]
) => {
  const { externalCoordinates, potentialCoordinates } = allCoordinates.reduce(
    (sortedCoordinates, coordinate) => {
      if (isCoordinateOutside(lineStart, lineEnd, coordinate, 0)) {
        sortedCoordinates.externalCoordinates.push(coordinate);
      } else {
        sortedCoordinates.potentialCoordinates.push(coordinate);
      }

      return sortedCoordinates;
    },
    {
      externalCoordinates: [] as Array<ICoordinates>,
      potentialCoordinates: [] as Array<ICoordinates>,
    }
  );

  return { externalCoordinates, potentialCoordinates };
};

const whatsInTheBox = (
  pointA: ICoordinates,
  pointB: ICoordinates,
  allPoints: ICoordinates[]
) => {
  const { x: currentX, y: currentY } = pointA;
  const { x: nextX, y: nextY } = pointB;

  const coordinatesInXBounds = allPoints.reduce((acc, cur) => {
    const { x: potentialX } = cur;
    const inXCurToNext = currentX >= potentialX && potentialX >= nextX;
    const inXNextToCur = nextX >= potentialX && potentialX >= currentX;

    if (inXCurToNext || inXNextToCur) {
      acc.push(cur);
    }

    return acc;
  }, [] as ICoordinates[]);

  const coordinatesInYBounds = coordinatesInXBounds.reduce((acc, cur) => {
    const { y: potentialY } = cur;

    const inYCurToNext = currentY >= potentialY && potentialY >= nextY;
    const inYNextToCur = nextY >= potentialY && potentialY >= currentY;

    if (inYCurToNext || inYNextToCur) {
      acc.push(cur);
    }

    return acc;
  }, [] as ICoordinates[]);

  return coordinatesInYBounds;
};

const determinePointBetweenParallelPoints = (
  point: ICoordinates,
  rightPoint: ICoordinates,
  leftPoint: ICoordinates
) => {
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
