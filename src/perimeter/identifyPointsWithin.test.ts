import { identifyPointsInRectangle } from "./identifyPointsWithin";
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
});
