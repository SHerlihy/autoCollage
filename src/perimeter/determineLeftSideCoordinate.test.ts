import { determineLeftSideCoordinates } from "./determineLeftSideCoordinates";
import { coordinatesToPoint } from "./pointsHelper";
import { ICoordinates, IPoint } from "./pointsTypes";

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

  if (validPointIds === null) {
    expect(potentialSuitableCoordinates.length).to.equal(0);
    return;
  }

  if (!potentialSuitableCoordinates.length) {
    expect(validPointIds).to.equal(null);
    return;
  }

  if (potentialUnsuitableCoordinates.length) {
    const validatedUnSuitableIds = [...validPointIds].reduce((acc, validId) => {
      const isPotentialUnsuitable = potentialUnsuitableCoordinates.find(
        (unsuitable) => unsuitable.id === validId
      );

      if (isPotentialUnsuitable) {
        acc.unshift(isPotentialUnsuitable);
      }

      return acc;
    }, [] as Array<IPrecursorDummyIPoint>);

    expect(validatedUnSuitableIds.length).to.equal(0);
  }

  if (potentialSuitableCoordinates.length) {
    const validatedSuitableIds = [...validPointIds].reduce((acc, validId) => {
      const isPotentialSuitable = potentialSuitableCoordinates.find(
        (suitable) => suitable.id === validId
      );

      if (isPotentialSuitable) {
        acc.unshift(isPotentialSuitable);
      }

      return acc;
    }, [] as Array<IPrecursorDummyIPoint>);

    expect(validatedSuitableIds.length).to.equal(
      potentialSuitableCoordinates.length
    );
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
  const midMidCoordinate = { x: 100, y: 100 };

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
        { x: 148, y: 49 },
        { x: 100, y: 99 },
        { x: 51, y: 148 },
      ]);

      const rightDownPointPrecursors = generateDummyPointPrecursors([
        { x: 149, y: 52 },
        { x: 100, y: 101 },
        { x: 52, y: 149 },
      ]);

      const leftDownPointPrecursors = generateDummyPointPrecursors([
        { x: 148, y: 149 },
        { x: 100, y: 101 },
        { x: 49, y: 52 },
      ]);

      const rightUpPointPrecursors = generateDummyPointPrecursors([
        { x: 149, y: 148 },
        { x: 100, y: 99 },
        { x: 52, y: 51 },
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

  describe("coordinates orthogonal to start coordiante", () => {
    const othogonalPointPrecursors = generateDummyPointPrecursors([
      { x: 98, y: 98 },
      { x: 100, y: 98 },
      { x: 102, y: 98 },
      { x: 102, y: 100 },
      { x: 102, y: 102 },
      { x: 100, y: 102 },
      { x: 98, y: 102 },
      { x: 98, y: 100 },
    ]);

    const othogonalPointPrecursorsMap = new Map([
      ["topLeft", othogonalPointPrecursors[0]],
      ["topMid", othogonalPointPrecursors[1]],
      ["topRight", othogonalPointPrecursors[2]],
      ["midRight", othogonalPointPrecursors[3]],
      ["lowRight", othogonalPointPrecursors[4]],
      ["lowMid", othogonalPointPrecursors[5]],
      ["lowLeft", othogonalPointPrecursors[6]],
      ["midLeft", othogonalPointPrecursors[7]],
    ]);

    it("to low mid", () => {
      const suitableCoordinates = [
        othogonalPointPrecursorsMap.get("lowRight")!,
        othogonalPointPrecursorsMap.get("midRight")!,
        othogonalPointPrecursorsMap.get("topRight")!,
      ];

      const unsuitableCoordinates = new Map(othogonalPointPrecursorsMap);
      unsuitableCoordinates.delete("lowRight");
      unsuitableCoordinates.delete("midRight");
      unsuitableCoordinates.delete("topRight");

      runDetermineLeftTest(
        [...unsuitableCoordinates.values()],
        suitableCoordinates,
        midMidCoordinate,
        lowMidCoordinate
      );
    });
    it("to top right", () => {
      const suitableCoordinates = [
        othogonalPointPrecursorsMap.get("midLeft")!,
        othogonalPointPrecursorsMap.get("topLeft")!,
        othogonalPointPrecursorsMap.get("topMid")!,
      ];

      const unsuitableCoordinates = new Map(othogonalPointPrecursorsMap);
      unsuitableCoordinates.delete("midLeft");
      unsuitableCoordinates.delete("topLeft");
      unsuitableCoordinates.delete("topMid");

      runDetermineLeftTest(
        [...unsuitableCoordinates.values()],
        suitableCoordinates,
        midMidCoordinate,
        topRightCoordinate
      );
    });
    it("to left", () => {
      const suitableCoordinates = [
        othogonalPointPrecursorsMap.get("lowRight")!,
        othogonalPointPrecursorsMap.get("lowMid")!,
        othogonalPointPrecursorsMap.get("lowLeft")!,
      ];

      const unsuitableCoordinates = new Map(othogonalPointPrecursorsMap);
      unsuitableCoordinates.delete("lowRight");
      unsuitableCoordinates.delete("lowMid");
      unsuitableCoordinates.delete("lowLeft");

      runDetermineLeftTest(
        [...unsuitableCoordinates.values()],
        suitableCoordinates,
        midMidCoordinate,
        midLeftCoordinate
      );
    });
    it("to low right", () => {
      const suitableCoordinates = [
        othogonalPointPrecursorsMap.get("topMid")!,
        othogonalPointPrecursorsMap.get("topRight")!,
        othogonalPointPrecursorsMap.get("midRight")!,
      ];

      const unsuitableCoordinates = new Map(othogonalPointPrecursorsMap);
      unsuitableCoordinates.delete("topMid");
      unsuitableCoordinates.delete("topRight");
      unsuitableCoordinates.delete("midRight");

      runDetermineLeftTest(
        [...unsuitableCoordinates.values()],
        suitableCoordinates,
        midMidCoordinate,
        lowRightCoordinate
      );
    });
  });
});
