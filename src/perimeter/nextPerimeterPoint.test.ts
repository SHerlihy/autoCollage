import { determineNextPoint } from "./nextPerimeterPoint";

describe("nextPerimeterPoint", () => {
  const pointA = { x: 10, y: 15 };
  const pointB = { x: 15, y: 20 };

  it("returns the next given point if no others in offset area", () => {
    const pointOrphan = { x: 50, y: 50 };

    const allOtherPoints = [pointOrphan];
    const nextPoint = determineNextPoint(pointA, pointB, 3, allOtherPoints);

    expect(nextPoint).to.equal(pointB);
  });

  describe("point between given points", () => {
    it("returns the point between the given points", () => {
      const pointInterrupt = { x: 12, y: 17 };

      const allOtherPoints = [pointInterrupt];
      const nextPoint = determineNextPoint(pointA, pointB, -3, allOtherPoints);

      expect(nextPoint).to.equal(pointInterrupt);
    });

    it("returns the point in offset area above the given points", () => {
      const pointInterrupt = { x: 12, y: 16 };

      const allOtherPoints = [pointInterrupt];
      const nextPoint = determineNextPoint(pointA, pointB, 3, allOtherPoints);

      expect(nextPoint).to.equal(pointInterrupt);
    });

    it("returns the point in offset area below the given points", () => {
      const pointInterrupt = { x: 11, y: 17 };

      const allOtherPoints = [pointInterrupt];
      const nextPoint = determineNextPoint(pointA, pointB, -3, allOtherPoints);

      expect(nextPoint).to.equal(pointInterrupt);
    });

    describe("point outside given points", () => {
      it("returns point in offset to the left of given points", () => {
        const pointInterrupt = { x: 9, y: 13 };

        const allOtherPoints = [pointInterrupt];
        const nextPoint = determineNextPoint(pointA, pointB, 3, allOtherPoints);

        expect(nextPoint).to.equal(pointInterrupt);
      });
      it("returns point in offset to the right of given points", () => {
        const pointInterrupt = { x: 16, y: 22 };

        const allOtherPoints = [pointInterrupt];
        const nextPoint = determineNextPoint(
          pointA,
          pointB,
          -3,
          allOtherPoints
        );

        expect(nextPoint).to.equal(pointInterrupt);
      });
    });
  });
});
