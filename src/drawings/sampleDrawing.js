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
  for (const { loadedImage, x, y } of loadedImages) {
    console.log(loadedImage.width);
    console.log(loadedImage.height);
    ctx.drawImage(loadedImage, 0, 0);
  }
};

const positioningAlgorithm = function (images) {};
