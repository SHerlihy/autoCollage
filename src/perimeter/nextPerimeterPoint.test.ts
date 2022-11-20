import { determineNextPoint } from "./nextPerimeterPoint";
import {
  coordinatesToPoint,
  coordinatesArrToLinkedPointsMap,
} from "./pointsHelper";
import { ICoordinates, IPoint } from "./pointsTypes";

const setupPoints = (
  coordinatesA: ICoordinates,
  coordinatesB: ICoordinates,
  otherCoordinates: ICoordinates[]
) => {
  const allPoints = coordinatesArrToLinkedPointsMap(otherCoordinates);

  const pointAPredecessor = [...allPoints.values()][allPoints.size - 1];
  const pointBSuccessor = [...allPoints.values()][0];

  allPoints.get(pointAPredecessor.currentImgPointId)!.nextImgPointId = "pointA";

  const pointA = coordinatesToPoint(coordinatesA, "002", "pointA", "pointB");

  const pointB = coordinatesToPoint(
    coordinatesB,
    "001",
    "pointB",
    pointBSuccessor.currentImgPointId
  );

  allPoints.set(pointA.currentImgPointId, pointA);
  allPoints.set(pointB.currentImgPointId, pointB);

  return {
    allPoints,
    pointB,
    pointA,
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

  const { allPoints, pointB, pointA } = setupPoints(
    coordinatesA,
    coordinatesB,
    allOtherCoordinates
  );

  const nextPoint = determineNextPoint(pointA, pointB, allPoints, []);

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

type RunTestDetermineNext = (
  coordinatesA: ICoordinates,
  expectIntercept: boolean,
  coordinatesB: ICoordinates,
  coordinatesPotentialNext: ICoordinates,
  fillerCoordinates?: ICoordinates[]
) => void;

const runTestDetermineNext = (
  coordinatesA: ICoordinates,
  expectIntercept: boolean,
  coordinatesB: ICoordinates,
  coordinatesPotentialNext: ICoordinates,
  fillerCoordinates?: ICoordinates[]
) => {
  const { nextPoint, pointB, pointInterrupt } = runDetermineNextPoint(
    coordinatesA,
    coordinatesB,
    coordinatesPotentialNext,
    fillerCoordinates
  );

  const expectingPointId = expectIntercept
    ? pointInterrupt?.currentImgPointId
    : pointB.currentImgPointId;

  if (!expectingPointId) {
    throw new Error("expectingPointId is undefined");
  }

  expect(nextPoint).to.equal(expectingPointId);
};

function curryRunTestDetermineNext(runFunc: RunTestDetermineNext) {
  return function (fillerCoordinates?: ICoordinates[]) {
    return function (coordinatesA: ICoordinates, coordinatesB: ICoordinates) {
      return function (expectIntercept: boolean) {
        return function (coordinatesPotentialNext: ICoordinates) {
          return runFunc(
            coordinatesA,
            expectIntercept,
            coordinatesB,
            coordinatesPotentialNext,
            fillerCoordinates
          );
        };
      };
    };
  };
}

const curriedTestDetermineNext =
  curryRunTestDetermineNext(runTestDetermineNext);

describe("nextPerimeterPoint", () => {
  describe("no fill coordinates", () => {
    const noFiller = curriedTestDetermineNext();

    describe("down right edge", () => {
      const coordinatesA = { x: 10, y: 15 };
      const coordinatesB = { x: 15, y: 20 };

      const noFillerWithEdge = noFiller(coordinatesA, coordinatesB);

      const expectGivenAsNext = noFillerWithEdge(true);

      const expectPointBAsNext = noFillerWithEdge(false);

      describe("other point beyond bounds rectangle", () => {
        it("returns pointB as next when other point is far beyond bounds", () => {
          const orphanCoordinates = { x: 50, y: 50 };

          expectPointBAsNext(orphanCoordinates);
        });

        it("returns pointB as next when other point is proceeding given points", () => {
          const coordinateInterrupt = { x: 9, y: 13 };

          expectPointBAsNext(coordinateInterrupt);
        });
        it("returns pointB as next when other point is succeeding given points", () => {
          const coordinateInterrupt = { x: 16, y: 22 };

          expectPointBAsNext(coordinateInterrupt);
        });
      });

      describe("other point within bounds rectangle", () => {
        it("returns other point when other point is between edge points", () => {
          const coordinateInterrupt = { x: 12, y: 17 };

          expectGivenAsNext(coordinateInterrupt);
        });

        it("returns other point when other point is left of edge points", () => {
          const coordinateInterrupt = { x: 12, y: 16 };

          expectGivenAsNext(coordinateInterrupt);
        });

        it("returns pointB as next when other point is right of edge points", () => {
          const coordinateInterrupt = { x: 11, y: 17 };

          expectPointBAsNext(coordinateInterrupt);
        });
      });
    });

    describe("up right edge", () => {
      const coordinatesA = { x: 10, y: 20 };
      const coordinatesB = { x: 15, y: 15 };

      const noFillerWithEdge = noFiller(coordinatesA, coordinatesB);

      const expectGivenAsNext = noFillerWithEdge(true);

      const expectPointBAsNext = noFillerWithEdge(false);

      describe("other point beyond bounds rectangle", () => {
        it("returns pointB as next when other point is far beyond bounds", () => {
          const orphanCoordinates = { x: 50, y: 50 };

          expectPointBAsNext(orphanCoordinates);
        });

        it("returns pointB as next when other point is proceeding given points", () => {
          const coordinateInterrupt = { x: 9, y: 21 };

          expectPointBAsNext(coordinateInterrupt);
        });
        it("returns pointB as next when other point is succeeding given points", () => {
          const coordinateInterrupt = { x: 16, y: 14 };

          expectPointBAsNext(coordinateInterrupt);
        });
      });

      describe("other point within bounds rectangle", () => {
        it("returns other point when other point is between edge points", () => {
          const coordinateInterrupt = { x: 12, y: 18 };
          debugger;
          expectGivenAsNext(coordinateInterrupt);
        });

        it("returns other point when other point is left of edge points", () => {
          const coordinateInterrupt = { x: 13, y: 16 };

          expectGivenAsNext(coordinateInterrupt);
        });

        it("returns pointB as next when other point is right of edge points", () => {
          const coordinateInterrupt = { x: 14, y: 18 };

          expectPointBAsNext(coordinateInterrupt);
        });
      });
    });

    describe("down left edge", () => {
      const coordinatesA = { x: 15, y: 15 };
      const coordinatesB = { x: 10, y: 20 };

      const noFillerWithEdge = noFiller(coordinatesA, coordinatesB);

      const expectGivenAsNext = noFillerWithEdge(true);

      const expectPointBAsNext = noFillerWithEdge(false);

      describe("other point beyond bounds rectangle", () => {
        it("returns pointB as next when other point is far beyond bounds", () => {
          const orphanCoordinates = { x: 50, y: 50 };

          expectPointBAsNext(orphanCoordinates);
        });

        it("returns pointB as next when other point is proceeding given points", () => {
          const coordinateInterrupt = { x: 16, y: 14 };

          expectPointBAsNext(coordinateInterrupt);
        });
        it("returns pointB as next when other point is succeeding given points", () => {
          const coordinateInterrupt = { x: 9, y: 21 };

          expectPointBAsNext(coordinateInterrupt);
        });
      });

      describe("other point within bounds rectangle", () => {
        it("returns other point when other point is between edge points", () => {
          const coordinateInterrupt = { x: 12, y: 18 };

          expectGivenAsNext(coordinateInterrupt);
        });

        it("returns other point when other point is left of edge points", () => {
          const coordinateInterrupt = { x: 13, y: 18 };

          expectGivenAsNext(coordinateInterrupt);
        });

        it("returns pointB as next when other point is right of edge points", () => {
          const coordinateInterrupt = { x: 12, y: 16 };

          expectPointBAsNext(coordinateInterrupt);
        });
      });
    });

    describe("up left edge", () => {
      const coordinatesA = { x: 15, y: 20 };
      const coordinatesB = { x: 10, y: 15 };

      const noFillerWithEdge = noFiller(coordinatesA, coordinatesB);

      const expectGivenAsNext = noFillerWithEdge(true);

      const expectPointBAsNext = noFillerWithEdge(false);

      describe("other point beyond bounds rectangle", () => {
        it("returns pointB as next when other point is far beyond bounds", () => {
          const orphanCoordinates = { x: 50, y: 50 };

          expectPointBAsNext(orphanCoordinates);
        });

        it("returns pointB as next when other point is proceeding given points", () => {
          const coordinateInterrupt = { x: 16, y: 21 };

          expectPointBAsNext(coordinateInterrupt);
        });
        it("returns pointB as next when other point is succeeding given points", () => {
          const coordinateInterrupt = { x: 9, y: 14 };

          expectPointBAsNext(coordinateInterrupt);
        });
      });

      describe("other point within bounds rectangle", () => {
        it("returns other point when other point is between edge points", () => {
          const coordinateInterrupt = { x: 13, y: 18 };

          expectGivenAsNext(coordinateInterrupt);
        });

        it("returns other point when other point is left of edge points", () => {
          const coordinateInterrupt = { x: 12, y: 18 };

          expectGivenAsNext(coordinateInterrupt);
        });

        it("returns pointB as next when other point is right of edge points", () => {
          const coordinateInterrupt = { x: 13, y: 17 };

          expectPointBAsNext(coordinateInterrupt);
        });
      });
    });
  });
});
