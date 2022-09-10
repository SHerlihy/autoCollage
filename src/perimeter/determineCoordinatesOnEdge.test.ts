import { coordinatesToPoint } from "../testHelperFunctions";
import { determineCoordinatesOnEdge } from "./determineCoordinatesOnEdge";
import { ICoordinates, IPoint, IPointsMap } from "./pointsTypes";

interface IPrecursorDummyIPoint {
  id: string;
  coordinates: ICoordinates;
}

const runDetermineOnEdgeFromData = (
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

  return determineCoordinatesOnEdge(
    currentPotentialPointIds,
    allOtherPointsMap,
    startCoordinates,
    endCoordinates
  );
};

const runDetermineOnEdgeTest = (
  potentialUnsuitableCoordinates: Array<IPrecursorDummyIPoint>,
  potentialSuitableCoordinates: Array<IPrecursorDummyIPoint>,
  startCoordinates: ICoordinates,
  endCoordinates: ICoordinates
) => {
  const validPointIds = runDetermineOnEdgeFromData(
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

describe("determineCoordinatesOnEdge", () => {
  const topLeftCoordinate = { x: 50, y: 50 };
  const topMidCoordinate = { x: 100, y: 50 };
  const topRightCoordinate = { x: 150, y: 50 };
  const midRightCoordinate = { x: 150, y: 100 };
  const lowRightCoordinate = { x: 150, y: 150 };
  const lowMidCoordinate = { x: 100, y: 150 };
  const lowLeftCoordinate = { x: 50, y: 150 };
  const midLeftCoordinate = { x: 50, y: 100 };

  describe("axis edges", () => {
    describe("vertical edge", () => {
      const onVerticalEdgePointPrecursors = generateDummyPointPrecursors([
        { x: 100, y: 51 },
        { x: 100, y: 100 },
        { x: 100, y: 149 },
      ]);

      it("is a down vertical edge", () => {
        runDetermineOnEdgeTest(
          [],
          onVerticalEdgePointPrecursors,
          topMidCoordinate,
          lowMidCoordinate
        );
      });

      it("is a up vertical edge", () => {
        runDetermineOnEdgeTest(
          [],
          onVerticalEdgePointPrecursors,
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
        runDetermineOnEdgeTest(
          [],
          onHorizontalEdgePointPrecursors,
          midLeftCoordinate,
          midRightCoordinate
        );
      });

      it("is a left horizontal edge", () => {
        runDetermineOnEdgeTest(
          [],
          onHorizontalEdgePointPrecursors,
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
        runDetermineOnEdgeTest(
          [],
          onBackSlashEdgePointPrecursors,
          lowLeftCoordinate,
          topRightCoordinate
        );
      });
      it("down left edge", () => {
        runDetermineOnEdgeTest(
          [],
          onBackSlashEdgePointPrecursors,
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
        runDetermineOnEdgeTest(
          [],
          onForwardSlashEdgePointPrecursors,
          topLeftCoordinate,
          lowRightCoordinate
        );
      });
      it("up left edge", () => {
        runDetermineOnEdgeTest(
          [],
          onForwardSlashEdgePointPrecursors,
          lowRightCoordinate,
          topLeftCoordinate
        );
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
            runDetermineOnEdgeTest(
              leftPointPrecursors,
              [],
              topMidCoordinate,
              lowMidCoordinate
            );
          });
          it("given other side unsuitable points", () => {
            runDetermineOnEdgeTest(
              rightPointPrecursors,
              [],
              topMidCoordinate,
              lowMidCoordinate
            );
          });
        });

        describe("is a up vertical edge", () => {
          it("given unsuitable points", () => {
            runDetermineOnEdgeTest(
              rightPointPrecursors,
              [],
              lowMidCoordinate,
              topMidCoordinate
            );
          });
          it("given other side unsuitable points", () => {
            runDetermineOnEdgeTest(
              leftPointPrecursors,
              [],
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
            runDetermineOnEdgeTest(
              downPointPrecursors,
              [],
              midLeftCoordinate,
              midRightCoordinate
            );
          });
          it("given other side unsuitable points", () => {
            runDetermineOnEdgeTest(
              upPointPrecursors,
              [],
              midLeftCoordinate,
              midRightCoordinate
            );
          });
        });

        it("is a left horizontal edge", () => {
          it("given unsuitable points", () => {
            runDetermineOnEdgeTest(
              upPointPrecursors,
              [],
              midRightCoordinate,
              midLeftCoordinate
            );
          });
          it("given other side unsuitable points", () => {
            runDetermineOnEdgeTest(
              downPointPrecursors,
              [],
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
          runDetermineOnEdgeTest(
            rightDownPointPrecursors,
            [],
            lowLeftCoordinate,
            topRightCoordinate
          );
        });
        it("given other side unsuitable points", () => {
          runDetermineOnEdgeTest(
            leftUpPointPrecursors,
            [],
            lowLeftCoordinate,
            topRightCoordinate
          );
        });
      });

      describe("down left edge", () => {
        it("given unsuitable points", () => {
          runDetermineOnEdgeTest(
            leftUpPointPrecursors,
            [],
            topRightCoordinate,
            lowLeftCoordinate
          );
        });
        it("given other side unsuitable points", () => {
          runDetermineOnEdgeTest(
            rightDownPointPrecursors,
            [],
            topRightCoordinate,
            lowLeftCoordinate
          );
        });
      });

      describe("up left edge", () => {
        it("given unsuitable points", () => {
          runDetermineOnEdgeTest(
            rightUpPointPrecursors,
            [],
            lowRightCoordinate,
            topLeftCoordinate
          );
        });
        it("given other side unsuitable points", () => {
          runDetermineOnEdgeTest(
            leftDownPointPrecursors,
            [],
            lowRightCoordinate,
            topLeftCoordinate
          );
        });
      });

      describe("down right edge", () => {
        it("given unsuitable points", () => {
          runDetermineOnEdgeTest(
            leftDownPointPrecursors,
            [],
            topLeftCoordinate,
            lowRightCoordinate
          );
        });
        it("given other side unsuitable points", () => {
          runDetermineOnEdgeTest(
            rightUpPointPrecursors,
            [],
            topLeftCoordinate,
            lowRightCoordinate
          );
        });
      });
    });
  });
});
