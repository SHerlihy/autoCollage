import { coordinatesToPoint } from "../testHelperFunctions";
import { determineLeftSideCoordinates } from "./determineLeftSideCoordinates";
import { ICoordinates, IPoint, IPointsMap } from "./pointsTypes";

interface IPrecursorDummyIPoint {
  id: string;
  coordinates: ICoordinates;
}

const runDetermineLeftSideFromData = (
  potentialUnsuitableCoordinates: Array<IPrecursorDummyIPoint>,
  potentialSuitableCoordinates: Array<IPrecursorDummyIPoint>,
  startCoordinates: ICoordinates,
  endCoordinates: ICoordinates
) => {
  const unsuitablePoints = potentialUnsuitableCoordinates.map(
    ({ id, coordinates }) => {
      return [
        id,
        coordinatesToPoint(coordinates, "001", id, Math.random().toString()),
      ] as readonly [string, IPoint];
    }
  );
  const suitablePoints = potentialSuitableCoordinates.map(
    ({ id, coordinates }) => {
      return [
        id,
        coordinatesToPoint(coordinates, "001", id, Math.random().toString()),
      ] as readonly [string, IPoint];
    }
  );

  const allOtherPointsMap = new Map([...unsuitablePoints, ...suitablePoints]);

  const currentPotentialPointIds = new Set(allOtherPointsMap.keys());

  return determineLeftSideCoordinates(
    currentPotentialPointIds,
    allOtherPointsMap,
    startCoordinates,
    endCoordinates
  );
};

const runDetermineLeftTest = (
  potentialUnsuitableCoordinates: Array<IPrecursorDummyIPoint>,
  potentialSuitableCoordinates: Array<IPrecursorDummyIPoint>,
  startCoordinates: ICoordinates,
  endCoordinates: ICoordinates
) => {
  const validPointIds = runDetermineLeftSideFromData(
    potentialUnsuitableCoordinates,
    potentialSuitableCoordinates,
    startCoordinates,
    endCoordinates
  );

  if (!potentialSuitableCoordinates.length) {
    expect(validPointIds).to.equal(null);
    return;
  }

  if (potentialUnsuitableCoordinates.length) {
    const validatedUnSuitableIds = [...validPointIds!].map((validId) => {
      return potentialUnsuitableCoordinates.find(
        (unsuitable) => unsuitable.id === validId
      );
    });

    expect(validatedUnSuitableIds!.length).to.equal(0);
  }

  if (potentialSuitableCoordinates.length) {
    const validatedSuitableIds = [...validPointIds!].every((validId) => {
      return potentialSuitableCoordinates.find(
        (suitable) => suitable.id === validId
      );
    });

    expect(validatedSuitableIds).to.equal(true);
  }
};

const generateDummyPointPrecursors = (coordinates: ICoordinates[]) => {
  const dummyPointIds = coordinates.map(() => {
    return Math.random().toString();
  });

  const dummyPointPrecursors = coordinates.map((currentCoordinates, idx) => {
    return {
      id: dummyPointIds[idx],
      coordinates: currentCoordinates,
    };
  });

  return dummyPointPrecursors;
};

describe("determineLeftSideCoordinate", () => {
  const topLeftCoordinate = { x: 50, y: 50 };
  const topMidCoordinate = { x: 100, y: 50 };
  const topRightCoordinate = { x: 150, y: 50 };
  const midRightCoordinate = { x: 150, y: 100 };
  const lowRightCoordinate = { x: 150, y: 150 };
  const lowMidCoordinate = { x: 100, y: 150 };
  const lowLeftCoordinate = { x: 50, y: 150 };
  const midLeftCoordinate = { x: 50, y: 100 };

  describe("potential coordinates on edge", () => {
    describe("axis edges", () => {
      describe("vertical edge", () => {
        const onVerticalEdgePointPrecursors = generateDummyPointPrecursors([
          { x: 100, y: 51 },
          { x: 100, y: 100 },
          { x: 100, y: 149 },
        ]);

        it("is a down vertical edge", () => {
          runDetermineLeftTest(
            onVerticalEdgePointPrecursors,
            [],
            topMidCoordinate,
            lowMidCoordinate
          );
        });

        it("is a up vertical edge", () => {
          runDetermineLeftTest(
            onVerticalEdgePointPrecursors,
            [],
            lowMidCoordinate,
            topMidCoordinate
          );
        });
      });
      describe("horizontal edge", () => {
        const onHorizontalEdgePointPrecursors = generateDummyPointPrecursors([
          { x: 51, y: 100 },
          { x: 100, y: 100 },
          { x: 149, y: 100 },
        ]);

        it("is a right horizontal edge", () => {
          runDetermineLeftTest(
            onHorizontalEdgePointPrecursors,
            [],
            midLeftCoordinate,
            midRightCoordinate
          );
        });

        it("is a left horizontal edge", () => {
          runDetermineLeftTest(
            onHorizontalEdgePointPrecursors,
            [],
            midRightCoordinate,
            midLeftCoordinate
          );
        });
      });
    });
    describe("diagonal edges", () => {
      describe("back slash edges", () => {
        const onBackSlashEdgePointPrecursors = generateDummyPointPrecursors([
          { x: 51, y: 149 },
          { x: 100, y: 100 },
          { x: 149, y: 51 },
        ]);
        it("up right edge", () => {
          runDetermineLeftTest(
            onBackSlashEdgePointPrecursors,
            [],
            lowLeftCoordinate,
            topRightCoordinate
          );
        });
        it("down left edge", () => {
          runDetermineLeftTest(
            onBackSlashEdgePointPrecursors,
            [],
            topRightCoordinate,
            lowLeftCoordinate
          );
        });
      });

      describe("forward slash edges", () => {
        const onForwardSlashEdgePointPrecursors = generateDummyPointPrecursors([
          { x: 51, y: 51 },
          { x: 100, y: 100 },
          { x: 149, y: 149 },
        ]);

        it("down right edge", () => {
          runDetermineLeftTest(
            onForwardSlashEdgePointPrecursors,
            [],
            topLeftCoordinate,
            lowRightCoordinate
          );
        });
        it("up left edge", () => {
          runDetermineLeftTest(
            onForwardSlashEdgePointPrecursors,
            [],
            lowRightCoordinate,
            topLeftCoordinate
          );
        });
      });
    });
  });

  describe("potential coordinates close to edge", () => {
    describe("axis edges", () => {
      describe("vertical edge", () => {
        const leftPointPrecursors = generateDummyPointPrecursors([
          { x: 99, y: 51 },
          { x: 99, y: 100 },
          { x: 99, y: 149 },
        ]);

        const rightPointPrecursors = generateDummyPointPrecursors([
          { x: 101, y: 51 },
          { x: 101, y: 100 },
          { x: 101, y: 149 },
        ]);

        describe("is a down vertical edge", () => {
          it("given unsuitable points", () => {
            runDetermineLeftTest(
              leftPointPrecursors,
              [],
              topMidCoordinate,
              lowMidCoordinate
            );
          });
          it("given suitable points", () => {
            runDetermineLeftTest(
              [],
              rightPointPrecursors,
              topMidCoordinate,
              lowMidCoordinate
            );
          });
        });

        describe("is a up vertical edge", () => {
          it("given unsuitable points", () => {
            runDetermineLeftTest(
              rightPointPrecursors,
              [],
              lowMidCoordinate,
              topMidCoordinate
            );
          });
          it("given suitable points", () => {
            runDetermineLeftTest(
              [],
              leftPointPrecursors,
              lowMidCoordinate,
              topMidCoordinate
            );
          });
        });
      });
      describe("horizontal edge", () => {
        const upPointPrecursors = generateDummyPointPrecursors([
          { x: 51, y: 99 },
          { x: 100, y: 99 },
          { x: 149, y: 99 },
        ]);

        const downPointPrecursors = generateDummyPointPrecursors([
          { x: 51, y: 101 },
          { x: 100, y: 101 },
          { x: 149, y: 101 },
        ]);

        describe("is a right horizontal edge", () => {
          it("given unsuitable points", () => {
            runDetermineLeftTest(
              downPointPrecursors,
              [],
              midLeftCoordinate,
              midRightCoordinate
            );
          });
          it("given suitable points", () => {
            runDetermineLeftTest(
              [],
              upPointPrecursors,
              midLeftCoordinate,
              midRightCoordinate
            );
          });
        });

        it("is a left horizontal edge", () => {
          it("given unsuitable points", () => {
            runDetermineLeftTest(
              upPointPrecursors,
              [],
              midRightCoordinate,
              midLeftCoordinate
            );
          });
          it("given suitable points", () => {
            runDetermineLeftTest(
              [],
              downPointPrecursors,
              midRightCoordinate,
              midLeftCoordinate
            );
          });
        });
      });
    });

    describe("diagonal edges", () => {
      const leftUpPointPrecursors = generateDummyPointPrecursors([
        { x: 149, y: 48 },
        { x: 100, y: 99 },
        { x: 49, y: 148 },
      ]);

      const rightDownPointPrecursors = generateDummyPointPrecursors([
        { x: 149, y: 52 },
        { x: 100, y: 101 },
        { x: 49, y: 152 },
      ]);

      const leftDownPointPrecursors = generateDummyPointPrecursors([
        { x: 149, y: 152 },
        { x: 100, y: 101 },
        { x: 49, y: 52 },
      ]);

      const rightUpPointPrecursors = generateDummyPointPrecursors([
        { x: 149, y: 148 },
        { x: 100, y: 99 },
        { x: 49, y: 48 },
      ]);

      describe("up right edge", () => {
        it("given unsuitable points", () => {
          runDetermineLeftTest(
            rightDownPointPrecursors,
            [],
            lowLeftCoordinate,
            topRightCoordinate
          );
        });
        it("given suitable points", () => {
          runDetermineLeftTest(
            [],
            leftUpPointPrecursors,
            lowLeftCoordinate,
            topRightCoordinate
          );
        });
      });

      describe("down left edge", () => {
        it("given unsuitable points", () => {
          runDetermineLeftTest(
            leftUpPointPrecursors,
            [],
            topRightCoordinate,
            lowLeftCoordinate
          );
        });
        it("given suitable points", () => {
          runDetermineLeftTest(
            [],
            rightDownPointPrecursors,
            topRightCoordinate,
            lowLeftCoordinate
          );
        });
      });

      describe("up left edge", () => {
        it("given unsuitable points", () => {
          runDetermineLeftTest(
            rightUpPointPrecursors,
            [],
            lowRightCoordinate,
            topLeftCoordinate
          );
        });
        it("given suitable points", () => {
          runDetermineLeftTest(
            [],
            leftDownPointPrecursors,
            lowRightCoordinate,
            topLeftCoordinate
          );
        });
      });

      describe("down right edge", () => {
        it("given unsuitable points", () => {
          runDetermineLeftTest(
            leftDownPointPrecursors,
            [],
            topLeftCoordinate,
            lowRightCoordinate
          );
        });
        it("given suitable points", () => {
          runDetermineLeftTest(
            [],
            rightUpPointPrecursors,
            topLeftCoordinate,
            lowRightCoordinate
          );
        });
      });
    });
  });
});
