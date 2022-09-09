import { ICoordinates, IPoint } from "./perimeter/pointsTypes";

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

export const createImgPerimeterFromOrderedCoordinates = (
  imgId: string,
  pointCoordinates: ICoordinates[]
) => {
  const imgPerimeter = imgPerimeterFromOrderedArr(imgId, pointCoordinates);

  const pointsArr = pointCoordinates.map((coordinates, index) => {
    return {
      imgId,
      nextImgPointId: `${index + 1}`,
      coordinates,
    } as IPoint;
  });

  const lastPoint = pointsArr.pop();

  pointsArr.push({
    imgId: `${imgId}`,
    nextImgPointId: "0",
    coordinates: lastPoint!.coordinates,
  } as IPoint);

  return {
    imgPerimeter,
  };
};

const imgPerimeterFromOrderedArr = (
  imgId: string,
  pointCoordinates: ICoordinates[]
): Map<string, IPoint> => {
  const imagePerimeterArr = pointCoordinates.map((coordinate, idx) => {
    return [
      `${idx}`,
      {
        imgId,
        currentImgPointId: `${idx}`,
        nextImgPointId: `${idx + 1}`,
        coordinates: coordinate,
      },
    ] as readonly [string, IPoint];
  });

  imagePerimeterArr.pop();
  imagePerimeterArr.push([
    `${pointCoordinates.length - 1}`,
    {
      imgId,
      currentImgPointId: `${pointCoordinates.length - 1}`,
      nextImgPointId: `${0}`,
      coordinates: pointCoordinates[pointCoordinates.length - 1],
    },
  ]);

  return new Map(imagePerimeterArr);
};
