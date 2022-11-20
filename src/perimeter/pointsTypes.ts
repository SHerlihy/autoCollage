export interface ICoordinates {
  x: number;
  y: number;
}

export interface IPoint {
  imgId: string;
  currentImgPointId: string;
  nextImgPointId: string;
  coordinates: ICoordinates;
  thresholdMod?: number;
}

export interface IPointsMap extends Map<string, IPoint> {}
