import { ICoordinates, IPoint, IPointsMap } from "./pointsTypes";

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

export const coordinatesArrToLinkedPointsMap = (
  precursors: IPrecursorIPoint[]
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
      coordinatesToPoint(coordinates, "001", currentId, nextId),
    ] as readonly [string, IPoint];
  });

  return new Map([...linkedPointsArr]);
};
