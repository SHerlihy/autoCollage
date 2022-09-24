import { defineImgPerimeter } from "../perimeter/defineAgglomeratedImg";
import { determinePerimeterPoints } from "../perimeter/determinePerimeter";
import { ICoordinates, IPoint, IPointsMap } from "../perimeter/pointsTypes";
import {
  getDegreesFromNonHypotenuseSides,
  getHypotenuseSideFromSides,
  getRadiansFromNonHypotenuseSides,
  getSideLengthFromDegreesAndSide,
  SOHOppositeSideFromDegrees,
} from "../perimeter/trigonometryHelpers";

import { fillCrevices } from "./fillCrevices";
import { generateEdgesMap, IEdge } from "./generateEdgesMap";

//will need to get this from looking at our stored images
const MINIMUM_IMAGE_WIDTH = 10;

//offset passed in so user can decide 'emptiness'
// const fillWindow = (
//   left: number,
//   top: number,
//   right: number,
//   bottom: number,
//   images,
//   offset: number
// ) => {
//   const allPoints = getPointsImages(images) as IPointsMap;

//   const perimeterPointIds = determinePerimeterPoints(allPoints, offset);

//   const agglomeratedImgPerimeter = defineImgPerimeter(
//     perimeterPointIds,
//     allPoints
//   );

//   const perimeterCrevicesFilled = fillCrevices(agglomeratedImgPerimeter);

//   const fillAlternateEdges = (perimeter: Map<string, IPoint>) => {
//     const imgEdges = generateEdgesMap(perimeter);

//     let iterationIndex = 0;
//     for (const imgEdge of imgEdges) {
//       iterationIndex++;
//       if (iterationIndex % 2) return;
//     }
//   };

//   //add images to alternate edges
//   //do fill crevices again
//   //recuse between two
// };

// const calculateCoordinatesOfImagesToAddOnLine = (
//   from: ICoordinates,
//   to: ICoordinates,
//   overflow: number,
//   images
// ) => {
//   // determineOutwardness

//   const xLength = to.x - from.x;
//   const yLength = to.y - from.y;

//   const edgeLength = getHypotenuseSideFromSides(xLength, yLength);

//   const randomImagesToFillLength = (
//     length: number,
//     offset: number,
//     images: []
//   ): [] => {
//     return [];
//   };

//   const assignedImages = randomImagesToFillLength(edgeLength, overflow, images);

//   const assignedImageCoordinates = coordinatesImagesAlongLineMap(
//     assignedImages,
//     from.x,
//     xLength,
//     yLength
//   );

//   return assignedImageCoordinates;
// };

// const coordinatesImagesAlongLineMap = (
//   assignedImages,
//   lineStart: ICoordinates,
//   xLength: number,
//   yLength: number
// ) => {
//   let currentWidthProgress = 0;

//   const assignedPositionsArr = assignedImages.map(({ id, height, width }) => {
//     const { xOffset: xOffsetAlongLine, yOffset: yOffsetAlongLine } =
//       calculateCoordinateOffsetsAlongLine(width, xLength, yLength);

//     const cornerTouchingLineCoordinates = {
//       x: lineStart.x + xOffsetAlongLine,
//       y: lineStart.y - yOffsetAlongLine,
//     };

//     const { xOffset: xOffsetAboveLine, yOffset: yOffsetAboveLine } =
//       calculateCoordinateOffsetsAboveLine(height, xLength, yLength);

//     currentWidthProgress + width;

//     return [
//       id,
//       {
//         x: cornerTouchingLineCoordinates.x + xOffsetAboveLine,
//         y: cornerTouchingLineCoordinates.y + yOffsetAboveLine,
//       },
//     ];
//   });

//   return new Map(assignedPositionsArr);
// };

// const calculateCoordinateOffsetsAlongLine = (
//   alongOffset: number,
//   xLineLength: number,
//   yLineLength: number
// ) => {
//   const degreesLineXOpposite = getDegreesFromNonHypotenuseSides(
//     xLineLength,
//     yLineLength
//   );

//   const degreesLineYOpposite = 90 - degreesLineXOpposite;

//   const xOffset = SOHOppositeSideFromDegrees(alongOffset, degreesLineXOpposite);
//   const yOffset = SOHOppositeSideFromDegrees(alongOffset, degreesLineYOpposite);

//   return {
//     xOffset,
//     yOffset,
//   };
// };

// const calculateCoordinateOffsetsAboveLine = (
//   aboveOffset: number,
//   xLineLength: number,
//   yLineLength: number
// ) => {
//   const degreesBelowLine = getDegreesFromNonHypotenuseSides(
//     xLineLength,
//     yLineLength
//   );
//   const degreesAwayFromLine = 90 - degreesBelowLine;
//   const degreesOnLine = 90 - degreesAwayFromLine;

//   const xOffset = getSideLengthFromDegreesAndSide(
//     aboveOffset,
//     degreesAwayFromLine,
//     degreesOnLine
//   );
//   const yOffset = getSideLengthFromDegreesAndSide(
//     aboveOffset,
//     degreesOnLine,
//     degreesAwayFromLine
//   );

//   return {
//     xOffset,
//     yOffset,
//   };
// };
