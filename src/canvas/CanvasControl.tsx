import React, { useEffect, useRef, useState } from "react";
import { loadImages } from "../drawings/imageLoader";
import { drawLoadedImages, IPositionedImage } from "../drawings/sampleDrawing";
import { Canvas } from "./Canvas";
import { useImageChanger } from "./useImageChanger";
import { useCanvasPositioner } from "./useCanvasPositioner";

// @ts-ignore
import screamImg from "../../src/assets/img_the_scream.jpg";
// @ts-ignore
import cat03 from "../../src/assets/cat03.jpg";

import { determineAgglomeratedPerimeterIds } from "../perimeter/determineAgglomeratedPerimeterIds";

import { generateFulfilledPromisesMap } from "../promiseHelpers";
import { getMapFromMap } from "../perimeter/mapHelpers";
import { imagesToPointsMap } from "../perimeter/pointsHelper";
import { IPoint } from "../perimeter/pointsTypes";
import { CreateIds } from "../addImages/createIds";
import { useHighlightPerimeter } from "./highlightPerimerterHook";

const loadedImagesClosure = () => {
  let loadedImages: Map<string, HTMLImageElement> | undefined;

  const loadNewImages = async (images: Array<string>) => {
    const unloadedImages = images.filter((src) => {
      const hasLoaded = loadedImages?.get(src);

      return hasLoaded === undefined;
    });

    const { getLoadedImages } = loadImages(unloadedImages);
    const allLoadedImages = await getLoadedImages();

    const fulfilledLoadedImages = generateFulfilledPromisesMap(
      unloadedImages,
      allLoadedImages
    );
    loadedImages = fulfilledLoadedImages;
    return;
  };

  const getLoadedImages = () => {
    return loadedImages;
  };

  return { getLoadedImages, loadNewImages };
};

const { getLoadedImages, loadNewImages } = loadedImagesClosure();

const positionImagesClosure = () => {
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

const {
  handleDrawAllItems,
  handleAddInitialItems,
  getAllImagePoints,
  setCanvasContext,
} = positionImagesClosure();

const getCurrentPerimeterPoints = (
  perimeterIds: string[] | undefined
): Map<string, IPoint> => {
  if (!perimeterIds) {
    return new Map();
  }
  const positionedImagesPoints = getAllImagePoints();

  const { addToSubMap, getSubMap } = getMapFromMap(positionedImagesPoints);

  addToSubMap(perimeterIds);

  return getSubMap();
};

export const CanvasControl = () => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [perimeterIds, setPerimeterIds] = useState<Array<string>>();

  // can remove later
  useEffect(() => {
    handleAddInitialItems();
  }, []);

  useCanvasPositioner(canvasRef, handleDrawAllItems);

  useEffect(() => {
    const currentContext = canvasRef.current?.getContext("2d");
    if (currentContext) {
      setCanvasContext(currentContext);
    }
  }, [canvasRef.current]);

  useHighlightPerimeter(canvasRef, perimeterIds, getCurrentPerimeterPoints);

  const handleAgglomerateImages = () => {
    const positionedImagesPoints = getAllImagePoints();

    const perimeterPointIds = determineAgglomeratedPerimeterIds(
      positionedImagesPoints
    );

    setPerimeterIds(perimeterPointIds);

    // save in state
  };

  return (
    <main>
      <Canvas canvasRef={canvasRef} />
      <article className="sidebar">
        <button
          onClick={() => {
            // so it loads
            // setImages([cat03]);
            // so it draws
            // handleAddInitialItems();
          }}
        >
          Cats!
        </button>
        <button onClick={handleAgglomerateImages}>Agglomerate</button>
      </article>
    </main>
  );
};
