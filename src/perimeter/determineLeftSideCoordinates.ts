import { lineDirection } from "../addImages/shapeHelpers";
import { ICoordinates, IPointsMap } from "./pointsTypes";

export const determineLeftSideCoordinates = (
  currentPotentialPointIds: Set<string>,
  allPoints: IPointsMap,
  lineStart: ICoordinates,
  lineEnd: ICoordinates
) => {
  let leftOfEdgeCoordinates = new Set<string>();

  for (const pointId of currentPotentialPointIds) {
    const { coordinates } = allPoints.get(pointId)!;
    const coordinateLeftOfEdge = isCoordinateLeftOfEdge(
      lineStart,
      lineEnd,
      coordinates,
      0
    );

    if (coordinateLeftOfEdge) {
      leftOfEdgeCoordinates.add(pointId);
    }
  }

  if (leftOfEdgeCoordinates.size === 0) {
    return null;
  }

  return leftOfEdgeCoordinates;
};

export const isCoordinateLeftOfEdge = (
  lineStart: ICoordinates,
  lineEnd: ICoordinates,
  subjectCoordinate: ICoordinates,
  creviceThreshold: number
) => {
  const directionalOutside = isLeftOfEdgeDirectional(
    lineStart,
    lineEnd,
    subjectCoordinate
  );

  if (directionalOutside !== null) {
    return directionalOutside;
  }

  const gradientOutside = isLeftOfEdgeGradient(
    lineStart,
    lineEnd,
    subjectCoordinate,
    creviceThreshold
  );

  return gradientOutside;
};

const isLeftOfEdgeGradient = (
  lineStart: ICoordinates,
  lineEnd: ICoordinates,
  subjectCoordinate: ICoordinates,
  creviceThreshold: number
) => {
  // Hav to have the same for toPoint?
  const { yDirection, xDirection } = lineDirection(lineStart, lineEnd);
  const { yDirection: yToPointDirection, xDirection: xToPointDirection } =
    lineDirection(lineStart, subjectCoordinate);

  if (yDirection === "down" && xDirection === "right") {
    if (yToPointDirection === "up" && xToPointDirection === "right") {
      return true;
    }
    if (yToPointDirection === "down" && xToPointDirection === "left") {
      return false;
    }
  }

  if (yDirection === "down" && xDirection === "left") {
    if (yToPointDirection === "down" && xToPointDirection === "right") {
      return true;
    }
    if (yToPointDirection === "up" && xToPointDirection === "left") {
      return false;
    }
  }

  if (yDirection === "up" && xDirection === "left") {
    if (yToPointDirection === "down" && xToPointDirection === "left") {
      return true;
    }
    if (yToPointDirection === "up" && xToPointDirection === "right") {
      return false;
    }
  }

  if (yDirection === "up" && xDirection === "right") {
    if (yToPointDirection === "up" && xToPointDirection === "left") {
      return true;
    }
    if (yToPointDirection === "down" && xToPointDirection === "right") {
      false;
    }
  }

  const lineGrad = (lineEnd.x - lineStart.x) / (lineEnd.y - lineStart.y);
  const toPointGrad =
    (subjectCoordinate.x - lineStart.x) / (subjectCoordinate.y - lineStart.y);

  const yComparison = lineGrad * 50 - toPointGrad * 50;

  if (Math.abs(yComparison) < creviceThreshold) {
    return true;
  }

  if (yDirection === "down" && xDirection === "right") {
    if (yToPointDirection === "down" && xToPointDirection === "right") {
      return toPointGrad > lineGrad;
    }
    if (yToPointDirection === "up" && xToPointDirection === "left") {
      return toPointGrad > lineGrad;
    }
  }

  if (yDirection === "down" && xDirection === "left") {
    if (yToPointDirection === "down" && xToPointDirection === "left") {
      return toPointGrad > lineGrad;
    }
    if (yToPointDirection === "up" && xToPointDirection === "right") {
      return toPointGrad < lineGrad;
    }
  }

  if (yDirection === "up" && xDirection === "left") {
    if (yToPointDirection === "up" && xToPointDirection === "left") {
      return toPointGrad > lineGrad;
    }
    if (yToPointDirection === "down" && xToPointDirection === "right") {
      return toPointGrad > lineGrad;
    }
  }

  if (yDirection === "up" && xDirection === "right") {
    if (yToPointDirection === "up" && xToPointDirection === "right") {
      return toPointGrad > lineGrad;
    }
    if (yToPointDirection === "down" && xToPointDirection === "left") {
      return toPointGrad < lineGrad;
    }
  }
};

const isLeftOfEdgeDirectional = (
  lineStart: ICoordinates,
  lineEnd: ICoordinates,
  subjectCoordinate: ICoordinates
) => {
  const { yDirection: yDirectionBase, xDirection: xDirectionBase } =
    lineDirection(lineStart, lineEnd);

  const { yDirection: yDirectionPoint, xDirection: xDirectionPoint } =
    lineDirection(lineStart, subjectCoordinate);

  if (xDirectionBase === "vertical") {
    if (xDirectionPoint === "vertical") {
      return false;
    }
    if (yDirectionBase === "down") {
      return subjectCoordinate.x > lineStart.x;
    } else {
      return subjectCoordinate.x < lineStart.x;
    }
  }

  if (yDirectionBase === "horizontal") {
    if (yDirectionPoint === "horizontal") {
      return false;
    }
    if (xDirectionBase === "right") {
      return subjectCoordinate.y < lineStart.y;
    } else {
      return subjectCoordinate.y > lineStart.y;
    }
  }

  if (xDirectionPoint === "vertical") {
    if (xDirectionBase === "left") {
      return subjectCoordinate.y > lineStart.y;
    } else {
      return subjectCoordinate.y < lineStart.y;
    }
  }

  if (yDirectionPoint === "horizontal") {
    if (yDirectionBase === "down") {
      return subjectCoordinate.x > lineStart.x;
    } else {
      return subjectCoordinate.x < lineStart.x;
    }
  }

  return null;
};
