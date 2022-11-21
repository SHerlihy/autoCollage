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

    const ensureLoaded = async (
      additionalPositionedImage: IPositionedImage
    ) => {
      const isLoaded = loadedImages?.get(
        additionalPositionedImage.image.src.replace(window.location.origin, "")
      );

      if (isLoaded === undefined) {
        await loadNewImages([additionalPositionedImage.image.src]);
        return;
      } else {
        return;
      }
    };

    await additionalPositionedImages.forEach(
      async (additionalPositionedImage, idx) => {
        await (async () => ensureLoaded(additionalPositionedImage))();

        allPositionedImages.set(
          CreateIds.getInstance().generateNovelId(),
          additionalPositionedImage
        );

        const currentImagePoints = imagesToPointsMap([
          additionalPositionedImage,
        ]);

        if (
          additionalPositionedImage.thresholdMod &&
          idx === additionalPositionedImages.length - 1
        ) {
          const [edgeFromId, edgeFromVal] = [...currentImagePoints][
            currentImagePoints.size - 3
          ];
          const [edgeToId, edgeToVal] = [...currentImagePoints][
            currentImagePoints.size - 2
          ];

          edgeFromVal.thresholdMod = additionalPositionedImage.thresholdMod;
          edgeToVal.thresholdMod = additionalPositionedImage.thresholdMod;

          currentImagePoints.set(edgeFromId, edgeFromVal);
          currentImagePoints.set(edgeToId, edgeToVal);
        }

        for (const [currentPointId, currentPointValue] of currentImagePoints) {
          allImagePoints.set(currentPointId, currentPointValue);
        }
      }
    );

    handleDrawAllItems();
  };

  const setUpdatedPoints = (updatedPoints: Array<IPoint>) => {
    updatedPoints.forEach((updatedPoint) => {
      allImagePoints.set(updatedPoint.currentImgPointId, updatedPoint);
    });
  };

  const handleAddInitialItems = async () => {
    await loadNewImages([screamImg]);

    const loadedImages = getLoadedImages()!;

    const startImg = [...loadedImages.values()][0];

    const forkHandle = {
      image: startImg,
      position: { x: startImg.width / 2, y: startImg.height / 2 },
      rotation: 0,
    };
    // const prongLeft = {
    //   image: startImg,
    //   position: { x: -startImg.width / 4, y: -startImg.height / 2 },
    //   rotation: 10,
    // };
    // const prongRight = {
    //   image: startImg,
    //   position: { x: startImg.width, y: -startImg.height / 2 },
    // };
    // const pronged = {
    //   image: startImg,
    //   position: { x: startImg.width / 2, y: -startImg.height * 1.5 },
    //   rotation: 300,
    // };

    handleAddPositionedImages([forkHandle]);
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
    setUpdatedPoints,
  };
};
