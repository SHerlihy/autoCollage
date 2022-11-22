import { lineDirection } from "../addImages/shapeHelpers";
import { toDecimalPlaces } from "./mathHelpers";
import { ICoordinates } from "./pointsTypes";
import {
  getNonHypotenuseSideFromSides,
  getRadiansFromNonHypotenuseSides,
  SOHOppositeSideFromRadians,
} from "./trigonometryHelpers";

export const calculateAreaBeyondEdge = (
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

  return validAreaOnDiagonalLine(
    currentImageCoordinate,
    nextImageCoordinate,
    offset,
    xDirection,
    yDirection
  );
};

const validAreaOnAxisLine = (
  { x: currentX, y: currentY }: ICoordinates,
  { x: nextX, y: nextY }: ICoordinates,
  offset: number,
  direction: string,
  underMod = 2
) => {
  if (direction === "right") {
    const BL = { x: currentX, y: currentY + underMod };
    const BR = { x: nextX + offset, y: nextY + underMod };

    const TL = { x: currentX, y: currentY - offset };
    const TR = { x: nextX, y: nextY - offset };

    const validArea = { TL, TR, BR, BL };
    return validArea;
  }
  if (direction === "left") {
    const BL = { x: currentX, y: currentY - underMod };
    const BR = { x: nextX - offset, y: nextY - underMod };

    const TL = { x: currentX, y: currentY + offset };
    const TR = { x: nextX, y: nextY + offset };

    const validArea = { TL, TR, BR, BL };
    return validArea;
  }

  if (direction === "down") {
    const BL = { x: currentX - underMod, y: currentY };
    const BR = { x: nextX - underMod, y: nextY + offset };

    const TL = { x: currentX + offset, y: currentY };
    const TR = { x: nextX + offset, y: nextY };

    const validArea = { TL, TR, BR, BL };
    return validArea;
  }

  if (direction === "up") {
    const BL = { x: currentX + underMod, y: currentY };
    const BR = { x: nextX + underMod, y: nextY - offset };

    const TL = { x: currentX - offset, y: currentY };
    const TR = { x: nextX - offset, y: nextY };

    const validArea = { TL, TR, BR, BL };
    return validArea;
  }

  throw new Error("Incorrect direction given");
};

const validAreaOnDiagonalLine = (
  { x: currentX, y: currentY }: ICoordinates,
  { x: nextX, y: nextY }: ICoordinates,
  offset: number,
  xDirection: string,
  yDirection: string,
  underMod = 4
) => {
  const opposite = nextY - currentY;
  const adjacent = nextX - currentX;

  // Need directionality

  const oppositeRadians = getRadiansFromNonHypotenuseSides(
    Math.abs(opposite),
    Math.abs(adjacent)
  );

  const hyp = Math.abs(offset);

  const yLength = toDecimalPlaces(
    SOHOppositeSideFromRadians(hyp, oppositeRadians)
  );

  const xLength =
    toDecimalPlaces(hyp) !== yLength
      ? toDecimalPlaces(getNonHypotenuseSideFromSides(hyp, yLength))
      : 0;

  const BL = { x: currentX, y: currentY };

  let BLx, BLy, BRx, BRy, TRx, TRy, TLx, TLy;

  if (xDirection === "right") {
    if (yDirection === "down") {
      BLx = currentX - underMod;
      BLy = currentY + underMod;

      BRx = nextX + xLength - underMod;
      BRy = nextY + yLength + underMod;

      TRx = nextX + xLength + yLength;
      TRy = nextY + yLength - xLength;

      TLx = currentX + yLength;
      TLy = currentY - xLength;
    } else {
      BLx = currentX + underMod;
      BLy = currentY + underMod;

      BRx = nextX + xLength + underMod;
      BRy = nextY - yLength + underMod;

      TRx = nextX + xLength - yLength;
      TRy = nextY - yLength - xLength;

      TLx = currentX - yLength;
      TLy = currentY - xLength;
    }
  } else {
    if (yDirection === "down") {
      BLx = currentX - underMod;
      BLy = currentY - underMod;

      BRx = nextX - xLength - underMod;
      BRy = nextY + yLength - underMod;

      TRx = nextX - xLength + yLength;
      TRy = nextY + yLength + xLength;

      TLx = currentX + yLength;
      TLy = currentY + xLength;
    } else {
      BLx = currentX + underMod;
      BLy = currentY - underMod;

      BRx = nextX - xLength + underMod;
      BRy = nextY - yLength - underMod;

      TRx = nextX - xLength - yLength;
      TRy = nextY - yLength + xLength;

      TLx = currentX - yLength;
      TLy = currentY + xLength;
    }
  }

  const BR = { x: BRx, y: BRy };

  const TL = { x: TLx, y: TLy };
  const TR = { x: TRx, y: TRy };

  const validArea = { TL, TR, BR, BL };

  return validArea;
};
