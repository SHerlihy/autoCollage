import { CreateIds } from "../addImages/createIds";
import {
  determineCoordinatesAlongLine,
  lineDirection,
} from "../addImages/shapeHelpers";
import { IPositionedImage } from "../drawings/sampleDrawing";
import { ICoordinates, IPoint, IPointsMap } from "./pointsTypes";
import {
  getDegreesFromNonHypotenuseSides,
  SOHOppositeSideFromDegrees,
} from "./trigonometryHelpers";

export interface IPrecursorIPoint {
  coordinates: ICoordinates;
  id?: any;
}

export interface IPrecursorDummyIPoint {
  id: string;
  coordinates: ICoordinates;
}

export const coordinatesToPoint = (
  coordinates: ICoordinates,
  imgId: string,
  currentImgPointId: string,
  nextImgPointId: string
) => {
  return {
    imgId,
    currentImgPointId,
    nextImgPointId,
    coordinates,
  } as IPoint;
};

export const getOrderedPerimeterPointIds = (
  startId: string,
  perimeterPoints: IPointsMap,
  endId?: string
) => {
  const idsArray = [startId];

  const conga = (currentId: string, lineArr: string[]) => {
    const currentPoint = perimeterPoints.get(currentId);

    const nextPointId = currentPoint!.nextImgPointId;

    if (nextPointId === startId) {
      return;
    }

    lineArr.push(nextPointId);

    if (endId && endId === nextPointId) {
      return;
    }

    conga(nextPointId, lineArr);
  };

  conga(startId, idsArray);

  return idsArray;
};

const generateDummyPointPrecursors = (coordinates: ICoordinates[]) => {
  const dummyPointIds = coordinates.map(() => {
    return Math.random().toString();
  });

  const dummyPointPrecursors = coordinates.map((currentCoordinates, idx) => {
    return {
      id: dummyPointIds[idx],
      coordinates: currentCoordinates,
    };
  });

  return dummyPointPrecursors;
};

const dummyPrecursorsToPoints = (precursors: Array<IPrecursorDummyIPoint>) => {
  const dummyArray = precursors.map(({ id, coordinates }) => {
    return [
      id,
      coordinatesToPoint(coordinates, "001", id, Math.random().toString()),
    ] as readonly [string, IPoint];
  });

  return new Map([...dummyArray]);
};

export const coordinatesToDummyPoints = (coordinates: ICoordinates[]) => {
  const precursors = generateDummyPointPrecursors(coordinates);

  return dummyPrecursorsToPoints(precursors);
};

export const pointPrecursorArrToLinkedPointsMap = (
  precursors: IPrecursorIPoint[],
  imgId = "001"
): IPointsMap => {
  const randomIds = precursors.map(() => {
    return Math.random().toString();
  });

  const linkedPointsArr = precursors.map(({ coordinates, id }, idx, arr) => {
    const nextIdx = arr.length - 1 === idx ? 0 : idx + 1;
    const nextId = arr[nextIdx].id || randomIds[nextIdx];

    const currentId = id ? id : randomIds[idx];

    return [
      currentId,
      coordinatesToPoint(coordinates, imgId, currentId, nextId),
    ] as readonly [string, IPoint];
  });

  return new Map([...linkedPointsArr]);
};

export const coordinatesArrToLinkedPointsMap = (
  coordinatesArr: ICoordinates[]
) => {
  const precursorArr = coordinatesArr.map(({ x, y }) => {
    return { coordinates: { x, y } };
  });

  return pointPrecursorArrToLinkedPointsMap(precursorArr);
};

export const determineTopPointId = (points: IPointsMap) => {
  const topPoint = [...points.entries()].reduce((topId, [curId, curVal]) => {
    const topVal = points.get(topId) || null;

    if (topVal === null || curVal.coordinates.y < topVal.coordinates.y) {
      topId = curId;
    }

    return topId;
  }, "");

  return topPoint;
};
export const determineRightPointId = (points: IPointsMap) => {
  const rightPoint = [...points.entries()].reduce(
    (rightId, [curId, curVal]) => {
      const rightVal = points.get(rightId) || null;

      if (rightVal === null || curVal.coordinates.x > rightVal.coordinates.x) {
        rightId = curId;
      }

      return rightId;
    },
    ""
  );

  return rightPoint;
};
export const determineLowPointId = (points: IPointsMap) => {
  const lowPoint = [...points.entries()].reduce((lowId, [curId, curVal]) => {
    const lowVal = points.get(lowId) || null;

    if (lowVal === null || curVal.coordinates.y > lowVal.coordinates.y) {
      lowId = curId;
    }

    return lowId;
  }, "");

  return lowPoint;
};
export const determineLeftPointId = (points: IPointsMap) => {
  const leftPoint = [...points.entries()].reduce((leftId, [curId, curVal]) => {
    const leftVal = points.get(leftId) || null;

    if (leftVal === null || curVal.coordinates.x < leftVal.coordinates.x) {
      leftId = curId;
    }

    return leftId;
  }, "");

  return leftPoint;
};

export const determineCardinalPoints = (points: IPointsMap) => {
  const otherPoints = new Map(points);

  const topPoint = determineTopPointId(otherPoints);
  otherPoints.delete(topPoint);

  const rightPoint = determineRightPointId(otherPoints);
  otherPoints.delete(rightPoint);

  const lowPoint = determineLowPointId(otherPoints);
  otherPoints.delete(lowPoint);

  const leftPoint = determineLeftPointId(otherPoints);
  otherPoints.delete(leftPoint);

  return [topPoint, rightPoint, lowPoint, leftPoint];
};

export const imagesToPointsMap = (positionedImagesArr: IPositionedImage[]) => {
  const allImagePointsMap = positionedImagesArr.reduce(
    (acc, { image, position }) => {
      const { x, y } = position;
      const { width, height } = image;

      const tlCo = { x, y };
      const trCo = { x: x + width, y };
      const brCo = { x: x + width, y: y + height };
      const blCo = { x, y: y + height };

      const tlId = CreateIds.getInstance().generateNovelId();
      const trId = CreateIds.getInstance().generateNovelId();
      const brId = CreateIds.getInstance().generateNovelId();
      const blId = CreateIds.getInstance().generateNovelId();

      const imgId = CreateIds.getInstance().generateNovelId();

      const tlPoint = {
        imgId,
        currentImgPointId: tlId,
        nextImgPointId: trId,
        coordinates: tlCo,
      };

      const trPoint = {
        imgId,
        currentImgPointId: trId,
        nextImgPointId: brId,
        coordinates: trCo,
      };

      const brPoint = {
        imgId,
        currentImgPointId: brId,
        nextImgPointId: blId,
        coordinates: brCo,
      };

      const blPoint = {
        imgId,
        currentImgPointId: blId,
        nextImgPointId: tlId,
        coordinates: blCo,
      };

      acc.set(tlId, tlPoint);
      acc.set(trId, trPoint);
      acc.set(brId, brPoint);
      acc.set(blId, blPoint);

      return acc;
    },
    new Map<string, IPoint>()
  );

  return allImagePointsMap;
};

//will need more work
//consider directionality
export const calculatePerpendicular = (
  from: ICoordinates,
  to: ICoordinates,
  along: number,
  away: number
) => {
  // find along coordinate
  const alongCoordiante = determineCoordinatesAlongLine(from, to, along);

  const ogGradient = (to.y - from.y) / (to.x - from.x);

  const perpendicularGradient = -1 / ogGradient;

  const xAngle = getDegreesFromNonHypotenuseSides(1, 1 * perpendicularGradient);
  const yAngle = 90 - xAngle;

  const yLength = SOHOppositeSideFromDegrees(away, xAngle);
  const xLength = SOHOppositeSideFromDegrees(away, yAngle);

  const ogDirection = lineDirection(from, to);

  const xChange = ogDirection.yDirection === "down" ? xLength : -xLength;
  const yChange = ogDirection.xDirection === "right" ? -yLength : yLength;

  if (ogDirection.xDirection === "vertical") {
    return {
      x: alongCoordiante.x + xChange,
      y: alongCoordiante.y,
    };
  }

  if (ogDirection.yDirection === "horizontal") {
    return {
      x: alongCoordiante.x,
      y: alongCoordiante.y + yChange,
    };
  }

  return {
    x: alongCoordiante.x + xChange,
    y: alongCoordiante.y + yChange,
  };
};
