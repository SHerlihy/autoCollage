import { removeUndefinedArrElements } from "../perimeter/arrayHelpers";
import { imgPointsMapFromCoordinates } from "../perimeter/defineAgglomeratedImg";
import { determinePerimeterPoints } from "../perimeter/determinePerimeter";
import { addMapsToMap } from "../perimeter/mapHelpers";
import { ICoordinates, IPoint } from "../perimeter/pointsTypes";
import { CreateIds } from "./createIds";
import {
  determineCreviceClearanceArea,
  IClearanceArea,
} from "./determineCreviceClearanceArea";
import { generateEdgesMap, IEdgesMap } from "./generateEdgesMap";

interface IClearanceAreaInfo {
  preCrevicePointId: string;
  areaCoordinates: IClearanceArea;
}

export const fillCrevices = (
  agglomeratedImgPerimeter: Map<string, IPoint>,
  clearanceWidth: number
): Map<string, IPoint> => {
  const clearanceAreas = clearanceAreasFromPerimeter(
    agglomeratedImgPerimeter,
    clearanceWidth
  );

  if (!clearanceAreas) {
    return agglomeratedImgPerimeter;
  }

  const filledPerimeter = replaceCrevicePointWithClearanceArea(
    agglomeratedImgPerimeter,
    clearanceAreas
  );

  const finalPerimeter = fillCrevices(filledPerimeter, clearanceWidth);

  return finalPerimeter;
};

const clearanceAreasFromPerimeter = (
  latestImgPerimeter: Map<string, IPoint>,
  clearanceWidth: number
) => {
  const agglomeratedImgEdges = generateEdgesMap(latestImgPerimeter);

  const leftCreviceEdgeIds = findEdgesLeftOfCrevices(agglomeratedImgEdges);

  const coordinatesOfCrevices = findCreviceCoordinates(
    leftCreviceEdgeIds,
    agglomeratedImgEdges
  );

  const definedClearanceAreas = determineCreviceClearanceAreas(
    coordinatesOfCrevices,
    clearanceWidth
  );

  return definedClearanceAreas;
};

const findEdgesLeftOfCrevices = (agglomeratedImgEdges: IEdgesMap) => {
  const leftCreviceEdgeIds = new Set<string>();

  for (const [key, edge] of agglomeratedImgEdges) {
    if (
      edge.points.from.type !== "crevice" &&
      edge.points.to.type === "crevice"
    ) {
      leftCreviceEdgeIds.add(key);
    }

    if (
      edge.points.from.type === "crevice" &&
      edge.points.to.type === "crevice"
    ) {
      leftCreviceEdgeIds.add(key);
    }
  }

  return leftCreviceEdgeIds;
};

interface ICreviceInfo {
  preCrevicePointId: string;
  coordinates: {
    topLeft: ICoordinates;
    bottom: ICoordinates;
    topRight: ICoordinates;
  };
}

const findCreviceCoordinates = (
  leftCreviceEdgeIds: Set<string>,
  agglomeratedImgEdges: IEdgesMap
): ICreviceInfo[] => {
  const coordinatesOfCrevices: {
    preCrevicePointId: string;
    coordinates: {
      topLeft: ICoordinates;
      bottom: ICoordinates;
      topRight: ICoordinates;
    };
  }[] = [];

  for (const leftCreviceId of leftCreviceEdgeIds) {
    const leftCreviceEdge = agglomeratedImgEdges.get(leftCreviceId);
    const rightCreviceEdge = agglomeratedImgEdges.get(
      leftCreviceEdge!.nextEdge
    );

    const topLeft = leftCreviceEdge!.points.from.coordinates;
    const bottom = leftCreviceEdge!.points.to.coordinates;
    const topRight = rightCreviceEdge!.points.to.coordinates;

    coordinatesOfCrevices.push({
      preCrevicePointId: leftCreviceEdge!.points.from.currentImgPointId,
      coordinates: {
        topLeft,
        bottom,
        topRight,
      },
    });
  }

  return coordinatesOfCrevices;
};

const determineCreviceClearanceAreas = (
  coordinatesOfCrevices: ICreviceInfo[],
  clearanceWidth: number
) => {
  const clearanceAreas = coordinatesOfCrevices.map(
    ({ preCrevicePointId, coordinates }) => {
      const { topLeft, bottom, topRight } = coordinates;
      const areas = determineCreviceClearanceArea(
        topLeft,
        bottom,
        topRight,
        clearanceWidth
      );

      if (!areas) return;

      const clearanceAreaInfo = {
        preCrevicePointId,
        areaCoordinates: { ...areas },
      } as IClearanceAreaInfo;

      return clearanceAreaInfo;
    }
  );

  const definedClearanceAreas = removeUndefinedArrElements(clearanceAreas);

  if (definedClearanceAreas[0] === undefined) {
    return;
  }

  return definedClearanceAreas;
};

const replaceCrevicePointWithClearanceArea = (
  perimeter: Map<string, IPoint>,
  clearanceAreas: IClearanceAreaInfo[]
): Map<string, IPoint> => {
  // ends up just duplicating last ones
  const clearanceImgPointsMapsArr = clearanceAreas.map(
    ({ preCrevicePointId, areaCoordinates }) => {
      const tlKey = CreateIds.getInstance().generateNovelId();
      const trKey = CreateIds.getInstance().generateNovelId();
      const brKey = CreateIds.getInstance().generateNovelId();
      const blKey = CreateIds.getInstance().generateNovelId();

      const linkedCoordinatesMap = new Map<string, string>([
        [tlKey, trKey],
        [trKey, brKey],
        [brKey, blKey],
        [blKey, tlKey],
      ]);

      const coordinatesMap = new Map();

      for (const [areaKey, areaCoordinate] of Object.entries(areaCoordinates)) {
        let newKey;

        switch (areaKey) {
          case "tl":
            newKey = tlKey;
            break;
          case "tr":
            newKey = trKey;
            break;
          case "br":
            newKey = brKey;
            break;
          case "bl":
            newKey = blKey;
            break;
          default:
            break;
        }
        coordinatesMap.set(newKey, areaCoordinate);
      }

      const arr = imgPointsMapFromCoordinates(
        linkedCoordinatesMap,
        coordinatesMap
      );

      const preCrevicePoint = perimeter.get(preCrevicePointId)!;
      const crevicePointId = preCrevicePoint.nextImgPointId;
      const postCrevicePointId = perimeter.get(crevicePointId)!.nextImgPointId;

      const brPoint = arr.get(brKey)!;

      preCrevicePoint.nextImgPointId = blKey;
      brPoint.nextImgPointId = postCrevicePointId;
      // perimeter.delete(crevicePointId);

      return arr;
    }
  );
  // Coordinates to points

  const allPointsMap = addMapsToMap(perimeter, clearanceImgPointsMapsArr);

  const newPerimeterPoints = determinePerimeterPoints(allPointsMap, 3);

  return newPerimeterPoints;
};
