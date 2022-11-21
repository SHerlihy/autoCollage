import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
// import { useImageChanger } from "./useImageChanger";
import { useCanvasPositioner } from "./useCanvasPositioner";
import { positionImagesClosure } from "./imagePositioning";

// @ts-ignore
import cat03 from "../../src/assets/cat03.jpg";
// @ts-ignore
import fiftyFifty from "../../src/assets/5050.jpeg";

import { generateEdgesMap, IEdge } from "../addImages/generateEdgesMap";

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
import { determinePerimeter } from "../perimeter/determinePerimeter";
import { fillCrevices } from "../addImages/fillCrevices";
import { determineCrevicedPerimeterPoints } from "../perimeter/determineCrevicedPerimeter";

const loadedImagesClosureResults = loadedImagesClosure();
const { getLoadedImages, loadNewImages, getMinimumImage } =
  loadedImagesClosureResults;

const {
  handleDrawAllItems,
  handleAddInitialItems,
  handleAddPositionedImages,
  getAllImagePoints,
  setCanvasContext,
  setUpdatedPoints,
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
  thresholdMod?: number;
};

const positionImagesAlongEdge = (
  from: ICoordinates,
  to: ICoordinates,
  image: PlaceDimensionImage
): IPositionedImage => {
  const { across, away } = image;

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
  validatedImages: ValidatedImage[],
  awayMod = 2
) => {
  const imagesToAdd: Array<PlaceDimensionImage> = [];

  let remainingWidth = edgeWidth;

  let acrossAccumulator = 0;

  while (remainingWidth > 0) {
    const randomIdx = getRandomIndex(validatedImages);

    const { imageId, validHeight, validWidth } = validatedImages[randomIdx];

    const imageValue = currentLoadedImages.get(imageId)!;

    // width then height

    const updatedWidth = validWidth
      ? remainingWidth - imageValue.width
      : remainingWidth - imageValue.height;

    if (updatedWidth < 2) {
      break;
    }

    remainingWidth = updatedWidth;

    const acrossAdditionalSpace = validWidth
      ? imageValue.width
      : imageValue.height;

    const across = acrossAccumulator + acrossAdditionalSpace / 2;

    acrossAccumulator = acrossAccumulator + acrossAdditionalSpace;

    const away = validWidth
      ? imageValue.height / 2 + awayMod
      : imageValue.width / 2 + awayMod;

    imagesToAdd.push({
      imageId,
      imageValue,
      placeByWidth: validWidth,
      across,
      away,
    });
  }

  const positionedImagesToAdd = imagesToAdd.map((imageToAdd, idx) => {
    imageToAdd.across = imageToAdd.across + remainingWidth / 2;
    if (idx === imagesToAdd.length - 1) {
      imageToAdd.thresholdMod = remainingWidth / 2;
    }

    return imageToAdd;
  });

  return positionedImagesToAdd;
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

    let generatedImage;

    if (withinEpsilonBounds(yDelta, 0, 1000)) {
      if (from.x < to.x) {
        generatedImage = {
          image: placeDimensionImage.imageValue,
          position: {
            x: from.x + across,
            y: from.y - away,
          },
          rotation: placeDimensionImage.placeByWidth ? 0 : 270,
        };
      } else {
        generatedImage = {
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
        generatedImage = {
          image: placeDimensionImage.imageValue,
          position: {
            x: from.x + away,
            y: from.y + across,
          },
          rotation: placeDimensionImage.placeByWidth ? 90 : 0,
        };
      } else {
        generatedImage = {
          image: placeDimensionImage.imageValue,
          position: {
            x: from.x - away,
            y: from.y - across,
          },
          rotation: placeDimensionImage.placeByWidth ? 270 : 180,
        };
      }
    }

    if (generatedImage) {
      generatedImage.thresholdMod = placeDimensionImage.thresholdMod;

      return generatedImage;
    }

    generatedImage = positionImagesAlongEdge(from, to, placeDimensionImage);

    generatedImage.thresholdMod = placeDimensionImage.thresholdMod;

    return generatedImage;
  });

  return positionedImages;
};

export const CanvasControl = () => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [perimeterIds, setPerimeterIds] = useState<Array<string>>();
  const [perimeterPoints, setPerimeterPoints] = useState<IPointsMap>();

  const [perimeterEdges, setPerimeterEdges] = useState<Map<string, IEdge>>();
  const [currentEdgeId, setCurrentEdgeId] = useState<string>();

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

  const handleFillCrevices = () => {
    const positionedImagesPoints = getAllImagePoints();

    const updatedPerimeter = determineCrevicedPerimeterPoints(
      positionedImagesPoints
    );

    const minImage = getMinimumImage()!;
    const { image, minDimension } = minImage;

    const { filledPerimeter } = fillCrevices(
      updatedPerimeter,
      minDimension,
      getMinimumImage
    );

    const updatedPerimeterPoints = [...filledPerimeter.values()];

    setUpdatedPoints(updatedPerimeterPoints);

    setPerimeterPoints(filledPerimeter);
  };

  const handleEstablishEdges = () => {
    if (!perimeterPoints?.size) {
      return;
    }

    const perimeterEdges = generateEdgesMap(perimeterPoints);

    setPerimeterEdges(perimeterEdges);
    setCurrentEdgeId([...perimeterEdges.keys()][0]);
  };

  const handleAddImagesToEdge = async () => {
    const currentLoadedImages = getLoadedImages();

    if (currentLoadedImages === undefined) {
      return;
    }

    if (!perimeterPoints || !currentEdgeId) {
      return;
    }

    handleFillCrevices();

    const updatedEdges = generateEdgesMap(perimeterPoints);

    const updatedEdge = updatedEdges.get(currentEdgeId);

    if (!updatedEdge) {
      return;
    }

    const { from, to } = updatedEdge.points;

    const edgeWidth = edgeLengthFromCoordinates(
      from.coordinates,
      to.coordinates
    );

    const validatedImages = determineValidImages(
      currentLoadedImages,
      edgeWidth
    );

    if (validatedImages.length === 0) {
      return;
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

    await handleAddPositionedImages(positionedImages);

    setCurrentEdgeId(updatedEdge.nextEdge);
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

      await handleAddPositionedImages(positionedImages);
    }

    // for (const [perimerterEdgeId, perimeterEdgeValue] of perimeterEdges) {
    //   handleFillCrevices();

    //   const updatedEdges = generateEdgesMap(perimeterPoints);

    //   const updatedEdge = updatedEdges.get(perimerterEdgeId);

    //   if (!updatedEdge) {
    //     continue;
    //   }

    //   const { from, to } = perimeterEdgeValue.points;

    //   const edgeWidth = edgeLengthFromCoordinates(
    //     from.coordinates,
    //     to.coordinates
    //   );

    //   const validatedImages = determineValidImages(
    //     currentLoadedImages,
    //     edgeWidth
    //   );

    //   if (validatedImages.length === 0) {
    //     continue;
    //   }

    //   const imagesToAdd = determineImagesToAdd(
    //     edgeWidth,
    //     currentLoadedImages,
    //     validatedImages
    //   );

    //   const positionedImages = generatePositionImages(
    //     imagesToAdd,
    //     from.coordinates,
    //     to.coordinates
    //   );

    //   await handleAddPositionedImages(positionedImages);
    // }
  };

  return (
    <main>
      <Canvas canvasRef={canvasRef} />
      <article className="sidebar">
        <button
          onClick={() => {
            loadNewImages([cat03, fiftyFifty]);
            // so it loads
            // setImages([cat03]);
            // so it draws
            // handleAddInitialItems();
          }}
        >
          Cats!
        </button>
        <button onClick={handleAgglomerateImages}>Agglomerate</button>
        <button onClick={handleFillCrevices}>Fill</button>
        <button onClick={handleAddImages}>Add Images</button>
        <button onClick={handleEstablishEdges}>Establish Edges</button>
        <button onClick={handleAddImagesToEdge}>Add images to edge</button>
      </article>
    </main>
  );
};
