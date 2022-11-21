import { IPointsMap } from "../perimeter/pointsTypes";
import {
  AngleType,
  determinePointTypes,
  ITypedPoint,
} from "./determinePointTypes";

export interface IEdgeType {
  from: AngleType;
  to: AngleType;
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

    const nextEdge = from.currentImgPointId + to.currentImgPointId;

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
