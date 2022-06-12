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

type EdgeId = string;

interface IEdgePrecursor {
  prevPoint: IPoint;
  nextPoint: IPoint;
  points: {
    from: IPoint;
    to: IPoint;
  };
  nextEdge: EdgeId;
  type?: IEdgeType;
}

interface IEdgePreTyped
  extends Omit<IEdgePrecursor, "prevPoint" | "nextPoint"> {
  prevPoint?: IPoint;
  nextPoint?: IPoint;
}

export interface IEdge
  extends Omit<IEdgePrecursor, "prevPoint" | "nextPoint" | "type"> {
  type: IEdgeType;
}

export interface IEdgesMap extends Map<EdgeId, IEdge> {}

export const generateEdgesMap = (perimeterPoints: IPointsMap): IEdgesMap => {
  const freshEdgesArray = generateEdgesArray(perimeterPoints);

  const typedEdgesArray = determineEdgeTypes(freshEdgesArray);

  const edgesMap = deriveEdgesMapFromArray(typedEdgesArray);

  return edgesMap;
};

const determineEdgeTypes = (freshEdgesArray: IEdgePrecursor[]): IEdge[] => {
  return freshEdgesArray.map((freshEdge) => {
    const { prevPoint, nextPoint } = freshEdge;
    const { from, to } = freshEdge.points;

    const isCrevice = determineIsCrevice(prevPoint, from, to, nextPoint);

    const typedEdge: IEdgePreTyped = { ...freshEdge };

    delete typedEdge.prevPoint;
    delete typedEdge.nextPoint;

    if (isCrevice) {
      typedEdge["type"] = { from: "crevice", to: "crevice" };
      return typedEdge as IEdge;
    }

    const angledEdge = determineEdgeAngles(freshEdge);

    return angledEdge;
  });
};

const generateEdgesArray = (perimeterPoints: IPointsMap): IEdgePrecursor[] => {
  const edgesArr = [];

  for (const [key, value] of perimeterPoints.entries()) {
    const prevPoint = value;
    const from = perimeterPoints.get(value.nextImgPointId);
    const to = perimeterPoints.get(from!.nextImgPointId);
    const nextPoint = perimeterPoints.get(to!.nextImgPointId);

    if (!from || !to || !nextPoint) {
      throw Error(
        "Perimeter point without proceeding point in generateEdgesArray"
      );
    }

    const nextEdge = CreateIds.getInstance().generateNovelId();

    const perimeterEdge = {
      prevPoint,
      nextPoint,
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

const determineEdgeAngles = (creviceEdge: IEdgePrecursor) => {
  const { prevPoint, nextPoint } = creviceEdge;
  const { from, to } = creviceEdge.points;

  const angleFrom = radiansToDegrees(
    radiansFromCoordinates(
      prevPoint.coordinates,
      from.coordinates,
      to.coordinates
    )
  );

  const angleTo = radiansToDegrees(
    radiansFromCoordinates(
      from.coordinates,
      to.coordinates,
      nextPoint.coordinates
    )
  );

  const fromType = classifyAngle(angleFrom);
  const toType = classifyAngle(angleTo);

  creviceEdge["type"] = { from: fromType, to: toType };

  return creviceEdge as Required<IEdgePrecursor>;
};

const determineIsCrevice = (
  prevPoint: IPoint,
  startPoint: IPoint,
  endPoint: IPoint,
  nextPoint: IPoint
) => {
  const startSide = determinePointSideOfLine(prevPoint, nextPoint, startPoint);
  const endSide = determinePointSideOfLine(prevPoint, nextPoint, endPoint);

  // negative is outside
  if (startSide > 0 || endSide > 0) {
    return true;
  }

  return false;
};

const determinePointSideOfLine = (
  lineStart: IPoint,
  lineEnd: IPoint,
  point: IPoint
) => {
  const resolveX =
    (lineStart.coordinates.x - point.coordinates.x) *
    (lineEnd.coordinates.y - point.coordinates.y);
  const resolveY =
    (lineStart.coordinates.y - point.coordinates.y) *
    (lineEnd.coordinates.x - point.coordinates.x);

  return resolveX - resolveY;
};

// @ts-ignore
export const stubGenerateEdgesMap;

// @ts-ignore
if (window.Cypress) {
  // @ts-ignore
  stubGenerateEdgesMap = (stub: (perimeterPoints: IPointsMap) => IEdgesMap) => {
    // @ts-ignore
    generateEdgesMap = stub;
  };
}
