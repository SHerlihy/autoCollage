import { CreateIds } from "../addImages/createIds";
import {
  ILoadedImagesClosureResults,
  loadedImagesClosure,
} from "../drawings/imageLoader";
import { drawLoadedImages, IPositionedImage } from "../drawings/sampleDrawing";
import { imagesToPointsMap } from "../perimeter/pointsHelper";
import { IPoint } from "../perimeter/pointsTypes";

// @ts-ignore
import screamImg from "../../src/assets/img_the_scream.jpg";

export const positionImagesClosure = (
  loadedImages: ILoadedImagesClosureResults
) => {
  const { getLoadedImages, loadNewImages } = loadedImages;

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

    const forkHandle = {
      image: startImg,
      position: { x: startImg.width / 2, y: startImg.height / 2 },
      rotation: 10,
    };
    const prongLeft = {
      image: startImg,
      position: { x: -startImg.width / 4, y: -startImg.height / 2 },
      rotation: 10,
    };
    const prongRight = {
      image: startImg,
      position: { x: startImg.width, y: -startImg.height / 2 },
    };
    const pronged = {
      image: startImg,
      position: { x: startImg.width / 2, y: -startImg.height * 1.5 },
      rotation: 300,
    };

    handleAddPositionedImages([forkHandle, prongLeft, prongRight, pronged]);
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
    handleAddPositionedImages,
    handleDrawAllItems,
    getAllImagePoints,
    setCanvasContext,
  };
};
