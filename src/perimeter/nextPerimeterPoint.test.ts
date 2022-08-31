import { createImgPerimeterFromOrderedCoordinates } from "../testHelperFunctions";
import { determineNextPoint } from "./nextPerimeterPoint";
import { ICoordinates, IPoint } from "./pointsTypes";

const coordinatesToPoint = (
  coordinates: ICoordinates,
  imgId: string,
  currentImgPointId: string,
  nextImgPointId: string
) => {
  return {
    imgId,
    currentImgPointId,
    nextImgPointId,
    coordinates,
  } as IPoint;
};

const setupPoints = (
  coordinatesB: ICoordinates,
  otherCoordinates: ICoordinates[]
) => {
  const { imgPerimeter: allPoints } = createImgPerimeterFromOrderedCoordinates(
    "001",
    otherCoordinates
  );

  const pointAPredecessor = [...allPoints.values()][allPoints.size - 1];
  const pointBSuccessor = [...allPoints.values()][0];

  allPoints.get(pointAPredecessor.currentImgPointId)!.nextImgPointId = "pointA";

  const pointB = coordinatesToPoint(
    coordinatesB,
    "001",
    "pointB",
    pointBSuccessor.currentImgPointId
  );

  allPoints.set(pointB.currentImgPointId, pointB);

  return {
    allPoints,
    pointB,
  };
};

const runDetermineNextPoint = (
  coordinatesA: ICoordinates,
  coordinatesB: ICoordinates,
  interruptCoordinates: ICoordinates,
  fillerCoordinates?: ICoordinates[]
) => {
  const allOtherCoordinates = fillerCoordinates
    ? [interruptCoordinates, ...fillerCoordinates]
    : [interruptCoordinates];

  const { allPoints, pointB } = setupPoints(coordinatesB, allOtherCoordinates);

  const nextPoint = determineNextPoint(
    coordinatesA,
    pointB.currentImgPointId,
    allPoints
  );

  const pointInterrupt = [...allPoints.values()].find((point) => {
    return (
      point.coordinates.x === interruptCoordinates.x &&
      point.coordinates.y === interruptCoordinates.y
    );
  });

  return {
    nextPoint,
    pointB,
    pointInterrupt,
  };
};

describe("nextPerimeterPoint", () => {
  const coordinatesA = { x: 10, y: 15 };
  const coordinatesB = { x: 15, y: 20 };

  it("returns the next given point if no others in offset area", () => {
    const orphanCoordinates = { x: 50, y: 50 };

    const { allPoints, pointB } = setupPoints(coordinatesB, [
      orphanCoordinates,
    ]);

    const nextPoint = determineNextPoint(
      coordinatesA,
      pointB.currentImgPointId,
      allPoints
    );

    expect(nextPoint).to.equal(pointB.currentImgPointId);
  });

  describe("inside given points rectangle", () => {
    it("returns the point between the given points", () => {
      const coordinateInterrupt = { x: 12, y: 17 };

      const { allPoints, pointB } = setupPoints(coordinatesB, [
        coordinateInterrupt,
      ]);

      const nextPoint = determineNextPoint(
        coordinatesA,
        pointB.currentImgPointId,
        allPoints
      );

      const pointInterrupt = [...allPoints.values()].find((point) => {
        return (
          point.coordinates.x === coordinateInterrupt.x &&
          point.coordinates.y === coordinateInterrupt.y
        );
      });

      expect(nextPoint).to.equal(pointInterrupt?.currentImgPointId);
    });

    it("returns the point left of given points edge", () => {
      const coordinateInterrupt = { x: 12, y: 16 };

      const { nextPoint, pointInterrupt } = runDetermineNextPoint(
        coordinatesA,
        coordinatesB,
        coordinateInterrupt
      );

      expect(nextPoint).to.equal(pointInterrupt?.currentImgPointId);
    });

    it("does not return point to the right of given points edge", () => {
      const coordinateInterrupt = { x: 11, y: 17 };

      const { allPoints, pointB } = setupPoints(coordinatesB, [
        coordinateInterrupt,
      ]);

      const nextPoint = determineNextPoint(
        coordinatesA,
        pointB.currentImgPointId,
        allPoints
      );

      expect(nextPoint).to.equal(pointB.currentImgPointId);
    });

    describe("point outside given points rectangle", () => {
      it("does not return point proceeding given points", () => {
        const coordinateInterrupt = { x: 9, y: 13 };

        const { allPoints, pointB } = setupPoints(coordinatesB, [
          coordinateInterrupt,
        ]);

        const nextPoint = determineNextPoint(
          coordinatesA,
          pointB.currentImgPointId,
          allPoints
        );

        expect(nextPoint).to.equal(pointB.currentImgPointId);
      });
      it("does not return point succeeding given points", () => {
        const coordinateInterrupt = { x: 16, y: 22 };

        const { allPoints, pointB } = setupPoints(coordinatesB, [
          coordinateInterrupt,
        ]);

        const nextPoint = determineNextPoint(
          coordinatesA,
          pointB.currentImgPointId,
          allPoints
        );

        expect(nextPoint).to.equal(pointB.currentImgPointId);
      });
    });
  });
});
