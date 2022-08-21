import { ICoordinates, IPoint, IPointsMap } from "../perimeter/pointsTypes";
import {
  radiansFromCoordinates,
  radiansToDegrees,
} from "../perimeter/triganomitryHelpers";
import { CreateIds } from "./createIds";

export interface IEdgeType {
  from: AngleType;
  to: AngleType;
}

export type AngleType = "crevice" | "acute" | "obtuse" | "right";

export interface ITypedPoint extends IPoint {
  type: AngleType;
}

interface ITypedPointsMap extends Map<string, ITypedPoint> {}

type EdgeId = string;

export interface IEdge {
  points: {
    from: ITypedPoint;
    to: ITypedPoint;
  };
  nextEdge: EdgeId;
}

export interface IEdgesMap extends Map<EdgeId, IEdge> {}

export const generateEdgesMap = (perimeterPoints: IPointsMap): IEdgesMap => {
  const typedPointsMap = determinePointTypes(perimeterPoints);

  const perimeterPointsArr = [...typedPointsMap.entries()];
  const finalEntry = perimeterPointsArr.pop()!;
  perimeterPointsArr.unshift(finalEntry);

  const freshEdgesArray = generateEdgesArray(new Map(perimeterPointsArr));

  const edgesMap = deriveEdgesMapFromArray(freshEdgesArray);

  return edgesMap;
};

const determinePointTypes = (pointsMap: IPointsMap) => {
  const typedPointsMap = new Map<string, ITypedPoint>();
  const creviceIds = new Array<string>();

  const [initKey, initPoint] = [...pointsMap.entries()][0];

  const doTheThing = (key: string, point: IPoint): string => {
    const prevPoint = point;
    const fromPoint = pointsMap.get(prevPoint.nextImgPointId)!;
    const toPoint = pointsMap.get(fromPoint.nextImgPointId)!;

    if (creviceIds.some((crevId) => crevId === key)) {
      return prevPoint.nextImgPointId;
    }

    const handlePotentialCrevice = (
      prevPoint: IPoint,
      fromPoint: IPoint,
      toPoint: IPoint,
      theId?: string
    ): string => {
      const isCrevice = !isCoordinateOutside(
        prevPoint.coordinates,
        toPoint.coordinates,
        fromPoint.coordinates,
        20
      );

      const typedPoint: Partial<ITypedPoint> & Omit<ITypedPoint, "type"> = {
        ...fromPoint,
      };

      if (isCrevice) {
        typedPoint["type"] = "crevice";
        typedPointsMap.set(
          theId || prevPoint.nextImgPointId,
          typedPoint as ITypedPoint
        );
        creviceIds.push(theId || prevPoint.nextImgPointId);

        return handlePotentialCrevice(
          prevPoint,
          toPoint,
          pointsMap.get(toPoint.nextImgPointId)!,
          fromPoint.nextImgPointId
        );
      } else {
        const angleType = determineEdgeAnglesFromPoints(
          prevPoint,
          fromPoint,
          toPoint
        );

        typedPoint["type"] = angleType;
        typedPointsMap.set(
          theId || prevPoint.nextImgPointId,
          typedPoint as ITypedPoint
        );
        return prevPoint.nextImgPointId;
      }
    };

    const newPoint = handlePotentialCrevice(prevPoint, fromPoint, toPoint);

    return newPoint;
  };

  let thingPoint = doTheThing(initKey, initPoint)!;

  while (thingPoint !== initKey) {
    const thingValue = pointsMap.get(thingPoint)!;
    thingPoint = doTheThing(thingPoint, thingValue)!;
  }

  return typedPointsMap;
};

const generateEdgesArray = (perimeterPoints: ITypedPointsMap): IEdge[] => {
  const edgesArr = [];

  for (const value of perimeterPoints.values()) {
    const from = value;
    const to = perimeterPoints.get(from!.nextImgPointId);

    if (!from || !to) {
      throw Error(
        "Perimeter point without proceeding point in generateEdgesArray"
      );
    }

    const nextEdge = CreateIds.getInstance().generateNovelId();

    const perimeterEdge = {
      points: {
        from,
        to,
      },
      nextEdge,
    };

    edgesArr.push(perimeterEdge);
  }

  return edgesArr;
};

const deriveEdgesMapFromArray = (edgesArr: IEdge[]): IEdgesMap => {
  const edgesMap = new Map<EdgeId, IEdge>();

  edgesArr.forEach((edge, idx, arr) => {
    if (idx === 0) {
      const currentId = arr[arr.length - 1].nextEdge;
      edgesMap.set(currentId, edge);
    } else {
      const currentId = arr[idx - 1].nextEdge;
      edgesMap.set(currentId, edge);
    }
  });
  return edgesMap;
};

const classifyAngle = (angle: number) => {
  const roundedAngle = Math.round(angle);
  if (roundedAngle < 90) {
    return "acute";
  }
  if (roundedAngle > 90) {
    return "obtuse";
  }
  return "right";
};

const determineEdgeAnglesFromPoints = (
  prevPoint: IPoint,
  fromPoint: IPoint,
  toPoint: IPoint
) => {
  const angleFrom = radiansToDegrees(
    radiansFromCoordinates(
      prevPoint.coordinates,
      fromPoint.coordinates,
      toPoint.coordinates
    )
  );

  const fromType = classifyAngle(angleFrom);

  return fromType;
};

export const isCoordinateOutside = (
  lineStart: ICoordinates,
  lineEnd: ICoordinates,
  subjectCoordinate: ICoordinates,
  creviceThreshold: number
) => {
  const directionalOutside = isDirectionalOutside(
    lineStart,
    lineEnd,
    subjectCoordinate
  );

  if (directionalOutside !== null) {
    return directionalOutside;
  }

  const gradientOutside = isGradientOutside(
    lineStart,
    lineEnd,
    subjectCoordinate,
    creviceThreshold
  );

  return gradientOutside;
};

const isGradientOutside = (
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

  const lineGrad = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
  const toPointGrad =
    (subjectCoordinate.y - lineStart.y) / (subjectCoordinate.x - lineStart.x);

  const yComparison = lineGrad * 50 - toPointGrad * 50;

  if (Math.abs(yComparison) < creviceThreshold) {
    return true;
  }

  if (yDirection === "down" && xDirection === "right") {
    if (yToPointDirection === "down" && xToPointDirection === "right") {
      return toPointGrad < lineGrad;
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
      return toPointGrad < lineGrad;
    }
    if (yToPointDirection === "down" && xToPointDirection === "right") {
      return toPointGrad > lineGrad;
    }
  }

  if (yDirection === "up" && xDirection === "right") {
    if (yToPointDirection === "up" && xToPointDirection === "right") {
      return toPointGrad < lineGrad;
    }
    if (yToPointDirection === "down" && xToPointDirection === "left") {
      return toPointGrad > lineGrad;
    }
  }
};

const isDirectionalOutside = (
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
      return true;
    }
    if (yDirectionBase === "down") {
      return subjectCoordinate.x > lineStart.x;
    } else {
      return subjectCoordinate.x < lineStart.x;
    }
  }

  if (yDirectionBase === "horizontal") {
    if (yDirectionPoint === "horizontal") {
      return true;
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

export const lineDirection = (
  lineStartCoordinates: ICoordinates,
  lineEndCoordinates: ICoordinates
) => {
  const horizontal = lineStartCoordinates.y === lineEndCoordinates.y;
  const vertical = lineStartCoordinates.x === lineEndCoordinates.x;

  const goingDown =
    lineStartCoordinates.y < lineEndCoordinates.y ? "down" : "up";
  const goingRight =
    lineStartCoordinates.x < lineEndCoordinates.x ? "right" : "left";

  return {
    yDirection: horizontal ? "horizontal" : goingDown,
    xDirection: vertical ? "vertical" : goingRight,
  };
};

const lineGradient = (
  lineStartCoordinates: ICoordinates,
  lineEndCoordinates: ICoordinates,
  pointCoordinates: ICoordinates
) => {
  const lineGrad =
    (lineEndCoordinates.y - lineStartCoordinates.y) /
    (lineEndCoordinates.x - lineStartCoordinates.x);
  const toPointGrad =
    (pointCoordinates.y - lineStartCoordinates.y) /
    (pointCoordinates.x - lineStartCoordinates.x);
};
