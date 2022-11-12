import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
// import { useImageChanger } from "./useImageChanger";
import { useCanvasPositioner } from "./useCanvasPositioner";
import { positionImagesClosure } from "./imagePositioning";

// @ts-ignore
// import cat03 from "../../src/assets/cat03.jpg";

import { generateEdgesMap, IEdgesMap } from "../addImages/generateEdgesMap";

import {
  determineAgglomeratedPerimeterIds,
  determineAgglomeratedPerimeterPoints,
} from "../perimeter/determineAgglomeratedPerimeterIds";

import { useHighlightPerimeter } from "./highlightPerimerterHook";
import { ICoordinates, IPointsMap } from "../perimeter/pointsTypes";
import {
  edgeLengthFromCoordinates,
  getDegreesFromNonHypotenuseSides,
} from "../perimeter/trigonometryHelpers";
import { loadedImagesClosure } from "../drawings/imageLoader";
import { IPositionedImage } from "../drawings/sampleDrawing";
import { calculatePerpendicular } from "../perimeter/pointsHelper";
import { getRandomIndex } from "../perimeter/arrayHelpers";

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
};

const positionImagesAlongEdge = (
  from: ICoordinates,
  to: ICoordinates,
  image: PlaceDimensionImage
): IPositionedImage => {
  // I neeed to fugure out how to rotate my images

  // find gradient on edge so rotation can be made to follow

  // calculate perpendicular based on gradients/rotation
  const across = image.placeByWidth
    ? image.imageValue.width
    : image.imageValue.height;
  const away = image.placeByWidth
    ? image.imageValue.height
    : image.imageValue.width;

  return {
    image: image.imageValue,
    position: calculatePerpendicular(from, to, across, away),
  };
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

  const handleAddImages = () => {
    if (!perimeterPoints?.size) {
      return;
    }
    const perimeterEdges = generateEdgesMap(perimeterPoints);

    const edgesEntries = [...perimeterEdges.entries()];

    const edgeIdx = getRandomIndex(edgesEntries);

    const [perimerterEdgeId, perimeterEdgeValue] = edgesEntries[edgeIdx];

    const { from, to } = perimeterEdgeValue.points;

    let edgeWidth = edgeLengthFromCoordinates(from.coordinates, to.coordinates);

    // identify what can fill

    const currentLoadedImages = getLoadedImages();

    if (currentLoadedImages === undefined) {
      return;
    }

    const validatedImages: Array<ValidatedImage> = [];

    for (const [imageId, imageValue] of currentLoadedImages) {
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

    if (validatedImages.length === 0) {
      return;
    }

    const imagesToAdd: Array<PlaceDimensionImage> = [];

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

      imagesToAdd.push({
        imageId,
        imageValue,
        placeByWidth: validWidth,
      });
    }

    const yDelta = to.coordinates.y - from.coordinates.y;
    const xDelta = to.coordinates.x - from.coordinates.x;

    const ogGradient = yDelta / xDelta;

    const perpendicularGradient = -1 / ogGradient;

    const rotation = getDegreesFromNonHypotenuseSides(
      1,
      1 * perpendicularGradient
    );

    const positionedImages = imagesToAdd.map((placeDimensionImage) => {
      const across = placeDimensionImage.placeByWidth
        ? placeDimensionImage.imageValue.width
        : placeDimensionImage.imageValue.height;
      const away = placeDimensionImage.placeByWidth
        ? placeDimensionImage.imageValue.height
        : placeDimensionImage.imageValue.width;

      if (yDelta === 0) {
        if (from.coordinates.x < to.coordinates.x) {
          return {
            image: placeDimensionImage.imageValue,
            position: {
              x: from.coordinates.x + across,
              y: from.coordinates.y - away,
            },
            rotation: placeDimensionImage.placeByWidth ? 0 : 90,
          };
        } else {
          return {
            image: placeDimensionImage.imageValue,
            position: {
              x: from.coordinates.x - across,
              y: from.coordinates.y + away,
            },
            rotation: placeDimensionImage.placeByWidth ? 270 : 180,
          };
        }
      }

      if (xDelta === 0) {
        if (from.coordinates.y < to.coordinates.y) {
          return {
            image: placeDimensionImage.imageValue,
            position: {
              x: from.coordinates.x + across,
              y: from.coordinates.y + away,
            },
            rotation: placeDimensionImage.placeByWidth ? 90 : 0,
          };
        } else {
          return {
            image: placeDimensionImage.imageValue,
            position: {
              x: from.coordinates.x - across,
              y: from.coordinates.y - away,
            },
            rotation: placeDimensionImage.placeByWidth ? 180 : 270,
          };
        }
      }

      const { image, position } = positionImagesAlongEdge(
        from.coordinates,
        to.coordinates,
        placeDimensionImage
      );

      return {
        image,
        position,
        rotation,
      };
    });

    handleAddPositionedImages(positionedImages);
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
