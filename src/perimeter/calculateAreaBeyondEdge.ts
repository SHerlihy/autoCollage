import { lineDirection } from "../addImages/generateEdgesMap";
import { toDecimalPlaces } from "./mathHelpers";
import { ICoordinates } from "./pointsTypes";
import {
  getNonHypotenuseSideFromSides,
  getRadiansFromNonHypotenuseSides,
  SOHOppositeSideFromRadians,
} from "./triganomitryHelpers";

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

const validAreaOnDiagonalLine = (
  { x: currentX, y: currentY }: ICoordinates,
  { x: nextX, y: nextY }: ICoordinates,
  offset: number,
  xDirection: string,
  yDirection: string
) => {
  const opposite = nextY - currentY;
  const adjacent = nextX - currentX;

  // Need directionality

  const oppositeRadians = getRadiansFromNonHypotenuseSides(
    Math.abs(opposite),
    Math.abs(adjacent)
  );

  const hyp = Math.abs(offset);

  const xLength = toDecimalPlaces(
    SOHOppositeSideFromRadians(hyp, oppositeRadians)
  );

  const yLength = toDecimalPlaces(getNonHypotenuseSideFromSides(hyp, xLength));

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
