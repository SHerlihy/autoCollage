import { MinImage } from "../drawings/imageLoader";
import { removeUndefinedArrElements } from "../perimeter/arrayHelpers";
import { imgPointsMapFromCoordinates } from "../perimeter/defineAgglomeratedImg";
import { determineCrevicedPerimeterPoints } from "../perimeter/determineCrevicedPerimeter";
import {
  determineLeftSideCoordinates,
  isCoordinateLeftOfEdge,
} from "../perimeter/determineLeftSideCoordinates";
import { addMapsToMap } from "../perimeter/mapHelpers";
import { calculatePerpendicular } from "../perimeter/pointsHelper";
import { ICoordinates, IPoint } from "../perimeter/pointsTypes";
import { CreateIds } from "./createIds";
import {
  determineCreviceClearanceArea,
  ClearanceArea,
} from "./determineCreviceClearanceArea";
import { generateEdgesMap, IEdgesMap } from "./generateEdgesMap";
import { distanceBetweenCoordinates } from "./shapeHelpers";

interface IClearanceAreaInfo {
  preCrevicePointId: string;
  areaCoordinates: ClearanceArea;
}

const fillCrevicesClosure = () => {
  const allClearanceAreas: IClearanceAreaInfo[] = [];

  const determineClearanceAreas = (
    agglomeratedImgPerimeter: Map<string, IPoint>,
    clearanceWidth: number,
    getMinimumImage: () => MinImage | undefined
  ): Map<string, IPoint> => {
    const minImage = getMinimumImage()!;
    const { image, minDimension } = minImage;

    const clearanceHeight =
      image.width === minDimension ? image.height : image.width;

    const clearanceAreas = clearanceAreasFromPerimeter(
      agglomeratedImgPerimeter,
      clearanceWidth,
      clearanceHeight
    );

    const agglomeratedImgEdges = generateEdgesMap(agglomeratedImgPerimeter);

    const leftCreviceEdgeIds = findEdgesLeftOfCrevices(agglomeratedImgEdges);

    if (leftCreviceEdgeIds.size === 0) {
      return agglomeratedImgPerimeter;
    }

    const areaLessIds = clearanceAreas
      ? [...leftCreviceEdgeIds].filter((leftId) => {
          const foundIdx = clearanceAreas.findIndex((clearanceInfo) => {
            return clearanceInfo.preCrevicePointId === leftId;
          });

          return foundIdx === -1;
        })
      : [...leftCreviceEdgeIds];

    if (areaLessIds.length === 0) {
      return agglomeratedImgPerimeter;
    }

    const unfillableCrevices = findCreviceCoordinates(
      new Set(areaLessIds),
      agglomeratedImgEdges
    );

    // const isFillable = (clearanceArea: IClearanceAreaInfo) => {
    //   const minImage = getMinimumImage()!;
    //   const { image, minDimension } = minImage;

    //   const { bl, tl, tr, br } = clearanceArea.areaCoordinates;

    //   const cardinalCoordinates = [bl, tl, tr, br];
    //   const propsArr = ["bl", "tl", "tr", "br"];

    //   const fillableIdx = cardinalCoordinates.findIndex((cur, idx, arr) => {
    //     const nextIdx = idx === arr.length - 1 ? 0 : idx + 1;
    //     const edgeDist = distanceBetweenCoordinates(cur, arr[nextIdx]);

    //     return edgeDist > minDimension + 2;
    //   });

    //   if (fillableIdx === -1) {
    //     return;
    //   }

    //   const nextIdx =
    //     fillableIdx === cardinalCoordinates.length - 1 ? 0 : fillableIdx + 1;

    //   return {
    //     from: propsArr[fillableIdx],
    //     to: propsArr[nextIdx],
    //   };
    // };

    // const unfillableArea = clearanceAreas.find((clearnaceArea) => {
    //   return !isFillable(clearnaceArea);
    // });

    // if (!unfillableArea) {
    //   allClearanceAreas.push(...clearanceAreas);

    //   const filledPerimeter = replaceCrevicePointWithClearanceArea(
    //     agglomeratedImgPerimeter,
    //     clearanceAreas
    //   );

    //   return determineClearanceAreas(
    //     filledPerimeter,
    //     clearanceWidth,
    //     getMinimumImage
    //   );
    // }

    const handleUnfillableArea = (
      startPoint: IPoint,
      initialEndPoint: IPoint,
      perimeterPoints: Map<string, IPoint>
    ): {
      endPoint: IPoint;
      visitedPoints: Array<string>;
      allowableBounds?: {
        from: IPoint;
        to: IPoint;
      };
    } => {
      const potentialLeftIds = new Set([...perimeterPoints.keys()]);

      const visitedPoints = [startPoint.currentImgPointId];

      const idsToLeft = determineLeftSideCoordinates(
        potentialLeftIds,
        perimeterPoints,
        startPoint.coordinates,
        initialEndPoint.coordinates
      );

      if (!idsToLeft) {
        return { endPoint: initialEndPoint, visitedPoints };
      }

      visitedPoints.push(initialEndPoint.currentImgPointId);

      const identifyFillableMultiCrevice = (
        startPoint: IPoint,
        endPoint: IPoint,
        perimeterPoints: Map<string, IPoint>,
        visitedPoints: Array<string>
      ): {
        endPoint: IPoint;
        visitedPoints: Array<string>;
        allowableBounds?: {
          from: IPoint;
          to: IPoint;
        };
      } => {
        const potentialLeftIds = new Set([...perimeterPoints.keys()]);

        const idsToLeft = determineLeftSideCoordinates(
          potentialLeftIds,
          perimeterPoints,
          startPoint.coordinates,
          initialEndPoint.coordinates
        );

        if (!idsToLeft) {
          return { endPoint, visitedPoints };
        }

        visitedPoints.push(endPoint.currentImgPointId);

        const visitedToLeft = [...idsToLeft].some((leftId) => {
          visitedPoints.includes(leftId);
        });

        if (visitedToLeft) {
          const updatedEndPoint = perimeterPoints.get(endPoint.nextImgPointId)!;

          return identifyFillableMultiCrevice(
            startPoint,
            updatedEndPoint,
            perimeterPoints,
            visitedPoints
          );
        }

        const edgePoints = visitedPoints.map((visitedPointId, idx, arr) => {
          const fromPoint = perimeterPoints.get(visitedPointId)!;
          const toPoint = perimeterPoints.get(fromPoint.nextImgPointId)!;

          return {
            from: fromPoint,
            to: toPoint,
          };
        });

        // perhaps adding visited too early
        edgePoints.pop();

        const minImage = getMinimumImage()!;
        const { image, minDimension } = minImage;

        const awayDimension =
          image.width === minDimension ? image.width : image.height;

        // id wide enough edges

        const wideEnoughs = edgePoints.filter(({ from, to }) => {
          const edgeDist = distanceBetweenCoordinates(
            from.coordinates,
            to.coordinates
          );

          return edgeDist > minDimension;
        });

        if (wideEnoughs.length === 0) {
          return { endPoint, visitedPoints };
        }

        // find a edge that perpendicular wont hit the new crevice top
        // left, right, mid

        const highEnough = wideEnoughs.find(({ from, to }) => {
          const edgeDist = distanceBetweenCoordinates(
            from.coordinates,
            to.coordinates
          );

          const awayArr = [
            { fromAway: 2, toAway: 2 + awayDimension },
            { fromAway: edgeDist - 2 - awayDimension, toAway: edgeDist - 2 },
            {
              fromAway: edgeDist / 2 - awayDimension / 2,
              toAway: edgeDist / 2 + awayDimension / 2,
            },
          ];

          const fillableBounds = awayArr.find(({ fromAway, toAway }, idx) => {
            const fromAwayPerp = calculatePerpendicular(
              from.coordinates,
              to.coordinates,
              fromAway,
              awayDimension
            );
            const toAwayPerp = calculatePerpendicular(
              from.coordinates,
              to.coordinates,
              toAway,
              awayDimension
            );

            const fromAwayLeft = isCoordinateLeftOfEdge(
              startPoint.coordinates,
              endPoint.coordinates,
              fromAwayPerp.coordinates,
              0
            );
            const toAwayLeft = isCoordinateLeftOfEdge(
              startPoint.coordinates,
              endPoint.coordinates,
              toAwayPerp.coordinates,
              0
            );

            return !fromAwayLeft && !toAwayLeft;
          });

          return fillableBounds !== undefined;
        });

        return { endPoint, visitedPoints, allowableBounds: highEnough };
      };

      return identifyFillableMultiCrevice(
        startPoint,
        initialEndPoint,
        perimeterPoints,
        visitedPoints
      );

      // if(!allowableBounds){

      //   // refine perimeter removing all multi crevice points
      //   // return new perimeter
      //   return
      // }

      // // do same as above but return bounds for filling

      // return allowableBounds
    };

    const unfillableStartPoint = agglomeratedImgPerimeter.get(
      unfillableCrevices[0].preCrevicePointId
    )!;
    const crevPoint = agglomeratedImgPerimeter.get(
      unfillableStartPoint.nextImgPointId
    )!;
    const unfillableEndPoint = agglomeratedImgPerimeter.get(
      crevPoint.nextImgPointId
    )!;

    const fillableBounds = handleUnfillableArea(
      unfillableStartPoint,
      unfillableEndPoint,
      agglomeratedImgPerimeter
    );

    const crevPtsToRemove = fillableBounds.visitedPoints.filter((ptId) => {
      return (
        ptId !== unfillableStartPoint.currentImgPointId &&
        ptId !== fillableBounds.endPoint.currentImgPointId
      );
    });

    crevPtsToRemove.push(crevPoint.currentImgPointId);

    crevPtsToRemove.forEach((ptId) => {
      agglomeratedImgPerimeter.delete(ptId);
    });

    // prbs best delete and set
    unfillableStartPoint.nextImgPointId =
      fillableBounds.endPoint.currentImgPointId;

    if (!fillableBounds.allowableBounds) {
      // our work here is done?
      // only handled 1 area need to recurse

      // be wary, handing forward a mutated map
      return determineClearanceAreas(
        agglomeratedImgPerimeter,
        clearanceWidth,
        getMinimumImage
      );
    }

    // be wary, handing forward a mutated map
    return determineClearanceAreas(
      agglomeratedImgPerimeter,
      clearanceWidth,
      getMinimumImage
    );

    // //fill the unfillable and then do all again

    // allClearanceAreas.push(...clearanceAreas);

    // return agglomeratedImgPerimeter;

    // // // need to only do this if we area actually filling the crevices
    // // // do a 'can we get something in there' conditional
    // // const filledPerimeter = replaceCrevicePointWithClearanceArea(
    // //   agglomeratedImgPerimeter,
    // //   clearanceAreas
    // // );

    // // return determineClearanceAreas(filledPerimeter, clearanceWidth);
  };

  return {
    allClearanceAreas,
    determineClearanceAreas,
  };
};

export const fillCrevices = (
  agglomeratedImgPerimeter: Map<string, IPoint>,
  clearanceWidth: number,
  getMinimumImage: () => MinImage | undefined
) => {
  const { allClearanceAreas, determineClearanceAreas } = fillCrevicesClosure();

  const filledPerimeter = determineClearanceAreas(
    agglomeratedImgPerimeter,
    clearanceWidth,
    getMinimumImage
  );

  return { allClearanceAreas, filledPerimeter };
};

const clearanceAreasFromPerimeter = (
  latestImgPerimeter: Map<string, IPoint>,
  clearanceWidth: number,
  clearanceHeight: number
) => {
  const agglomeratedImgEdges = generateEdgesMap(latestImgPerimeter);

  const leftCreviceEdgeIds = findEdgesLeftOfCrevices(agglomeratedImgEdges);

  const coordinatesOfCrevices = findCreviceCoordinates(
    leftCreviceEdgeIds,
    agglomeratedImgEdges
  );

  const definedClearanceAreas = determineCreviceClearanceAreas(
    coordinatesOfCrevices,
    clearanceWidth,
    clearanceHeight
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
  clearanceWidth: number,
  clearanceHeight: number
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

      if (!areas) {
        return undefined;
      }

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

  const tallEnoughAreas = definedClearanceAreas.filter(
    ({ areaCoordinates }) => {
      const { bl, tl, br, tr } = areaCoordinates;

      const leftTallEnough =
        distanceBetweenCoordinates(bl, tl) > clearanceHeight;
      const rightTallEnough =
        distanceBetweenCoordinates(br, tr) > clearanceHeight;

      return leftTallEnough && rightTallEnough;
    }
  );

  return tallEnoughAreas.length === 0 ? undefined : tallEnoughAreas;
};

const replaceCrevicePointWithClearanceArea = (
  perimeter: Map<string, IPoint>,
  clearanceAreas: IClearanceAreaInfo[]
): Map<string, IPoint> => {
  const crevicePointIds = [] as Array<string>;

  const clearanceImgPointsMapsArr = clearanceAreas.map(
    ({ preCrevicePointId, areaCoordinates }) => {
      const { linkedCoordinatesMap, coordinatesMap, brKey, blKey } =
        areaCoordinatesMap(areaCoordinates);

      const linkedClearancePerimeter = imgPointsMapFromCoordinates(
        linkedCoordinatesMap,
        coordinatesMap
      );

      const preCrevicePoint = perimeter.get(preCrevicePointId)!;
      const crevicePointId = preCrevicePoint.nextImgPointId;
      crevicePointIds.push(crevicePointId);
      const postCrevicePointId = perimeter.get(crevicePointId)!.nextImgPointId;

      linkInClearanceArea(
        preCrevicePoint,
        postCrevicePointId,
        preCrevicePointId,
        linkedClearancePerimeter,
        brKey,
        blKey
      );

      return linkedClearancePerimeter;
    }
  );

  // one crevices crevice can be another's pre crevice
  for (const crevicePointId of crevicePointIds) {
    perimeter.delete(crevicePointId);
  }

  const allPointsMap = addMapsToMap(perimeter, clearanceImgPointsMapsArr);

  const newPerimeterPoints = determineCrevicedPerimeterPoints(allPointsMap);

  return newPerimeterPoints;
};

const linkInClearanceArea = (
  preCrevicePoint: IPoint,
  postCrevicePointId: string,
  preCrevicePointId: string,
  linkedAdditionalPerimeter: Map<string, IPoint>,
  brKey: string,
  blKey: string
) => {
  const brPoint = linkedAdditionalPerimeter.get(brKey)!;

  preCrevicePoint.nextImgPointId = blKey;
  brPoint.nextImgPointId = postCrevicePointId;
};

const areaCoordinatesMap = (areaCoordinates: ClearanceArea) => {
  const coordinatesMap = new Map();

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

  return { linkedCoordinatesMap, coordinatesMap, brKey, blKey };
};
