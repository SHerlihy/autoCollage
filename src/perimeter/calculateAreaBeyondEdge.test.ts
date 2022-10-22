import { calculateAreaBeyondEdge } from "./calculateAreaBeyondEdge";
import { toDecimalPlaces } from "./mathHelpers";
import { ICoordinates } from "./pointsTypes";

type AreaCornerInitials = "BL" | "BR" | "TR" | "TL";

const expectXY = (
  areaCorner: AreaCornerInitials,
  coordinate: ICoordinates,
  xExpect: number,
  yExpect: number
) => {
  const getFeedbackCornerString = (areaCorner: AreaCornerInitials) => {
    if (areaCorner === "BL") return "bottom left";
    if (areaCorner === "BR") return "bottom right";
    if (areaCorner === "TR") return "top right";
    if (areaCorner === "TL") return "top left";
  };
  const feedbackCornerString = getFeedbackCornerString(areaCorner);

  const coordinateXThreeDP = toDecimalPlaces(coordinate.x, 100);
  const coordinateYThreeDP = toDecimalPlaces(coordinate.y, 100);

  expect(coordinateXThreeDP, `x ${feedbackCornerString}`).to.equal(xExpect);
  expect(coordinateYThreeDP, `y ${feedbackCornerString}`).to.equal(yExpect);
};

const setupTest = (
  currentImageCoordinate: ICoordinates,
  nextImageCoordinate: ICoordinates,
  offset = 0.99
) => {
  const { TL, TR, BR, BL } = calculateAreaBeyondEdge(
    currentImageCoordinate,
    nextImageCoordinate,
    offset
  );

  expectXY("BL", BL, currentImageCoordinate.x, currentImageCoordinate.y);

  return { TL, TR, BR };
};

describe("calculateAreaBeyondEdge", () => {
  const topLeftCoordinate = { x: 50, y: 50 };
  const topMidCoordinate = { x: 100, y: 50 };
  const topRightCoordinate = { x: 150, y: 50 };
  const midRightCoordinate = { x: 150, y: 100 };
  const lowRightCoordinate = { x: 150, y: 150 };
  const lowMidCoordinate = { x: 100, y: 150 };
  const lowLeftCoordinate = { x: 50, y: 150 };
  const midLeftCoordinate = { x: 50, y: 100 };

  describe("axis edges", () => {
    describe("vertical edges", () => {
      it("down edge", () => {
        const { BR, TL, TR } = setupTest(topMidCoordinate, lowMidCoordinate);

        expectXY("BR", BR, 100, 150.99);
        expectXY("TL", TL, 100.99, 50);
        expectXY("TR", TR, 100.99, 150.99);
      });
      it("up edge", () => {
        const { BR, TL, TR } = setupTest(lowMidCoordinate, topMidCoordinate);

        expectXY("BR", BR, 100, 49.01);
        expectXY("TL", TL, 99.01, 150);
        expectXY("TR", TR, 99.01, 49.01);
      });
    });
    describe("horizontal edges", () => {
      it("right edge", () => {
        const { BR, TL, TR } = setupTest(midLeftCoordinate, midRightCoordinate);

        expectXY("BR", BR, 150.99, 100);
        expectXY("TL", TL, 50, 99.01);
        expectXY("TR", TR, 150.99, 99.01);
      });
      it("left edge", () => {
        const { BR, TL, TR } = setupTest(midRightCoordinate, midLeftCoordinate);

        expectXY("BR", BR, 49.01, 100);
        expectXY("TL", TL, 150, 100.99);
        expectXY("TR", TR, 49.01, 100.99);
      });
    });
  });

  describe("diagonal edges", () => {
    describe("backslash", () => {
      it("top right to low left", () => {
        const { BR, TL, TR } = setupTest(topRightCoordinate, lowLeftCoordinate);

        expectXY("BR", BR, 49.3, 150.7);
        expectXY("TL", TL, 150.7, 50.7);
        expectXY("TR", TR, 50, 151.4);
      });
      it("low left to top right", () => {
        const { BR, TL, TR } = setupTest(lowLeftCoordinate, topRightCoordinate);

        expectXY("BR", BR, 150.7, 49.3);
        expectXY("TL", TL, 49.3, 149.3);
        expectXY("TR", TR, 150, 48.6);
      });
    });
    describe("forward slash", () => {
      it("top left to low right", () => {
        const { BR, TL, TR } = setupTest(topLeftCoordinate, lowRightCoordinate);

        expectXY("BR", BR, 150.7, 150.7);
        expectXY("TL", TL, 50.7, 49.3);
        expectXY("TR", TR, 151.4, 150);
      });
      it("low right to top left", () => {
        const { BR, TL, TR } = setupTest(lowRightCoordinate, topLeftCoordinate);

        expectXY("BR", BR, 49.3, 49.3);
        expectXY("TL", TL, 149.3, 150.7);
        expectXY("TR", TR, 48.6, 50);
      });
    });
  });

  describe("precision", () => {
    const hypotenuse = 7.0710678119;
    // const rightAngleEdgelengths = 5;

    // 0.5 gradient
    const shortLength = 3.16227;
    const longLength = 6.32456;

    const midMid = { x: 0, y: 0 };

    describe("top left", () => {
      it("gradient close to horizontal", () => {
        const x = -30;
        const y = -15;

        const { BR } = setupTest(midMid, { x, y }, hypotenuse);

        expect(toDecimalPlaces(BR.x, 10)).to.equal(
          toDecimalPlaces(x - longLength, 10)
        );
        expect(toDecimalPlaces(BR.y, 10)).to.equal(
          toDecimalPlaces(y - shortLength, 10)
        );
      });
      it("gradient close to vertical", () => {
        const x = -15;
        const y = -30;

        const { BR } = setupTest(midMid, { x, y }, hypotenuse);

        expect(toDecimalPlaces(BR.x, 10)).to.equal(
          toDecimalPlaces(x - shortLength, 10)
        );
        expect(toDecimalPlaces(BR.y, 10)).to.equal(
          toDecimalPlaces(y - longLength, 10)
        );
      });
    });

    describe("top right", () => {
      it("gradient close to horizontal", () => {
        const x = 30;
        const y = -15;

        const { BR } = setupTest(midMid, { x, y }, hypotenuse);

        expect(toDecimalPlaces(BR.x, 10)).to.equal(
          toDecimalPlaces(x + longLength, 10)
        );
        expect(toDecimalPlaces(BR.y, 10)).to.equal(
          toDecimalPlaces(y - shortLength, 10)
        );
      });
      it("gradient close to vertical", () => {
        const x = 15;
        const y = -30;

        const { BR } = setupTest(midMid, { x, y }, hypotenuse);

        expect(toDecimalPlaces(BR.x, 10)).to.equal(
          toDecimalPlaces(x + shortLength, 10)
        );
        expect(toDecimalPlaces(BR.y, 10)).to.equal(
          toDecimalPlaces(y - longLength, 10)
        );
      });
    });

    describe("low right", () => {
      it("gradient close to horizontal", () => {
        const x = 30;
        const y = 15;

        const { BR } = setupTest(midMid, { x, y }, hypotenuse);

        expect(toDecimalPlaces(BR.x, 10)).to.equal(
          toDecimalPlaces(x + longLength, 10)
        );
        expect(toDecimalPlaces(BR.y, 10)).to.equal(
          toDecimalPlaces(y + shortLength, 10)
        );
      });
      it("gradient close to vertical", () => {
        const x = 15;
        const y = 30;

        const { BR } = setupTest(midMid, { x, y }, hypotenuse);

        expect(toDecimalPlaces(BR.x, 10)).to.equal(
          toDecimalPlaces(x + shortLength, 10)
        );
        expect(toDecimalPlaces(BR.y, 10)).to.equal(
          toDecimalPlaces(y + longLength, 10)
        );
      });
    });

    describe("low left", () => {
      it("gradient close to horizontal", () => {
        const x = -30;
        const y = 15;

        const { BR } = setupTest(midMid, { x, y }, hypotenuse);

        expect(toDecimalPlaces(BR.x, 10)).to.equal(
          toDecimalPlaces(x - longLength, 10)
        );
        expect(toDecimalPlaces(BR.y, 10)).to.equal(
          toDecimalPlaces(y + shortLength, 10)
        );
      });
      it("gradient close to vertical", () => {
        const x = -15;
        const y = 30;

        const { BR } = setupTest(midMid, { x, y }, hypotenuse);

        expect(toDecimalPlaces(BR.x, 10)).to.equal(
          toDecimalPlaces(x - shortLength, 10)
        );
        expect(toDecimalPlaces(BR.y, 10)).to.equal(
          toDecimalPlaces(y + longLength, 10)
        );
      });
    });
  });
});

// 35 5 10.8333 20.5
// 35 5 8.2613 23.788
