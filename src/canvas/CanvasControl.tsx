import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
// import { useImageChanger } from "./useImageChanger";
import { useCanvasPositioner } from "./useCanvasPositioner";
import { positionImagesClosure } from "./imagePositioning";

// @ts-ignore
// import cat03 from "../../src/assets/cat03.jpg";

import { generateEdgesMap } from "../addImages/generateEdgesMap";

import {
  determineAgglomeratedPerimeterIds,
  determineAgglomeratedPerimeterPoints,
} from "../perimeter/determineAgglomeratedPerimeterIds";

import { useHighlightPerimeter } from "./highlightPerimerterHook";
import { ICoordinates, IPointsMap } from "../perimeter/pointsTypes";
import { edgeLengthFromCoordinates } from "../perimeter/trigonometryHelpers";
import { loadedImagesClosure } from "../drawings/imageLoader";
import { IPositionedImage } from "../drawings/sampleDrawing";
import { calculatePerpendicular } from "../perimeter/pointsHelper";
import { getRandomIndex } from "../perimeter/arrayHelpers";
import { withinEpsilonBounds } from "../perimeter/mathHelpers";

const loadedImagesClosureResults = loadedImagesClosure();
const { getLoadedImages, loadNewImages } = loadedImagesClosureResults;

const {
  handleDrawAllItems,
  handleAddInitialItems,
  handleAddPositionedImages,
  getAllImagePoints,
  setCanvasContext,
} = positionImagesClosure(loadedImagesClosureResults);

type ValidatedImage = {
  imageId: string;
  validHeight: boolean;
  validWidth: boolean;
};

type PlaceDimensionImage = {
  imageId: string;
  imageValue: HTMLImageElement;
  placeByWidth: boolean;
  across: number;
  away: number;
};

const positionImagesAlongEdge = (
  from: ICoordinates,
  to: ICoordinates,
  image: PlaceDimensionImage
): IPositionedImage => {
  const across = image.placeByWidth
    ? image.imageValue.width / 2
    : image.imageValue.height / 2;

  const away = image.placeByWidth
    ? image.imageValue.height / 2
    : image.imageValue.width / 2;

  const { coordinates, rotation } = calculatePerpendicular(
    from,
    to,
    across,
    away
  );

  return {
    image: image.imageValue,
    position: coordinates,
    rotation,
  };
};

const determineValidImages = (
  images: Map<string, HTMLImageElement>,
  edgeWidth: number
) => {
  const validatedImages: Array<ValidatedImage> = [];

  for (const [imageId, imageValue] of images) {
    const { width, height } = imageValue;

    if (height > edgeWidth && width > edgeWidth) {
      continue;
    }

    const validatedImage = {
      imageId,
      validHeight: height <= edgeWidth,
      validWidth: width <= edgeWidth,
    };

    validatedImages.push(validatedImage);
  }
  return validatedImages;
};

const determineImagesToAdd = (
  edgeWidth: number,
  currentLoadedImages: Map<string, HTMLImageElement>,
  validatedImages: ValidatedImage[]
) => {
  const imagesToAdd: Array<PlaceDimensionImage> = [];

  let acrossAccumulator = 0;

  while (edgeWidth > 0) {
    const randomIdx = getRandomIndex(validatedImages);

    const { imageId, validHeight, validWidth } = validatedImages[randomIdx];

    const imageValue = currentLoadedImages.get(imageId)!;

    // width then height

    const remainingWidth = validWidth
      ? edgeWidth - imageValue.width
      : edgeWidth - imageValue.height;

    if (remainingWidth < 0) {
      break;
    }

    edgeWidth = remainingWidth;

    const acrossAdditionalSpace = validWidth
      ? imageValue.width
      : imageValue.height;

    const across = acrossAccumulator + acrossAdditionalSpace / 2;

    acrossAccumulator = acrossAccumulator + acrossAdditionalSpace;

    const away = validWidth ? imageValue.height / 2 : imageValue.width / 2;

    imagesToAdd.push({
      imageId,
      imageValue,
      placeByWidth: validWidth,
      across,
      away,
    });
  }

  return imagesToAdd;
};

const generatePositionImages = (
  imagesToAdd: PlaceDimensionImage[],
  from: ICoordinates,
  to: ICoordinates
) => {
  const yDelta = to.y - from.y;
  const xDelta = to.x - from.x;

  const positionedImages = imagesToAdd.map((placeDimensionImage) => {
    const { across, away } = placeDimensionImage;

    if (withinEpsilonBounds(yDelta, 0, 1000)) {
      if (from.x < to.x) {
        return {
          image: placeDimensionImage.imageValue,
          position: {
            x: from.x + across,
            y: from.y - away,
          },
          rotation: placeDimensionImage.placeByWidth ? 0 : 270,
        };
      } else {
        return {
          image: placeDimensionImage.imageValue,
          position: {
            x: from.x - across,
            y: from.y + away,
          },
          rotation: placeDimensionImage.placeByWidth ? 180 : 90,
        };
      }
    }

    if (withinEpsilonBounds(xDelta, 0, 1000)) {
      if (from.y < to.y) {
        return {
          image: placeDimensionImage.imageValue,
          position: {
            x: from.x + away,
            y: from.y + across,
          },
          rotation: placeDimensionImage.placeByWidth ? 90 : 0,
        };
      } else {
        return {
          image: placeDimensionImage.imageValue,
          position: {
            x: from.x - away,
            y: from.y - across,
          },
          rotation: placeDimensionImage.placeByWidth ? 270 : 180,
        };
      }
    }

    return positionImagesAlongEdge(from, to, placeDimensionImage);
  });

  return positionedImages;
};

export const CanvasControl = () => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [perimeterIds, setPerimeterIds] = useState<Array<string>>();
  const [perimeterPoints, setPerimeterPoints] = useState<IPointsMap>();

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

  useHighlightPerimeter(canvasRef, perimeterPoints);

  const handleAgglomerateImages = () => {
    const positionedImagesPoints = getAllImagePoints();

    const perimeterPointIds = determineAgglomeratedPerimeterIds(
      positionedImagesPoints
    );

    setPerimeterIds(perimeterPointIds);

    const perimeterPoints = determineAgglomeratedPerimeterPoints(
      positionedImagesPoints
    );

    setPerimeterPoints(perimeterPoints);
  };

  const handleAddImages = async () => {
    if (!perimeterPoints?.size) {
      return;
    }

    const currentLoadedImages = getLoadedImages();

    if (currentLoadedImages === undefined) {
      return;
    }

    const perimeterEdges = generateEdgesMap(perimeterPoints);

    //want to do for all edges that are on screen
    //simplification just do for all edges

    for (const [perimerterEdgeId, perimeterEdgeValue] of perimeterEdges) {
      const { from, to } = perimeterEdgeValue.points;

      const edgeWidth = edgeLengthFromCoordinates(
        from.coordinates,
        to.coordinates
      );

      const validatedImages = determineValidImages(
        currentLoadedImages,
        edgeWidth
      );

      if (validatedImages.length === 0) {
        continue;
      }

      const imagesToAdd = determineImagesToAdd(
        edgeWidth,
        currentLoadedImages,
        validatedImages
      );

      const positionedImages = generatePositionImages(
        imagesToAdd,
        from.coordinates,
        to.coordinates
      );

      handleAddPositionedImages(positionedImages);
    }
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
        <button onClick={handleAddImages}>Add Images</button>
      </article>
    </main>
  );
};
