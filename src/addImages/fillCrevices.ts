import { removeUndefinedArrElements } from "../perimeter/arrayHelpers";
import { imgPointsMapFromCoordinates } from "../perimeter/defineAgglomeratedImg";
import { determinePerimeterPoints } from "../perimeter/determinePerimeter";
import { addMapsToMap } from "../perimeter/mapHelpers";
import { ICoordinates, IPoint } from "../perimeter/pointsTypes";
import {
  determineCreviceClearanceArea,
  IClearanceArea,
} from "./determineCreviceClearanceArea";
import { generateEdgesMap, IEdge } from "./generateEdgesMap";

export const fillCrevices = (
  agglomeratedImgPerimeter: Map<string, IPoint>,
  clearanceWidth: number
): Map<string, IPoint> => {
  let filledPerimeter: Map<string, IPoint>;

  const fillNextCrevice = (latestImgPerimeter: Map<string, IPoint>) => {
    const agglomeratedImgEdges = generateEdgesMap(latestImgPerimeter);

    const preCreviceEdgeIds = new Set<string>();

    for (const [key, edge] of agglomeratedImgEdges) {
      if (
        edge.points.from.type !== "crevice" &&
        edge.points.to.type === "crevice"
      ) {
        preCreviceEdgeIds.add(key);
      }
    }

    const coordinatesOfCrevices: {
      topLeft: ICoordinates;
      bottom: ICoordinates;
      topRight: ICoordinates;
    }[] = [];

    for (const preCreviceId of preCreviceEdgeIds) {
      const preCreviceEdge = agglomeratedImgEdges.get(preCreviceId);
      const leftCreviceEdge = agglomeratedImgEdges.get(
        preCreviceEdge!.nextEdge
      );
      const rightCreviceEdge = agglomeratedImgEdges.get(
        leftCreviceEdge!.nextEdge
      );

      const topLeft = leftCreviceEdge!.points.from.coordinates;
      const bottom = leftCreviceEdge!.points.to.coordinates;
      const topRight = rightCreviceEdge!.points.to.coordinates;

      coordinatesOfCrevices.push({
        topLeft,
        bottom,
        topRight,
      });
    }

    const clearanceAreas = coordinatesOfCrevices.map(
      ({ topLeft, bottom, topRight }) => {
        return determineCreviceClearanceArea(
          topLeft,
          bottom,
          topRight,
          clearanceWidth
        );
      }
    );

    const definedClearanceAreas = removeUndefinedArrElements(clearanceAreas);

    if (definedClearanceAreas[0] === undefined) {
      return;
    }

    filledPerimeter = addClearanceAreasToPerimeter(
      latestImgPerimeter,
      definedClearanceAreas as IClearanceArea[]
    );

    fillNextCrevice(filledPerimeter);
  };

  fillNextCrevice(agglomeratedImgPerimeter);

  // @ts-ignore
  return filledPerimeter;
};

const addClearanceAreasToPerimeter = (
  perimeter: Map<string, IPoint>,
  clearanceAreas: IClearanceArea[]
): Map<string, IPoint> => {
  const linkedCoordinatesMap = new Map<string, string>([
    ["tl", "tr"],
    ["tr", "br"],
    ["br", "bl"],
    ["bl", "tl"],
  ]);
  const clearanceImgPointsMapsArr = clearanceAreas.map((coordinates) => {
    const coordinatesMap = new Map(Object.entries(coordinates));

    return imgPointsMapFromCoordinates(linkedCoordinatesMap, coordinatesMap);
  });
  // Coordinates to points

  const allPointsMap = addMapsToMap(perimeter, clearanceImgPointsMapsArr);

  // Coordinates to image perimeter
  const newPerimeterPoints = determinePerimeterPoints(allPointsMap, 3);

  return newPerimeterPoints;
};
