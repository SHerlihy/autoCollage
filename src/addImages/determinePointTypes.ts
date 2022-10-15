import { determineCoordinatesOnEdge } from "../perimeter/determineCoordinatesOnEdge";
import { isCoordinateLeftOfEdge } from "../perimeter/determineLeftSideCoordinates";
import { IPoint, IPointsMap } from "../perimeter/pointsTypes";
import {
  radiansFromCoordinates,
  radiansToDegrees,
} from "../perimeter/trigonometryHelpers";

export type AngleType = "crevice" | "acute" | "obtuse" | "right";

export interface ITypedPoint extends IPoint {
  type: AngleType;
}

export const determinePointTypes = (pointsMap: IPointsMap) => {
  const typedPointsMap = new Map<string, ITypedPoint>();

  let startId = [...pointsMap.keys()][0];

  for (const [prevId, prevPoint] of pointsMap) {
    const startPoint = pointsMap.get(startId)!;
    const subjectPoint = pointsMap.get(prevPoint.nextImgPointId)!;
    const endPoint = pointsMap.get(subjectPoint.nextImgPointId)!;

    const typedPoint: Partial<ITypedPoint> & Omit<ITypedPoint, "type"> = {
      ...subjectPoint,
    };

    const isCrevice = identifyCrevice(startPoint, subjectPoint, endPoint);

    if (isCrevice) {
      typedPoint["type"] = "crevice";

      typedPointsMap.set(
        typedPoint.currentImgPointId,
        typedPoint as ITypedPoint
      );

      continue;
    }

    startId = subjectPoint.currentImgPointId;

    const currentAngle = determineEdgeAnglesFromPoints(
      startPoint,
      subjectPoint,
      endPoint
    );

    typedPoint["type"] = currentAngle;

    typedPointsMap.set(typedPoint.currentImgPointId, typedPoint as ITypedPoint);
  }

  return typedPointsMap;
};

const identifyCrevice = (
  prevPoint: IPoint,
  fromPoint: IPoint,
  toPoint: IPoint
) => {
  const inLineWithPoints = determineCoordinatesOnEdge(
    new Set([fromPoint.currentImgPointId]),
    new Map([[fromPoint.currentImgPointId, fromPoint]]),
    prevPoint.coordinates,
    toPoint.coordinates
  );
  const rightOfPoints = !isCoordinateLeftOfEdge(
    prevPoint.coordinates,
    toPoint.coordinates,
    fromPoint.coordinates,
    20
  );
  const isCrevice = !inLineWithPoints && rightOfPoints;

  return isCrevice;
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
