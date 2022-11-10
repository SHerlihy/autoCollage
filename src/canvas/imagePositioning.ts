import { CreateIds } from "../addImages/createIds";
import { loadedImagesClosure } from "../drawings/imageLoader";
import { drawLoadedImages, IPositionedImage } from "../drawings/sampleDrawing";
import { imagesToPointsMap } from "../perimeter/pointsHelper";
import { IPoint } from "../perimeter/pointsTypes";

// @ts-ignore
import screamImg from "../../src/assets/img_the_scream.jpg";

export const positionImagesClosure = () => {
  const { getLoadedImages, loadNewImages } = loadedImagesClosure();

  let allPositionedImages: Map<string, IPositionedImage> = new Map();
  let allImagePoints: Map<string, IPoint> = new Map();
  let canvasContext: CanvasRenderingContext2D;

  const handleAddPositionedImages = async (
    additionalPositionedImages: Array<IPositionedImage>
  ) => {
    const loadedImages = getLoadedImages();

    for (const additionalPositionedImage of additionalPositionedImages) {
      const isLoaded = loadedImages?.get(
        additionalPositionedImage.image.src.replace(window.location.origin, "")
      );

      if (isLoaded === undefined) {
        await loadNewImages([additionalPositionedImage.image.src]);
      }

      allPositionedImages.set(
        CreateIds.getInstance().generateNovelId(),
        additionalPositionedImage
      );

      const currentImagePoints = imagesToPointsMap([additionalPositionedImage]);

      for (const [currentPointId, currentPointValue] of currentImagePoints) {
        allImagePoints.set(currentPointId, currentPointValue);
      }
    }

    handleDrawAllItems();
  };

  const handleAddInitialItems = async () => {
    await loadNewImages([screamImg]);

    const loadedImages = getLoadedImages()!;

    const startImg = [...loadedImages.values()][0];

    const forkHandle = { image: startImg, position: { x: 0, y: 0 } };
    const prongLeft = {
      image: startImg,
      position: { x: -startImg.width / 2, y: -startImg.height },
    };
    const prongRight = {
      image: startImg,
      position: { x: startImg.width / 1.5, y: -startImg.height },
    };

    handleAddPositionedImages([forkHandle, prongLeft, prongRight]);
  };

  const handleDrawAllItems = () => {
    let positionedImagesArr = [...allPositionedImages.values()];

    if (canvasContext) {
      drawLoadedImages(canvasContext, positionedImagesArr);
    }
  };

  const getPositionedImages = () => {
    return [...allPositionedImages.values()];
  };

  const getAllImagePoints = () => {
    return allImagePoints;
  };

  const setCanvasContext = (updatedContext: CanvasRenderingContext2D) => {
    canvasContext = updatedContext;
  };

  return {
    getPositionedImages,
    handleAddInitialItems,
    handleDrawAllItems,
    getAllImagePoints,
    setCanvasContext,
  };
};
