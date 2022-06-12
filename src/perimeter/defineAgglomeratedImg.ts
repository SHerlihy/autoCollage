import { CreateIds } from "../addImages/createIds";
import { ICoordinates, IPoint, IPointsMap } from "./pointsTypes";

export const defineImgPerimeter = (
  orderedIdArr: string[],
  allPointsMap: IPointsMap
): Map<string, IPoint> => {
  const linkedPointsMap = unaryLinkedMapFromOrderedArr(orderedIdArr);

  const imgPointsMap = imgPointsMapFromPointsMap(linkedPointsMap, allPointsMap);

  return imgPointsMap;
};

const imgPointsMapFromPointsMap = (
  linkedPointsMap: Map<string, string>,
  allPointsMap: IPointsMap
) => {
  const coordinatesMap = new Map<string, ICoordinates>();

  for (const [pointId, pointValue] of allPointsMap) {
    const pointCoordinates = pointValue.coordinates;

    coordinatesMap.set(pointId, pointCoordinates);
  }

  return imgPointsMapFromCoordinates(linkedPointsMap, coordinatesMap);
};

export const imgPointsMapFromCoordinates = (
  linkedPointsMap: Map<string, string>,
  allCoordinatesMap: Map<string, ICoordinates>
) => {
  const imgPointsMap = new Map<string, IPoint>();
  const imgId = CreateIds.getInstance().generateNovelId();

  for (const [curId, nextId] of linkedPointsMap) {
    const coordinates = allCoordinatesMap.get(curId)!;

    const currentImgPoint = {
      imgId,
      nextImgPointId: nextId,
      coordinates,
    };

    imgPointsMap.set(curId, currentImgPoint);
  }

  return imgPointsMap;
};

const unaryLinkedMapFromOrderedArr = (orderedIdArr: string[]) => {
  const lastPointId = orderedIdArr[orderedIdArr.length - 1];

  const lastPointIdWithNext = [lastPointId, orderedIdArr[0]] as [
    string,
    string
  ];

  const precursorArr = orderedIdArr.map((pointId, idx, arr) => {
    return [pointId, arr[idx + 1]] as [string, string];
  });

  precursorArr.pop();
  precursorArr.push(lastPointIdWithNext);

  return new Map(precursorArr);
};
