import Sinon from "cypress/types/sinon";
import { coordinatesArrToLinkedPointsMap } from "../perimeter/pointsHelper";
import { IPointsMap } from "../perimeter/pointsTypes";

import { CreateIds } from "./createIds";
import { generateEdgesMap } from "./generateEdgesMap";

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
    const pointsMap = coordinatesArrToLinkedPointsMap([
      { coordinates: { x: 5, y: 5 }, id: 1 },
      { coordinates: { x: 5, y: 5 }, id: 2 },
      { coordinates: { x: 5, y: 5 }, id: 3 },
      { coordinates: { x: 5, y: 5 }, id: 4 },
    ]);

    it("returns coordinates that match the next edge coordinates", () => {
      expectMatchingNextCoordinates(pointsMap);
    });
  });

  describe("rectangle with crevice", () => {
    const pointsMap = coordinatesArrToLinkedPointsMap([
      { coordinates: { x: 10, y: 10 }, id: 1 },
      { coordinates: { x: 12, y: 10 }, id: 2 },
      { coordinates: { x: 15, y: 13 }, id: 3 },
      { coordinates: { x: 17, y: 10 }, id: 4 },
      { coordinates: { x: 20, y: 10 }, id: 5 },
      { coordinates: { x: 20, y: 20 }, id: 6 },
      { coordinates: { x: 10, y: 20 }, id: 7 },
    ]);

    it("returns coordinates that match the next edge coordinates", () => {
      expectMatchingNextCoordinates(pointsMap);
    });
  });

  describe("star shape", () => {
    const pointsMap = coordinatesArrToLinkedPointsMap([
      { coordinates: { x: 10, y: 10 }, id: 1 },
      { coordinates: { x: 12, y: 15 }, id: 2 },
      { coordinates: { x: 20, y: 20 }, id: 3 },
      { coordinates: { x: 10, y: 18 }, id: 4 },
      { coordinates: { x: 0, y: 20 }, id: 5 },
      { coordinates: { x: 8, y: 15 }, id: 6 },
    ]);

    it("returns coordinates that match the next edge coordinates", () => {
      expectMatchingNextCoordinates(pointsMap);
    });
  });
});
