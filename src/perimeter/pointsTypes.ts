export interface ICoordinates {
  x: number;
  y: number;
}

export interface IPoint {
  imgId: string;
  currentImgPointId: string;
  nextImgPointId: string;
  coordinates: ICoordinates;
}

export interface IPointsMap extends Map<string, IPoint> {}
