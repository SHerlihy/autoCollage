import { CreateIds } from "../addImages/createIds";
import { IPoint, IPointsMap } from "./pointsTypes";

export const defineImgPerimeter = (orderedIdArr: string[], allPointsMap: IPointsMap) =>{
  const linkedPointsMap = unaryLinkedMapFromOrderedArr(orderedIdArr);

  const imgPointsMap = generateImgPointsMap(linkedPointsMap, allPointsMap);

  return imgPointsMap;
}

const generateImgPointsMap = (linkedPointsMap: Map<string, string>, allPointsMap: IPointsMap) =>{
  const imgPointsMap = new Map<string, IPoint>();
  const imgId = CreateIds.getInstance().generateNovelId();

  for (const [curId, nextId] of linkedPointsMap) {
  const currentPoint = allPointsMap.get(curId);

  const currentImgPoint = {
    imgId,
    nextImgPointId: nextId,
    coordinates: currentPoint!.coordinates
  }

    imgPointsMap.set(curId, currentImgPoint)
  }

  return imgPointsMap;
}

const unaryLinkedMapFromOrderedArr = (orderedIdArr: string[]) =>{
  const lastPointId = orderedIdArr[orderedIdArr.length-1]

  const lastPointIdWithNext = [lastPointId, orderedIdArr[0]] as [string, string];

  const precursorArr = orderedIdArr.map((pointId, idx, arr)=>{
    return [pointId, arr[idx+1]] as [string, string]
  })

  precursorArr.pop();
  precursorArr.push(lastPointIdWithNext);

  return new Map(precursorArr);
}