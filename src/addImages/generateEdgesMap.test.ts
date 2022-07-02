import Sinon from "cypress/types/sinon";
import { IPoint, IPointsMap } from "../perimeter/pointsTypes";

import { CreateIds } from "./createIds";
import {
  generateEdgesMap,
  IEdgesMap,
  IEdge,
  AngleType,
  ITypedPoint,
} from "./generateEdgesMap";

describe("generateEdgesMap", () => {
  let generateIdsStub: Sinon.SinonStub<any[], any>;

  const createDummyPoint = (
    imageId: number,
    nextImagePointId: number,
    x: number,
    y: number
  ) => {
    return {
      imgId: `${imageId}`,
      nextImgPointId: `${nextImagePointId}`,
      coordinates: { x, y },
    } as IPoint;
  };

  const createDummyEdge = (
    nextEdge: string,
    fromPoint: ITypedPoint,
    toPoint: ITypedPoint
  ) => {
    return {
      nextEdge,
      points: {
        from: fromPoint,
        to: toPoint,
      },
    };
  };

  const incrementClosure = (initVal: number) => {
    let value = initVal;

    const nextVal = (): string => {
      value++;

      return `${value}`;
    };

    return nextVal;
  };

  const stubGenerateNovelId = (initVal: number) => {
    const nextStubbedId = incrementClosure(initVal);

    generateIdsStub = cy
      .stub(CreateIds.getInstance(), "generateNovelId")
      .callsFake(nextStubbedId);
  };

  const expectMatchingNextCoordinates = (pointsMap: IPointsMap) => {
    stubGenerateNovelId(0);

    const returnedEdgesMap = generateEdgesMap(pointsMap);

    for (const [returnedEdgeKey, returnedEdgeValue] of returnedEdgesMap) {
      const nextReturnedEdgeValue = returnedEdgesMap.get(
        returnedEdgeValue.nextEdge
      );
      expect(returnedEdgeValue.points.to).to.deep.equal(
        nextReturnedEdgeValue?.points.from
      );
    }
  };

  describe("perimeter of an image", () => {
    const img1Point1 = createDummyPoint(1, 2, 5, 5);
    const img1Point2 = createDummyPoint(1, 3, 10, 5);
    const img1Point3 = createDummyPoint(1, 4, 10, 10);
    const img1Point4 = createDummyPoint(1, 1, 5, 10);

    const pointsMap = new Map<string, IPoint>([
      ["1", img1Point1],
      ["2", img1Point2],
      ["3", img1Point3],
      ["4", img1Point4],
    ]);

    const createTypedPoint = (dummyPoint: IPoint, type: AngleType) => {
      const typedPoint: Partial<ITypedPoint> & Omit<ITypedPoint, "type"> = {
        ...dummyPoint,
      };

      typedPoint["type"] = type;

      return typedPoint as ITypedPoint;
    };

    const setupEdgesMap = () => {
      const edge1 = createDummyEdge(
        "2",
        createTypedPoint(img1Point1, "right"),
        createTypedPoint(img1Point2, "right")
      );

      const edge2 = createDummyEdge(
        "3",
        createTypedPoint(img1Point2, "right"),
        createTypedPoint(img1Point3, "right")
      );

      const edge3 = createDummyEdge(
        "4",
        createTypedPoint(img1Point3, "right"),
        createTypedPoint(img1Point4, "right")
      );

      const edge4 = createDummyEdge(
        "1",
        createTypedPoint(img1Point4, "right"),
        createTypedPoint(img1Point1, "right")
      );

      const expectedEdgesMap = new Map([
        ["4", edge1],
        ["1", edge2],
        ["2", edge3],
        ["3", edge4],
      ]) as IEdgesMap;

      return expectedEdgesMap;
    };

    it("returns coordinates that match the next edge coordinates", () => {
      expectMatchingNextCoordinates(pointsMap);
    });

    it("returns an edges map", () => {
      stubGenerateNovelId(0);

      const expectedEdgesMap = setupEdgesMap();

      const returnedEdgesMap = generateEdgesMap(pointsMap);

      for (const [expectedEdgeId, expectedEdgeValue] of expectedEdgesMap) {
        const returnedEdgeValue = returnedEdgesMap.get(expectedEdgeId);
        expect(returnedEdgeValue?.points).to.deep.equal(
          expectedEdgeValue.points
        );
      }
    });

    it("returns all right angles as both obtuse", () => {
      stubGenerateNovelId(0);

      const returnedEdgesMap = generateEdgesMap(pointsMap);

      for (const [_key, value] of returnedEdgesMap) {
        expect(value.points.from.type).to.equal("right");
        expect(value.points.to.type).to.equal("right");
      }
    });
  });

  // feel like could move angle identification into own file
  describe("rectangle with crevice", () => {
    const topLeft = createDummyPoint(1, 2, 10, 10);
    const creviceLeft = createDummyPoint(1, 3, 12, 10);
    const creviceBottom = createDummyPoint(1, 4, 15, 13);
    const creviceRight = createDummyPoint(1, 5, 17, 10);
    const topRight = createDummyPoint(1, 6, 20, 10);
    const bottomRight = createDummyPoint(1, 7, 20, 20);
    const bottomLeft = createDummyPoint(1, 1, 10, 20);

    const pointsMap = new Map<string, IPoint>([
      ["1", topLeft],
      ["2", creviceLeft],
      ["3", creviceBottom],
      ["4", creviceRight],
      ["5", topRight],
      ["6", bottomRight],
      ["7", bottomLeft],
    ]);

    it("returns coordinates that match the next edge coordinates", () => {
      expectMatchingNextCoordinates(pointsMap);
    });

    it("returns one crevice", () => {
      stubGenerateNovelId(0);

      const returnedEdgesMap = generateEdgesMap(pointsMap);

      const edgeCreviceLeft = returnedEdgesMap.get("1");
      const edgeCreviceRight = returnedEdgesMap.get("2");

      expect(edgeCreviceLeft?.points.from.type).to.equal("crevice");
      expect(edgeCreviceLeft?.points.to.type).to.equal("crevice");
      expect(edgeCreviceRight?.points.from.type).to.equal("crevice");
      expect(edgeCreviceRight?.points.to.type).to.equal("obtuse");
    });

    it("identifies correct end angles", () => {
      stubGenerateNovelId(0);

      const returnedEdgesMap = generateEdgesMap(pointsMap);

      for (const [key, value] of returnedEdgesMap) {
        switch (key) {
          case "4":
          case "5":
          case "6":
          case "7":
            expect(value.points.from.type).to.equal("right");
            break;
          case "1":
          case "2":
            expect(value.points.from.type).to.equal("crevice");
            break;
          case "3":
            expect(value.points.from.type).to.equal("obtuse");
            break;
          default:
            throw new Error("edge key beyond expectations");
        }
      }
    });
  });

  describe("star shape", () => {
    const outerTop = createDummyPoint(1, 2, 10, 10);
    const innerRight = createDummyPoint(1, 3, 12, 15);
    const outerRight = createDummyPoint(1, 4, 20, 20);
    const innerBottom = createDummyPoint(1, 5, 10, 18);
    const outerLeft = createDummyPoint(1, 6, 0, 20);
    const innerLeft = createDummyPoint(1, 1, 8, 15);

    const pointsMap = new Map<string, IPoint>([
      ["1", outerTop],
      ["2", innerRight],
      ["3", outerRight],
      ["4", innerBottom],
      ["5", outerLeft],
      ["6", innerLeft],
    ]);

    it("returns coordinates that match the next edge coordinates", () => {
      expectMatchingNextCoordinates(pointsMap);
    });

    it("returns all right angles as crevice", () => {
      stubGenerateNovelId(0);

      const returnedEdgesMap = generateEdgesMap(pointsMap);

      for (const [key, typedEdge] of returnedEdgesMap) {
        if (+key % 2) {
          expect(typedEdge.points.from.type).to.equal("obtuse");
        } else {
          expect(typedEdge.points.from.type).to.equal("acute");
        }
      }
    });
  });
});
