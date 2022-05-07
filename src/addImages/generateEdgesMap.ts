import { IPoint, IPointsMap } from "../perimeter/pointsTypes";
import { angleFromCoordinates } from "../perimeter/triganomitryHelpers";
import { CreateIds } from "./createIds";

export type EdgeType = "crevice" | "leftAcute" | "rightAcute" | "bothAcute" | 'bothObtuse';

type EdgeId = string

interface IEdgePrecursor {
    prevPoint: IPoint;
    nextPoint: IPoint;
    coordinates: {
        from: IPoint;
        to: IPoint;
    };
    nextEdge: EdgeId;
    type?: EdgeType;
}

interface IEdgePreTyped extends Omit<IEdgePrecursor, 'prevPoint'| 'nextPoint'> {
  prevPoint?: IPoint;
  nextPoint?: IPoint;
}

export interface IEdge extends Omit<IEdgePrecursor, 'prevPoint' | 'nextPoint' | 'type'> {
  type: EdgeType;
}

export interface IEdgesMap extends Map<EdgeId, IEdge> {};

export const generateEdgesMap = (perimeterPoints: IPointsMap): IEdgesMap => {
  const freshEdgesArray = generateEdgesArray(perimeterPoints);

  const typedEdgesArray = determineEdgeTypes(freshEdgesArray);

  const edgesMap = deriveEdgesMapFromArray(typedEdgesArray);

  return edgesMap;
}

const determineEdgeTypes = (freshEdgesArray: IEdgePrecursor[]): IEdge[] =>{
  return freshEdgesArray.map((freshEdge)=>{
    const {prevPoint, nextPoint} = freshEdge;
    const {from, to} = freshEdge.coordinates;

    const isCrevice = determineEdgeType(prevPoint, from, to, nextPoint);

    const typedEdge: IEdgePreTyped = {...freshEdge}

    delete typedEdge.prevPoint;
    delete typedEdge.nextPoint;

    if(isCrevice){
      typedEdge['type'] = 'crevice';
      return typedEdge as IEdge;
    };

    const angledEdge = determineEdgeAngles(freshEdge);

    return angledEdge;
  })
}

const generateEdgesArray = (perimeterPoints: IPointsMap): IEdgePrecursor[] => {
  const edgesArr = [];
  debugger;
  for (const [key, value] of perimeterPoints.entries()) {
    const prevPoint = value;
    const from = perimeterPoints.get(value.nextImgPointId);
    const to = perimeterPoints.get(from!.nextImgPointId);
    const nextPoint = perimeterPoints.get(to!.nextImgPointId);

    if(!from || !to || !nextPoint){
      throw Error('Perimeter point without proceeding point in generateEdgesArray')
    }

    const nextEdge = CreateIds.getInstance().generateNovelId();

    const perimeterEdge = {
      prevPoint,
      nextPoint,
      coordinates:
      {
        from,
        to,
      },
      nextEdge,
    }

    edgesArr.push(perimeterEdge);
  }

  return edgesArr;
}

const deriveEdgesMapFromArray = (edgesArr: IEdge[]): IEdgesMap => {
  const edgesMap = new Map<EdgeId, IEdge>();

  edgesArr.forEach((edge, idx, arr) => {
    if(idx === 0){
      const currentId = arr[arr.length-1].nextEdge;
      edgesMap.set(currentId, edge)
    } else {
    const currentId = arr[idx - 1].nextEdge;
    edgesMap.set(currentId, edge)
    }
  })
return edgesMap;
}

const determineAcuteness = (angleFrom: number, angleTo: number) =>{
  if(angleFrom < 90 && angleTo < 90){
    return 'bothAcute'
  }

  if(angleFrom < 90 && angleTo > 90){
    return 'leftAcute'
  }

  if(angleFrom > 90 && angleTo < 90){
    return 'rightAcute'
  }

  return 'bothObtuse'
}

const determineEdgeAngles = (creviceEdge: IEdgePrecursor) =>{
    const {prevPoint, nextPoint} = creviceEdge;
    const {from, to} = creviceEdge.coordinates;

    const angleFrom = angleFromCoordinates(prevPoint.coordinates, from.coordinates, to.coordinates);

    const angleTo = angleFromCoordinates(from.coordinates, to.coordinates, nextPoint.coordinates);

    const acuteness = determineAcuteness(angleFrom, angleTo);

    creviceEdge['type'] = acuteness;

    return creviceEdge as Required<IEdgePrecursor>;
}

const determineEdgeType = (prevPoint: IPoint, startPoint: IPoint, endPoint: IPoint, nextPoint: IPoint) =>{
  const startSide = determinePointSideOfLine(prevPoint, nextPoint, startPoint);
  const endSide = determinePointSideOfLine(prevPoint, nextPoint, endPoint);

  if(startSide<0){
    if(endSide<0){
      return true
    }
    if(endSide>0){
      return false
    }
  }

  if(startSide>0){
    if(endSide>0){
      return true
    }
    if(endSide<0){
      return false
    }
  }
}

const determinePointSideOfLine = (lineStart: IPoint, lineEnd: IPoint, point: IPoint) => {
  const resolveX = (lineStart.coordinates.x - point.coordinates.x)*(lineEnd.coordinates.y-point.coordinates.y)
  const resolveY = (lineStart.coordinates.y-point.coordinates.y)*(lineEnd.coordinates.x-point.coordinates.x)

  return resolveX-resolveY
}

