import { determineCoordinatesOnEdge } from "./determineCoordinatesOnEdge";
import { coordinatesToDummyPoints } from "./pointsHelper";
import { ICoordinates, IPoint, IPointsMap } from "./pointsTypes";

const runDetermineOnEdgeFromData = (
  unsuitablePoints: IPointsMap,
  suitablePoints: IPointsMap,
  startCoordinates: ICoordinates,
  endCoordinates: ICoordinates
) => {
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
  unsuitablePoints: IPointsMap,
  suitablePoints: IPointsMap,
  startCoordinates: ICoordinates,
  endCoordinates: ICoordinates
) => {
  const validPointIds = runDetermineOnEdgeFromData(
    unsuitablePoints,
    suitablePoints,
    startCoordinates,
    endCoordinates
  );

  if (!suitablePoints.size) {
    expect(validPointIds).to.equal(null);
    return;
  }

  if (unsuitablePoints.size) {
    const validatedUnSuitableIds = [...validPointIds!].map((validId) => {
      return unsuitablePoints.get(validId);
    });

    expect(validatedUnSuitableIds!.length).to.equal(0);
  }

  if (suitablePoints.size) {
    const validatedSuitableIds = [...validPointIds!].every((validId) => {
      return suitablePoints.get(validId);
    });

    expect(validatedSuitableIds).to.equal(true);
  }
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
      const onVerticalEdgePointPrecursors = coordinatesToDummyPoints([
        { x: 100, y: 51 },
        { x: 100, y: 100 },
        { x: 100, y: 149 },
      ]);

      it("is a down vertical edge", () => {
        runDetermineOnEdgeTest(
          new Map(),
          onVerticalEdgePointPrecursors,
          topMidCoordinate,
          lowMidCoordinate
        );
      });

      it("is a up vertical edge", () => {
        runDetermineOnEdgeTest(
          new Map(),
          onVerticalEdgePointPrecursors,
          lowMidCoordinate,
          topMidCoordinate
        );
      });
    });
    describe("horizontal edge", () => {
      const onHorizontalEdgePointPrecursors = coordinatesToDummyPoints([
        { x: 51, y: 100 },
        { x: 100, y: 100 },
        { x: 149, y: 100 },
      ]);

      it("is a right horizontal edge", () => {
        runDetermineOnEdgeTest(
          new Map(),
          onHorizontalEdgePointPrecursors,
          midLeftCoordinate,
          midRightCoordinate
        );
      });

      it("is a left horizontal edge", () => {
        runDetermineOnEdgeTest(
          new Map(),
          onHorizontalEdgePointPrecursors,
          midRightCoordinate,
          midLeftCoordinate
        );
      });
    });
  });
  describe("diagonal edges", () => {
    describe("back slash edges", () => {
      const onBackSlashEdgePointPrecursors = coordinatesToDummyPoints([
        { x: 51, y: 149 },
        { x: 100, y: 100 },
        { x: 149, y: 51 },
      ]);
      it("up right edge", () => {
        runDetermineOnEdgeTest(
          new Map(),
          onBackSlashEdgePointPrecursors,
          lowLeftCoordinate,
          topRightCoordinate
        );
      });
      it("down left edge", () => {
        runDetermineOnEdgeTest(
          new Map(),
          onBackSlashEdgePointPrecursors,
          topRightCoordinate,
          lowLeftCoordinate
        );
      });
    });

    describe("forward slash edges", () => {
      const onForwardSlashEdgePointPrecursors = coordinatesToDummyPoints([
        { x: 51, y: 51 },
        { x: 100, y: 100 },
        { x: 149, y: 149 },
      ]);

      it("down right edge", () => {
        runDetermineOnEdgeTest(
          new Map(),
          onForwardSlashEdgePointPrecursors,
          topLeftCoordinate,
          lowRightCoordinate
        );
      });
      it("up left edge", () => {
        runDetermineOnEdgeTest(
          new Map(),
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
        const leftPointPrecursors = coordinatesToDummyPoints([
          { x: 99, y: 51 },
          { x: 99, y: 100 },
          { x: 99, y: 149 },
        ]);

        const rightPointPrecursors = coordinatesToDummyPoints([
          { x: 101, y: 51 },
          { x: 101, y: 100 },
          { x: 101, y: 149 },
        ]);

        describe("is a down vertical edge", () => {
          it("given unsuitable points", () => {
            runDetermineOnEdgeTest(
              leftPointPrecursors,
              new Map(),
              topMidCoordinate,
              lowMidCoordinate
            );
          });
          it("given other side unsuitable points", () => {
            runDetermineOnEdgeTest(
              rightPointPrecursors,
              new Map(),
              topMidCoordinate,
              lowMidCoordinate
            );
          });
        });

        describe("is a up vertical edge", () => {
          it("given unsuitable points", () => {
            runDetermineOnEdgeTest(
              rightPointPrecursors,
              new Map(),
              lowMidCoordinate,
              topMidCoordinate
            );
          });
          it("given other side unsuitable points", () => {
            runDetermineOnEdgeTest(
              leftPointPrecursors,
              new Map(),
              lowMidCoordinate,
              topMidCoordinate
            );
          });
        });
      });
      describe("horizontal edge", () => {
        const upPointPrecursors = coordinatesToDummyPoints([
          { x: 51, y: 99 },
          { x: 100, y: 99 },
          { x: 149, y: 99 },
        ]);

        const downPointPrecursors = coordinatesToDummyPoints([
          { x: 51, y: 101 },
          { x: 100, y: 101 },
          { x: 149, y: 101 },
        ]);

        describe("is a right horizontal edge", () => {
          it("given unsuitable points", () => {
            runDetermineOnEdgeTest(
              downPointPrecursors,
              new Map(),
              midLeftCoordinate,
              midRightCoordinate
            );
          });
          it("given other side unsuitable points", () => {
            runDetermineOnEdgeTest(
              upPointPrecursors,
              new Map(),
              midLeftCoordinate,
              midRightCoordinate
            );
          });
        });

        it("is a left horizontal edge", () => {
          it("given unsuitable points", () => {
            runDetermineOnEdgeTest(
              upPointPrecursors,
              new Map(),
              midRightCoordinate,
              midLeftCoordinate
            );
          });
          it("given other side unsuitable points", () => {
            runDetermineOnEdgeTest(
              downPointPrecursors,
              new Map(),
              midRightCoordinate,
              midLeftCoordinate
            );
          });
        });
      });
    });

    describe("diagonal edges", () => {
      const leftUpPointPrecursors = coordinatesToDummyPoints([
        { x: 149, y: 48 },
        { x: 100, y: 99 },
        { x: 49, y: 148 },
      ]);

      const rightDownPointPrecursors = coordinatesToDummyPoints([
        { x: 149, y: 52 },
        { x: 100, y: 101 },
        { x: 49, y: 152 },
      ]);

      const leftDownPointPrecursors = coordinatesToDummyPoints([
        { x: 149, y: 152 },
        { x: 100, y: 101 },
        { x: 49, y: 52 },
      ]);

      const rightUpPointPrecursors = coordinatesToDummyPoints([
        { x: 149, y: 148 },
        { x: 100, y: 99 },
        { x: 49, y: 48 },
      ]);

      describe("up right edge", () => {
        it("given unsuitable points", () => {
          runDetermineOnEdgeTest(
            rightDownPointPrecursors,
            new Map(),
            lowLeftCoordinate,
            topRightCoordinate
          );
        });
        it("given other side unsuitable points", () => {
          runDetermineOnEdgeTest(
            leftUpPointPrecursors,
            new Map(),
            lowLeftCoordinate,
            topRightCoordinate
          );
        });
      });

      describe("down left edge", () => {
        it("given unsuitable points", () => {
          runDetermineOnEdgeTest(
            leftUpPointPrecursors,
            new Map(),
            topRightCoordinate,
            lowLeftCoordinate
          );
        });
        it("given other side unsuitable points", () => {
          runDetermineOnEdgeTest(
            rightDownPointPrecursors,
            new Map(),
            topRightCoordinate,
            lowLeftCoordinate
          );
        });
      });

      describe("up left edge", () => {
        it("given unsuitable points", () => {
          runDetermineOnEdgeTest(
            rightUpPointPrecursors,
            new Map(),
            lowRightCoordinate,
            topLeftCoordinate
          );
        });
        it("given other side unsuitable points", () => {
          runDetermineOnEdgeTest(
            leftDownPointPrecursors,
            new Map(),
            lowRightCoordinate,
            topLeftCoordinate
          );
        });
      });

      describe("down right edge", () => {
        it("given unsuitable points", () => {
          runDetermineOnEdgeTest(
            leftDownPointPrecursors,
            new Map(),
            topLeftCoordinate,
            lowRightCoordinate
          );
        });
        it("given other side unsuitable points", () => {
          runDetermineOnEdgeTest(
            rightUpPointPrecursors,
            new Map(),
            topLeftCoordinate,
            lowRightCoordinate
          );
        });
      });
    });
  });

  describe("failures from external testing", () => {
    describe("integration failures", () => {
      describe("fill crevices", () => {
        it("returns true for down vertical edge", () => {
          const onVerticalEdgePointPrecursors = coordinatesToDummyPoints([
            { x: 20, y: 30 },
          ]);

          runDetermineOnEdgeTest(
            new Map(),
            onVerticalEdgePointPrecursors,
            { x: 20, y: 5 },
            { x: 20, y: 34.5 }
          );
        });
      });
    });
  });
});
