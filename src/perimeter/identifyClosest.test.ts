import { identifyClosestCoordinateToCoordinate } from "./identifyClosest";
import { coordinatesToDummyPoints, coordinatesToPoint } from "./pointsHelper";
import { ICoordinates, IPointsMap } from "./pointsTypes";

describe("identifyClosestCoordinateToCoordinate", () => {
  const midPoint = coordinatesToPoint(
    { x: 100, y: 100 },
    "001",
    "pointB",
    "noPrevPoint"
  );

  const principleCoordinate = { x: 100, y: 100 };

  const runTest = (
    nextCoordinates: ICoordinates,
    otherPoints: IPointsMap,
    expectedCoordinates: ICoordinates
  ) => {
    const nextPoint = coordinatesToPoint(
      nextCoordinates,
      "001",
      "nextPoint",
      "alsoNoPrevPoint"
    );

    const allPoints = new Map([
      ...otherPoints,
      [nextPoint.currentImgPointId, nextPoint],
    ]);

    const allIds = new Set([...allPoints.keys()]);

    const closestId = identifyClosestCoordinateToCoordinate(
      principleCoordinate,
      "nextPoint",
      allIds,
      allPoints
    );

    const closestPoint = allPoints.get(closestId);

    expect(closestPoint?.coordinates).to.deep.equal(expectedCoordinates);
  };

  describe("coordinates on same gradient", () => {
    describe("coordinates along axis", () => {
      const upDownPoints = coordinatesToDummyPoints([
        { x: 100, y: 79 },
        { x: 100, y: 84 },
        { x: 100, y: 89 },
        { x: 100, y: 94 },
        { x: 100, y: 105 },
        { x: 100, y: 110 },
        { x: 100, y: 115 },
        { x: 100, y: 120 },
      ]);

      const leftRightPoints = coordinatesToDummyPoints([
        { x: 79, y: 100 },
        { x: 84, y: 100 },
        { x: 89, y: 100 },
        { x: 94, y: 100 },
        { x: 105, y: 100 },
        { x: 110, y: 100 },
        { x: 115, y: 100 },
        { x: 120, y: 100 },
      ]);
      it("going up returns closest", () => {
        runTest({ x: 100, y: 86 }, upDownPoints, { x: 100, y: 105 });
      });
      it("going down returns closest", () => {
        runTest({ x: 100, y: 116 }, upDownPoints, { x: 100, y: 105 });
      });
      it("going left returns closest", () => {
        runTest({ x: 86, y: 100 }, leftRightPoints, { x: 105, y: 100 });
      });
      it("going right returns closest", () => {
        runTest({ x: 116, y: 100 }, leftRightPoints, { x: 105, y: 100 });
      });
    });

    describe("coordinates along diagonals", () => {
      const forwardSlashPoints = coordinatesToDummyPoints([
        { x: 85, y: 85 },
        { x: 90, y: 90 },
        { x: 95, y: 95 },
        { x: 106, y: 106 },
        { x: 111, y: 111 },
        { x: 116, y: 116 },
      ]);

      const backSlashPoints = coordinatesToDummyPoints([
        { x: 115, y: 85 },
        { x: 110, y: 90 },
        { x: 105, y: 95 },
        { x: 96, y: 106 },
        { x: 91, y: 111 },
        { x: 86, y: 116 },
      ]);

      it("going top right returns closest", () => {
        runTest({ x: 114, y: 86 }, backSlashPoints, { x: 105, y: 95 });
      });
      it("going low left returns closest", () => {
        runTest({ x: 86, y: 114 }, backSlashPoints, { x: 105, y: 95 });
      });
      it("going top left returns closest", () => {
        runTest({ x: 86, y: 86 }, forwardSlashPoints, { x: 95, y: 95 });
      });
      it("going low right returns closest", () => {
        runTest({ x: 114, y: 114 }, forwardSlashPoints, { x: 95, y: 95 });
      });
    });
  });
});
