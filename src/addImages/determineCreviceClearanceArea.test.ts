import { ICoordinates } from "../perimeter/pointsTypes";
import {
  determineCreviceClearanceArea,
  ClearanceArea,
} from "./determineCreviceClearanceArea";

describe("assignImgsToEdges", () => {
  const expectClearanceCoordinatesFromCreviceCoordinates = (
    creviceTL: ICoordinates,
    creviceBottom: ICoordinates,
    creviceTR: ICoordinates,
    minWidth: number,
    expectedClearanceCoordinates: ClearanceArea
  ) => {
    const returnedClearanceCoordinates = determineCreviceClearanceArea(
      creviceTL,
      creviceBottom,
      creviceTR,
      minWidth
    );

    expect(returnedClearanceCoordinates).to.not.equal(undefined);

    if (!returnedClearanceCoordinates) return;

    for (const [expectedKey, expectedCoordinates] of Object.entries(
      expectedClearanceCoordinates
    )) {
      const { x: expectedX, y: expectedY } = expectedCoordinates;
      const { x: returnedX, y: returnedY } =
        returnedClearanceCoordinates[expectedKey];

      expect(returnedX.toFixed(3)).to.equal(expectedX.toFixed(3));
      expect(returnedY.toFixed(3)).to.equal(expectedY.toFixed(3));
    }
  };
  describe("right angle isosceles crevices ", () => {
    it("returns expected coordinates for upward facing", () => {
      const expectedClearanceCoordinates = {
        tl: { x: 10, y: 5 },
        tr: { x: 12, y: 5 },
        br: { x: 12, y: 9 },
        bl: { x: 10, y: 9 },
      };

      const creviceTL = { x: 6, y: 5 };
      const creviceBottom = { x: 11, y: 10 };
      const creviceTR = { x: 16, y: 5 };

      const minWidth = 2;

      expectClearanceCoordinatesFromCreviceCoordinates(
        creviceTL,
        creviceBottom,
        creviceTR,
        minWidth,
        expectedClearanceCoordinates
      );
    });

    it("returns expected coordinates for isosceles downward facing crevice", () => {
      const expectedClearanceCoordinates = {
        tl: { x: 12, y: 15 },
        tr: { x: 10, y: 15 },
        br: { x: 10, y: 11 },
        bl: { x: 12, y: 11 },
      };

      const creviceTL = { x: 16, y: 15 };
      const creviceBottom = { x: 11, y: 10 };
      const creviceTR = { x: 6, y: 15 };

      const minWidth = 2;

      expectClearanceCoordinatesFromCreviceCoordinates(
        creviceTL,
        creviceBottom,
        creviceTR,
        minWidth,
        expectedClearanceCoordinates
      );
    });
  });

  describe("right angle non-isosceles crevices", () => {
    it("returns expected coordinates for upward facing", () => {
      const expectedClearanceCoordinates = {
        tl: { x: 10, y: 4.077 },
        tr: { x: 12, y: 3.615 },
        br: { x: 12, y: 9 },
        bl: { x: 10, y: 9 },
      };

      const creviceTL = { x: 6, y: 5 };
      const creviceBottom = { x: 11, y: 10 };
      const creviceTR = { x: 19, y: 2 };

      const minWidth = 2;

      expectClearanceCoordinatesFromCreviceCoordinates(
        creviceTL,
        creviceBottom,
        creviceTR,
        minWidth,
        expectedClearanceCoordinates
      );
    });
  });

  describe("scalene crevices", () => {});
});
