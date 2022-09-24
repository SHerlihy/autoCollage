import { toDecimalPlaces } from "../perimeter/mathHelpers";
import {
  pointPrecursorArrToLinkedPointsMap,
  getPerimeterPointIds,
} from "../perimeter/pointsHelper";
import { ICoordinates, IPointsMap } from "../perimeter/pointsTypes";
import { fillCrevices } from "./fillCrevices";
import { hasMatchingGradient } from "./shapeHelpers";

const expectCoordinatesWithCrevices = (
  expectedCoordinates: Array<ICoordinates | null>,
  initialId: string,
  filledImgPerimeter: IPointsMap
) => {
  let subjectPointId = initialId;

  const filledCreviceIds = expectedCoordinates.map((expectedCoordinate) => {
    const { coordinates, currentImgPointId, nextImgPointId } =
      filledImgPerimeter.get(subjectPointId)!;

    subjectPointId = nextImgPointId;

    if (expectedCoordinate === null) {
      return currentImgPointId;
    }

    const roundedCoordinates = {
      x: toDecimalPlaces(coordinates.x),
      y: toDecimalPlaces(coordinates.y),
    };

    expect(roundedCoordinates).to.deep.equal(expectedCoordinate);

    return currentImgPointId;
  });

  return {
    filledCreviceIds,
    finalId: filledCreviceIds[filledCreviceIds.length - 1],
  };
};

const expectCoordinatesWithinGradient = (
  initialId: string,
  endId: string,
  expectedBetweenPoints: Number,
  filledImgPerimeter: IPointsMap
) => {
  const { coordinates: leftCrevCoordiantes } =
    filledImgPerimeter.get(initialId)!;
  const { coordinates: rightCrevCoordinates } = filledImgPerimeter.get(endId)!;

  const pointIdsBetweenCrevice = getPerimeterPointIds(
    initialId,
    filledImgPerimeter,
    endId
  );

  const amountPointsBetweenCrevice = pointIdsBetweenCrevice.reduce(
    (acc, cur) => {
      const subjectPoint = filledImgPerimeter.get(cur);

      const subjectInLine = hasMatchingGradient(
        leftCrevCoordiantes,
        rightCrevCoordinates,
        subjectPoint!.coordinates
      );

      if (subjectInLine) {
        acc = acc + 1;
      }

      return acc;
    },
    0
  );

  // -1 as counts end point
  expect(amountPointsBetweenCrevice - 1).to.equal(expectedBetweenPoints);
};

describe("fillCrevices", () => {
  describe("single fillable crevice", () => {
    const rectangleTopCreviceCoordinates = [
      { coordinates: { x: 5, y: 5 } },
      { coordinates: { x: 10, y: 5 }, id: "creviceLeft" },
      { coordinates: { x: 12, y: 10 }, id: "creviceBottom" },
      { coordinates: { x: 14, y: 5 }, id: "creviceRight" },
      { coordinates: { x: 20, y: 5 } },
      { coordinates: { x: 20, y: 20 } },
      { coordinates: { x: 5, y: 20 } },
    ];

    it("returns image perimeter without crevice bottom coordinate", () => {
      const imgPerimeter = pointPrecursorArrToLinkedPointsMap(
        rectangleTopCreviceCoordinates
      );

      const { filledPerimeter: filledImgPerimeter } = fillCrevices(
        imgPerimeter,
        1
      );

      const creviceBottomPoint = filledImgPerimeter.get("creviceBottom");

      expect(creviceBottomPoint).to.not.exist;
    });

    it("returns image perimeter with points between crevice top coordinates", () => {
      const expectedCoordinates = [
        { x: 10, y: 5 },
        { x: 11.5, y: 5 },
        { x: 12.5, y: 5 },
        { x: 14, y: 5 },
      ];

      const imgPerimeter = pointPrecursorArrToLinkedPointsMap(
        rectangleTopCreviceCoordinates
      );

      const { filledPerimeter } = fillCrevices(imgPerimeter, 1);

      const { filledCreviceIds, finalId } = expectCoordinatesWithCrevices(
        expectedCoordinates,
        "creviceLeft",
        filledPerimeter
      );

      expect(finalId).to.equal("creviceRight");
    });
  });

  describe("star trek shape", () => {
    const trekShape = [
      { coordinates: { x: 5, y: 20 } },
      { coordinates: { x: 35, y: 5 }, id: "creviceLeft" },
      { coordinates: { x: 10, y: 20 }, id: "creviceBottom" },
      { coordinates: { x: 35, y: 35 }, id: "creviceRight" },
    ];

    it("returns image perimeter without crevice bottom coordinates", () => {
      const imgPerimeter = pointPrecursorArrToLinkedPointsMap(trekShape, "002");

      const { filledPerimeter: filledImgPerimeter } = fillCrevices(
        imgPerimeter,
        1
      );

      const creviceBottomPoint = filledImgPerimeter.get("creviceBottom");

      expect(creviceBottomPoint).to.not.exist;
    });
  });

  describe("crevice close to edge", () => {
    const rectangleCreviceCloseToEdge = [
      { coordinates: { x: 5, y: 5 } },
      { coordinates: { x: 20, y: 5 } },
      { coordinates: { x: 20, y: 30 } },
      { coordinates: { x: 15, y: 35 }, id: "creviceBottom" },
      { coordinates: { x: 20, y: 40 } },
      { coordinates: { x: 5, y: 40 } },
    ];

    it("returns image perimeter without crevice bottom coordinates", () => {
      const imgPerimeter = pointPrecursorArrToLinkedPointsMap(
        rectangleCreviceCloseToEdge,
        "002"
      );

      const { filledPerimeter: filledImgPerimeter } = fillCrevices(
        imgPerimeter,
        1
      );
      const creviceBottomPoint = filledImgPerimeter.get("creviceBottom");

      expect(creviceBottomPoint).to.not.exist;
    });
  });

  describe("multiple unrelated crevices", () => {
    const rectangleWithCrevicedSide = [
      { coordinates: { x: 5, y: 5 } },
      { coordinates: { x: 20, y: 5 } },
      { coordinates: { x: 20, y: 6 }, id: "topCreviceLeft" },
      { coordinates: { x: 8, y: 12 }, id: "topCreviceBottom" },
      { coordinates: { x: 20, y: 18 }, id: "topCreviceRight" },
      { coordinates: { x: 20, y: 20 }, id: "midCreviceLeft" },
      { coordinates: { x: 10, y: 29 }, id: "midCreviceBottom" },
      { coordinates: { x: 20, y: 30 }, id: "midLowCreviceLeftRight" },
      { coordinates: { x: 15, y: 35 }, id: "lowCreviceBottom" },
      { coordinates: { x: 20, y: 40 }, id: "lowCreviceRight" },
      { coordinates: { x: 5, y: 40 } },
    ];

    it("returns image perimeter without crevice bottom coordinates", () => {
      const imgPerimeter = pointPrecursorArrToLinkedPointsMap(
        rectangleWithCrevicedSide,
        "002"
      );

      const { filledPerimeter: filledImgPerimeter } = fillCrevices(
        imgPerimeter,
        1
      );
      const creviceTopBottomPoint = filledImgPerimeter.get("topCreviceBottom");
      const creviceMidBottomPoint = filledImgPerimeter.get("midCreviceBottom");
      const creviceLowBottomPoint = filledImgPerimeter.get("lowCreviceBottom");

      expect(creviceTopBottomPoint).to.not.exist;
      expect(creviceMidBottomPoint).to.not.exist;
      expect(creviceLowBottomPoint).to.not.exist;
    });
  });

  describe("clearance widths requiring multiple fills", () => {
    describe("crevice on x plane", () => {
      const rectangleTopCreviceCoordinates = [
        { coordinates: { x: 50, y: 50 } },
        { coordinates: { x: 51, y: 50 }, id: "creviceLeft" },
        { coordinates: { x: 75, y: 74 }, id: "creviceBottom" },
        { coordinates: { x: 99, y: 50 }, id: "creviceRight" },
        { coordinates: { x: 100, y: 50 } },
        { coordinates: { x: 100, y: 100 } },
        { coordinates: { x: 50, y: 100 } },
      ];

      it("fills twice", () => {
        const imgPerimeter = pointPrecursorArrToLinkedPointsMap(
          rectangleTopCreviceCoordinates
        );

        const { filledPerimeter } = fillCrevices(imgPerimeter, 7);

        expectCoordinatesWithinGradient(
          "creviceLeft",
          "creviceRight",
          6,
          filledPerimeter
        );
      });
      it("fills thrice", () => {
        const imgPerimeter = pointPrecursorArrToLinkedPointsMap(
          rectangleTopCreviceCoordinates
        );

        const { filledPerimeter } = fillCrevices(imgPerimeter, 6);

        expectCoordinatesWithinGradient(
          "creviceLeft",
          "creviceRight",
          10,
          filledPerimeter
        );
      });
    });

    describe("crevice along diagonal edge", () => {
      const diamondTopLeftCreviceCoordinates = [
        { coordinates: { x: 50, y: 75 } },
        { coordinates: { x: 51, y: 74 }, id: "creviceLeft" },
        { coordinates: { x: 74, y: 74 }, id: "creviceBottom" },
        { coordinates: { x: 74, y: 51 }, id: "creviceRight" },
        { coordinates: { x: 75, y: 50 } },
        { coordinates: { x: 100, y: 75 } },
        { coordinates: { x: 75, y: 100 } },
      ];

      // TODO: get diagonals and axis behaving the same
      it("fills twice", () => {
        const imgPerimeter = pointPrecursorArrToLinkedPointsMap(
          diamondTopLeftCreviceCoordinates
        );

        const { filledPerimeter } = fillCrevices(imgPerimeter, 7);

        expectCoordinatesWithinGradient(
          "creviceLeft",
          "creviceRight",
          6,
          filledPerimeter
        );
      });
      it("fills thrice", () => {
        const imgPerimeter = pointPrecursorArrToLinkedPointsMap(
          diamondTopLeftCreviceCoordinates
        );

        const { filledPerimeter } = fillCrevices(imgPerimeter, 4);

        expectCoordinatesWithinGradient(
          "creviceLeft",
          "creviceRight",
          10,
          filledPerimeter
        );
      });
    });
  });

  // describe("consecutive crevices on same plane", () => {});

  // describe("crevice in crevice", () => {});

  // describe("alcove", () => {});
});
