import Sinon from "cypress/types/sinon";
import { IPoint, IPointsMap } from "../perimeter/pointsTypes";

import {
  img1Point1,
  img1Point2,
  img1Point3,
  img1Point4,
  img4Point1,
  img4Point2,
  img4Point3,
  img5Point2,
  img5Point3,
  img5Point4,
  img6Point1,
  img6Point3,
  img6Point4,
} from "../perimeter/imagePointExamples";

import { CreateIds } from "./createIds";
import { IEdgeType, generateEdgesMap, IEdgesMap } from "./generateEdgesMap";

const ascendingArrNumKeyMap = (
  numKeyMap: Map<string, any>
): [string, any][] => {
  return [...numKeyMap.entries()].sort(([curKey], [nextKey]) => {
    return parseInt(curKey) - parseInt(nextKey);
  });
};

describe("generateEdgesMap", () => {
  let generateIdsStub: Sinon.SinonStub<any[], any>;

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
    const pointsMap = new Map<string, IPoint>([
      ["1", img1Point1],
      ["2", img1Point2],
      ["3", img1Point3],
      ["4", img1Point4],
    ]);

    const setupEdgesMap = () => {
      const edge1 = {
        coordinates: {
          from: img1Point1,
          to: img1Point2,
        },
        nextEdge: "2",
        type: { from: "right", to: "right" },
      };

      const edge2 = {
        coordinates: {
          from: img1Point2,
          to: img1Point3,
        },
        nextEdge: "3",
        type: { from: "right", to: "right" },
      };

      const edge3 = {
        coordinates: {
          from: img1Point3,
          to: img1Point4,
        },
        nextEdge: "4",
        type: { from: "right", to: "right" },
      };

      const edge4 = {
        coordinates: {
          from: img1Point4,
          to: img1Point1,
        },
        nextEdge: "1",
        type: { from: "right", to: "right" },
      };

      const expectedEdgesMap = new Map([
        ["1", edge3],
        ["2", edge4],
        ["3", edge1],
        ["4", edge2],
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
        expect(value.type).to.deep.equal({ from: "right", to: "right" });
      }
    });
  });

  describe("rectangle with crevice", () => {
    const topLeft = {
      imgId: "1",
      nextImgPointId: "2",
      coordinates: {
        x: 10,
        y: 10,
      },
    };

    const creviceLeft = {
      imgId: "1",
      nextImgPointId: "3",
      coordinates: {
        x: 12,
        y: 10,
      },
    };

    const creviceBottom = {
      imgId: "1",
      nextImgPointId: "4",
      coordinates: {
        x: 15,
        y: 13,
      },
    };

    const creviceRight = {
      imgId: "1",
      nextImgPointId: "5",
      coordinates: {
        x: 17,
        y: 10,
      },
    };

    const topRight = {
      imgId: "1",
      nextImgPointId: "6",
      coordinates: {
        x: 20,
        y: 10,
      },
    };

    const bottomRight = {
      imgId: "1",
      nextImgPointId: "7",
      coordinates: {
        x: 20,
        y: 20,
      },
    };

    const bottomLeft = {
      imgId: "1",
      nextImgPointId: "1",
      coordinates: {
        x: 10,
        y: 20,
      },
    };

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

      const edgeCreviceLeft = returnedEdgesMap.get("7");
      const edgeCreviceRight = returnedEdgesMap.get("1");

      expect(edgeCreviceLeft?.type).to.deep.equal({
        from: "crevice",
        to: "crevice",
      });
      expect(edgeCreviceRight?.type).to.deep.equal({
        from: "crevice",
        to: "crevice",
      });
    });

    it("identifies correct end angles", () => {
      stubGenerateNovelId(0);

      const returnedEdgesMap = generateEdgesMap(pointsMap);

      for (const [key, value] of returnedEdgesMap) {
        if (key === "7" || key === "1") {
          continue;
        }

        if (key === "6") {
          expect(value.type).to.deep.equal({ from: "right", to: "obtuse" });
          continue;
        }

        if (key === "2") {
          expect(value.type).to.deep.equal({ from: "obtuse", to: "right" });
          continue;
        }

        expect(value.type).to.deep.equal({ from: "right", to: "right" });
      }
    });
  });

  describe("star shape", () => {
    const outerTop = {
      imgId: "1",
      nextImgPointId: "2",
      coordinates: {
        x: 10,
        y: 10,
      },
    };

    const innerRight = {
      imgId: "1",
      nextImgPointId: "3",
      coordinates: {
        x: 12,
        y: 15,
      },
    };

    const outerRight = {
      imgId: "1",
      nextImgPointId: "4",
      coordinates: {
        x: 20,
        y: 20,
      },
    };

    const innerBottom = {
      imgId: "1",
      nextImgPointId: "5",
      coordinates: {
        x: 10,
        y: 18,
      },
    };

    const outerLeft = {
      imgId: "1",
      nextImgPointId: "6",
      coordinates: {
        x: 0,
        y: 20,
      },
    };

    const innerLeft = {
      imgId: "1",
      nextImgPointId: "1",
      coordinates: {
        x: 8,
        y: 15,
      },
    };

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

      const firstToType = returnedEdgesMap.get("1")?.type.to;

      expect(firstToType === "acute" || firstToType === "obtuse");

      for (const [returnedEdgeKey, returnedEdgeValue] of returnedEdgesMap) {
        const nextReturnedEdgeValue = returnedEdgesMap.get(
          returnedEdgeValue.nextEdge
        );
        expect(returnedEdgeValue.type.to).to.equal(
          nextReturnedEdgeValue?.type.from
        );
      }
    });
  });
});
