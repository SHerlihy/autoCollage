import { IPoint, IPointsMap } from "../perimeter/pointsTypes";
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

  for (const [key, point] of pointsMap) {
    const prevPoint = point;
    const fromPoint = pointsMap.get(prevPoint.nextImgPointId)!;
    const toPoint = pointsMap.get(fromPoint.nextImgPointId)!;
    const nextPoint = pointsMap.get(toPoint.nextImgPointId)!;

    const isCrevice = determineIsCrevice(
      prevPoint,
      fromPoint,
      toPoint,
      nextPoint
    );

    const typedPoint: Partial<ITypedPoint> & Omit<ITypedPoint, "type"> = {
      ...fromPoint,
    };

    if (isCrevice) {
      typedPoint["type"] = "crevice";
      typedPointsMap.set(prevPoint.nextImgPointId, typedPoint as ITypedPoint);
    } else {
      const angleType = determineEdgeAnglesFromPoints(
        prevPoint,
        fromPoint,
        toPoint
      );

      typedPoint["type"] = angleType;
      typedPointsMap.set(prevPoint.nextImgPointId, typedPoint as ITypedPoint);
    }
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

const determineIsCrevice = (
  prevPoint: IPoint,
  startPoint: IPoint,
  endPoint: IPoint,
  nextPoint: IPoint
) => {
  const startSide = isPointOutside(prevPoint, nextPoint, startPoint);
  const endSide = isPointOutside(prevPoint, nextPoint, endPoint);

  if (!startSide || !endSide) {
    return true;
  }

  return false;
};

const isPointOutside = (lineStart: IPoint, lineEnd: IPoint, point: IPoint) => {
  const goingDown = lineStart.coordinates.y < lineEnd.coordinates.y;
  const goingRight = lineStart.coordinates.x < lineEnd.coordinates.x;

  if (lineEnd.coordinates.x === lineStart.coordinates.x) {
    if (point.coordinates.x === lineStart.coordinates.x) {
      return true;
    }
    if (goingDown) {
      return point.coordinates.x > lineStart.coordinates.x;
    } else {
      return point.coordinates.x < lineStart.coordinates.x;
    }
  }

  if (lineEnd.coordinates.y === lineStart.coordinates.y) {
    if (point.coordinates.y === lineStart.coordinates.y) {
      return true;
    }
    if (goingRight) {
      return point.coordinates.y < lineStart.coordinates.y;
    } else {
      return point.coordinates.y > lineStart.coordinates.y;
    }
  }

  const lineGrad =
    (lineEnd.coordinates.y - lineStart.coordinates.y) /
    (lineEnd.coordinates.x - lineStart.coordinates.x);
  const toPointGrad =
    (point.coordinates.y - lineStart.coordinates.y) /
    (point.coordinates.x - lineStart.coordinates.x);

  if (goingDown && goingRight) {
    return toPointGrad < lineGrad;
  }

  if (goingDown && !goingRight) {
    return toPointGrad > lineGrad;
  }

  if (!goingDown && !goingRight) {
    return toPointGrad > lineGrad;
  }

  if (!goingDown && goingRight) {
    return toPointGrad < lineGrad;
  }
};
