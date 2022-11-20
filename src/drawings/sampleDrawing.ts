import { ICoordinates } from "../perimeter/pointsTypes";
import {
  getHypotenuseSideFromSides,
  SOHOppositeSideFromDegrees,
} from "../perimeter/trigonometryHelpers";

export interface IPositionedImage {
  image: HTMLImageElement;
  position: ICoordinates;
  rotation?: number;
  thresholdMod?: number;
}

// remember idea of using gradient on perimeter points and an offset to fill after fillCrevices

export const drawLoadedImages = (
  ctx: CanvasRenderingContext2D,
  loadedImages: Array<IPositionedImage>
) => {
  for (const { image, position, rotation = 0 } of loadedImages) {
    const { x, y } = position;
    const { width, height } = image;

    ctx.translate(x, y);

    if (rotation) {
      const rotateRads = rotation * Math.PI;
      ctx.rotate(rotateRads / 180);
    }

    ctx.drawImage(image, -width / 2, -height / 2);

    if (rotation) {
      const counterRads = (360 - rotation) * Math.PI;
      ctx.rotate(counterRads / 180);
    }

    ctx.translate(-x, -y);
  }
};

const gridPositions = (maxDimension: number) => {
  const currentWidth = window.innerWidth;
  const currentHeight = window.innerHeight;

  const columns = currentWidth / maxDimension;
  const rows = currentHeight / maxDimension;

  let x = -currentWidth / 2;
  let y = -currentHeight / 2;

  const positions = [];

  for (let index = 0; index < rows; index++) {
    x = -currentWidth / 2;
    for (let index = 0; index < columns; index++) {
      positions.push({ x, y });
      x = x + maxDimension;
    }
    y = y + maxDimension;
  }

  return positions;
};

const getMaxDimension = (images: Array<HTMLImageElement>) => {
  return images.reduce((acc, image) => {
    const { width, height } = image;

    const larger = width > height ? width : height;

    if (larger > acc) {
      acc = larger;
    }

    return acc;
  }, 0);
};

export const positioningAlgorithm = (
  images: Array<HTMLImageElement>
): Array<IPositionedImage> => {
  const maxDimension = getMaxDimension(images);

  const positions = gridPositions(maxDimension);

  const imagePositions = positions.map(({ x, y }) => {
    return {
      image: images[0],
      position: { x, y },
    };
  });

  return imagePositions;
};
