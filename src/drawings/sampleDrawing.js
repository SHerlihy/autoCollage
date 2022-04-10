import { getFulfilled, loadImages } from "./imageLoader";
import screamImg from "../../src/assets/img_the_scream.jpg";

const { getLoadedImages } = loadImages([screamImg]);

export async function drawAllItems(ctx) {
  const loadedImages = await getLoadedImages();
  const successfullyLoaded = getFulfilled(loadedImages);
  const positionedImages = positioningAlgorithm(successfullyLoaded);
  drawLoadedImages(ctx, positionedImages);
}

const drawLoadedImages = function (ctx, loadedImages) {
  for (const { image, x, y } of loadedImages) {
    ctx.drawImage(image, x, y);
  }
};

const gridPositions = (maxDimension) => {
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

const getMaxDimension = (images) => {
  return images.reduce((acc, image) => {
    const { width, height } = image;

    const larger = width > height ? width : height;

    if (larger > acc) {
      acc = larger;
    }

    return acc;
  }, 0);
};

const positioningAlgorithm = function (images) {
  const maxDimension = getMaxDimension(images);

  // const curPositionCo = maxDimension / 2;

  // const imagesDimensions = images.map((image, index) => {
  //   const x = index * maxDimension + curPositionCo;
  //   const y = index * maxDimension + curPositionCo;

  //   console.log(image);

  //   return {
  //     image,
  //     x,
  //     y,
  //   };
  // });

  // return imagesDimensions;

  const positions = gridPositions(maxDimension);

  const imagePositions = positions.map(({ x, y }) => {
    return {
      image: images[0],
      x,
      y,
    };
  });

  return imagePositions;
};
