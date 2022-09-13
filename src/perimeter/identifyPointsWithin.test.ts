import {
  identifyPointIdsWithinBounds,
  identifyPointsInRectangle,
} from "./identifyPointsWithin";
import { coordinatesToDummyPoints } from "./pointsHelper";

describe("identifyPointsInRectangle", () => {
  const topLeft = { x: 50, y: 50 };
  const lowRight = { x: 150, y: 150 };
  describe("points within rectangle", () => {
    it("returns point ids of points in corners", () => {
      const pointsWithinCorners = coordinatesToDummyPoints([
        { x: 51, y: 51 },
        { x: 149, y: 51 },
        { x: 149, y: 149 },
        { x: 51, y: 149 },
      ]);
      const internalPoints = identifyPointsInRectangle(
        topLeft,
        lowRight,
        pointsWithinCorners
      );

      expect(internalPoints).to.exist;

      for (const [pointInCornerId] of pointsWithinCorners) {
        const validatedPoint = internalPoints?.has(pointInCornerId);
        expect(validatedPoint).to.be.true;
      }
    });

    it("returns point ids of internal points along axis", () => {
      const pointsAlongAxis = coordinatesToDummyPoints([
        { x: 100, y: 100 },
        { x: 100, y: 51 },
        { x: 100, y: 149 },
        { x: 51, y: 100 },
        { x: 149, y: 100 },
      ]);
      const internalPoints = identifyPointsInRectangle(
        topLeft,
        lowRight,
        pointsAlongAxis
      );

      expect(internalPoints).to.exist;

      for (const [pointInCornerId] of pointsAlongAxis) {
        const validatedPoint = internalPoints?.has(pointInCornerId);
        expect(validatedPoint).to.be.true;
      }
    });
    it("returns point ids of points on corners", () => {
      const pointsOnCorners = coordinatesToDummyPoints([
        topLeft,
        lowRight,
        { x: 150, y: 50 },
        { x: 50, y: 150 },
      ]);
      const internalPoints = identifyPointsInRectangle(
        topLeft,
        lowRight,
        pointsOnCorners
      );

      expect(internalPoints).to.exist;

      for (const [pointInCornerId] of pointsOnCorners) {
        const validatedPoint = internalPoints?.has(pointInCornerId);
        expect(validatedPoint).to.be.true;
      }
    });
    it("returns point ids of points along rectangle edges", () => {
      const pointsAlongEdges = coordinatesToDummyPoints([
        { x: 70, y: 50 },
        { x: 100, y: 50 },
        { x: 130, y: 50 },
        { x: 150, y: 70 },
        { x: 150, y: 100 },
        { x: 150, y: 130 },
        { x: 70, y: 150 },
        { x: 100, y: 150 },
        { x: 130, y: 150 },
        { x: 50, y: 70 },
        { x: 50, y: 100 },
        { x: 50, y: 130 },
      ]);
      const internalPoints = identifyPointsInRectangle(
        topLeft,
        lowRight,
        pointsAlongEdges
      );

      expect(internalPoints).to.exist;

      for (const [pointInCornerId] of pointsAlongEdges) {
        const validatedPoint = internalPoints?.has(pointInCornerId);
        expect(validatedPoint).to.be.true;
      }
    });
  });
  describe("points beyonds rectangle", () => {
    it("returns no point ids beyond corners", () => {
      const topLeftCoordinates = [
        { x: 49, y: 50 },
        { x: 49, y: 49 },
        { x: 50, y: 49 },
      ];
      const topRightCoordinates = [
        { x: 150, y: 49 },
        { x: 151, y: 49 },
        { x: 151, y: 50 },
      ];
      const lowRightCoordinates = [
        { x: 151, y: 150 },
        { x: 151, y: 151 },
        { x: 150, y: 151 },
      ];
      const lowLeftCoordinates = [
        { x: 50, y: 151 },
        { x: 49, y: 151 },
        { x: 49, y: 150 },
      ];
      const pointsBeyondCorners = coordinatesToDummyPoints([
        ...topLeftCoordinates,
        ...topRightCoordinates,
        ...lowRightCoordinates,
        ...lowLeftCoordinates,
      ]);
      const internalPoints = identifyPointsInRectangle(
        topLeft,
        lowRight,
        pointsBeyondCorners
      );

      expect(internalPoints).to.not.exist;
    });
    it("returns no point ids beyond edges", () => {
      const leftCoordinates = [
        { x: 49, y: 70 },
        { x: 49, y: 100 },
        { x: 49, y: 130 },
      ];
      const topCoordinates = [
        { x: 70, y: 49 },
        { x: 100, y: 49 },
        { x: 130, y: 49 },
      ];
      const rightCoordinates = [
        { x: 151, y: 70 },
        { x: 151, y: 100 },
        { x: 151, y: 130 },
      ];
      const lowCoordinates = [
        { x: 70, y: 151 },
        { x: 100, y: 151 },
        { x: 130, y: 151 },
      ];
      const pointsBeyondCorners = coordinatesToDummyPoints([
        ...leftCoordinates,
        ...topCoordinates,
        ...rightCoordinates,
        ...lowCoordinates,
      ]);
      const internalPoints = identifyPointsInRectangle(
        topLeft,
        lowRight,
        pointsBeyondCorners
      );

      expect(internalPoints).to.not.exist;
    });
  });
});

describe("identifyPointIdsWithinBounds", () => {
  const diamondBounds = [
    { x: 100, y: 150 },
    { x: 150, y: 100 },
    { x: 100, y: 50 },
    { x: 50, y: 100 },
  ];
  describe("diamond shape", () => {
    describe("points within bounds", () => {
      it("returns point ids of points within corners", () => {
        const pointsWithinCorners = coordinatesToDummyPoints([
          { x: 51, y: 100 },
          { x: 100, y: 51 },
          { x: 149, y: 100 },
          { x: 100, y: 149 },
        ]);
        const pointIds = new Set([...pointsWithinCorners.keys()]);

        const internalPoints = identifyPointIdsWithinBounds(
          diamondBounds,
          pointIds,
          pointsWithinCorners
        );

        expect(internalPoints).to.exist;

        for (const pointId of pointIds) {
          const validatedPoint = internalPoints?.has(pointId);
          expect(validatedPoint).to.be.true;
        }
      });
      it("returns point ids of internal points along diagonals", () => {
        const pointsAlongDiagonals = coordinatesToDummyPoints([
          { x: 100, y: 100 },
          { x: 76, y: 76 },
          { x: 124, y: 76 },
          { x: 124, y: 124 },
          { x: 76, y: 124 },
        ]);
        const pointIds = new Set([...pointsAlongDiagonals.keys()]);

        const internalPoints = identifyPointIdsWithinBounds(
          diamondBounds,
          pointIds,
          pointsAlongDiagonals
        );

        expect(internalPoints).to.exist;

        for (const pointId of pointIds) {
          const validatedPoint = internalPoints?.has(pointId);
          expect(validatedPoint).to.be.true;
        }
      });
      it("returns point ids of points on corners", () => {
        debugger;
        const pointsOnCorners = coordinatesToDummyPoints([
          { x: 50, y: 100 },
          { x: 100, y: 50 },
          { x: 150, y: 100 },
          { x: 100, y: 150 },
        ]);
        const pointIds = new Set([...pointsOnCorners.keys()]);

        const internalPoints = identifyPointIdsWithinBounds(
          diamondBounds,
          pointIds,
          pointsOnCorners
        );

        expect(internalPoints).to.exist;

        for (const pointId of pointIds) {
          const validatedPoint = internalPoints?.has(pointId);
          expect(validatedPoint).to.be.true;
        }
      });
      it("returns point ids of points along edges", () => {
        const pointsAlongEdges = coordinatesToDummyPoints([
          { x: 55, y: 95 },
          { x: 75, y: 75 },
          { x: 95, y: 55 },
          { x: 105, y: 55 },
          { x: 125, y: 75 },
          { x: 145, y: 95 },
          { x: 145, y: 105 },
          { x: 125, y: 125 },
          { x: 105, y: 145 },
          { x: 95, y: 145 },
          { x: 75, y: 125 },
          { x: 55, y: 105 },
        ]);
        const pointIds = new Set([...pointsAlongEdges.keys()]);

        const internalPoints = identifyPointIdsWithinBounds(
          diamondBounds,
          pointIds,
          pointsAlongEdges
        );

        expect(internalPoints).to.exist;

        for (const pointId of pointIds) {
          const validatedPoint = internalPoints?.has(pointId);
          expect(validatedPoint).to.be.true;
        }
      });
    });
    describe("points beyonds bounds", () => {
      it("returns no point ids beyonds corners", () => {
        const pointsOnCorners = coordinatesToDummyPoints([
          { x: 50, y: 99 },
          { x: 49, y: 100 },
          { x: 50, y: 101 },

          { x: 99, y: 50 },
          { x: 100, y: 49 },
          { x: 101, y: 50 },

          { x: 150, y: 99 },
          { x: 151, y: 100 },
          { x: 150, y: 101 },

          { x: 101, y: 150 },
          { x: 100, y: 151 },
          { x: 99, y: 150 },
        ]);
        const pointIds = new Set([...pointsOnCorners.keys()]);

        const internalPoints = identifyPointIdsWithinBounds(
          diamondBounds,
          pointIds,
          pointsOnCorners
        );

        expect(internalPoints).to.not.exist;
      });
      it("returns on point ids beyond edges", () => {
        const coordinatesBeyondTopLeft = [
          { x: 55, y: 94 },
          { x: 74, y: 74 },
          { x: 94, y: 55 },
        ];

        const coordinatesBeyondTopRight = [
          { x: 106, y: 55 },
          { x: 126, y: 74 },
          { x: 145, y: 94 },
        ];

        const coordinatesBeyondLowLeft = [
          { x: 145, y: 106 },
          { x: 126, y: 126 },
          { x: 106, y: 145 },
        ];

        const coordinatesBeyondLowRight = [
          { x: 94, y: 145 },
          { x: 74, y: 126 },
          { x: 55, y: 106 },
        ];

        const pointsBeyondEdges = coordinatesToDummyPoints([
          ...coordinatesBeyondTopLeft,
          ...coordinatesBeyondTopRight,
          ...coordinatesBeyondLowLeft,
          ...coordinatesBeyondLowRight,
        ]);
        const pointIds = new Set([...pointsBeyondEdges.keys()]);

        const internalPoints = identifyPointIdsWithinBounds(
          diamondBounds,
          pointIds,
          pointsBeyondEdges
        );

        expect(internalPoints).to.not.exist;
      });
    });
  });
});
