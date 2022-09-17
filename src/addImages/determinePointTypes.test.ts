import { coordinatesArrToLinkedPointsMap } from "../perimeter/pointsHelper";
import { determinePointTypes } from "./determinePointTypes";

describe("determinePointTypes", () => {
  describe("square", () => {
    const squareCoordinates = [
      { coordinates: { x: 50, y: 50 } },
      { coordinates: { x: 100, y: 50 } },
      { coordinates: { x: 100, y: 100 } },
      { coordinates: { x: 50, y: 100 } },
    ];
    const squarePerimeterPoints =
      coordinatesArrToLinkedPointsMap(squareCoordinates);

    it("identifies all points as right", () => {
      const typedPerimeterPoints = determinePointTypes(squarePerimeterPoints);

      for (const [_typedPointId, typedPointValue] of typedPerimeterPoints) {
        expect(typedPointValue.type).to.equal("right");
      }
    });
  });
  describe("diamond rectangle", () => {
    const rectangleCoordinates = [
      { coordinates: { x: 100, y: 50 } },
      { coordinates: { x: 170, y: 120 } },
      { coordinates: { x: 150, y: 140 } },
      { coordinates: { x: 80, y: 70 } },
    ];
    const rectanglePerimeterPoints =
      coordinatesArrToLinkedPointsMap(rectangleCoordinates);

    it("identifies all points as right", () => {
      const typedPerimeterPoints = determinePointTypes(
        rectanglePerimeterPoints
      );

      for (const [_typedPointId, typedPointValue] of typedPerimeterPoints) {
        expect(typedPointValue.type).to.equal("right");
      }
    });
  });
  describe("pentagon", () => {
    const pentagonCoordinates = [
      { coordinates: { x: 50, y: 100 } },
      { coordinates: { x: 70, y: 85 } },
      { coordinates: { x: 90, y: 100 } },
      { coordinates: { x: 80, y: 130 } },
      { coordinates: { x: 60, y: 130 } },
    ];
    const pentagonPerimeterPoints =
      coordinatesArrToLinkedPointsMap(pentagonCoordinates);

    it("identifies all points as obtuse", () => {
      const typedPerimeterPoints = determinePointTypes(pentagonPerimeterPoints);

      for (const [_typedPointId, typedPointValue] of typedPerimeterPoints) {
        expect(typedPointValue.type).to.equal("obtuse");
      }
    });
  });
  describe("square with crevice", () => {
    const creviceLeft = { coordinates: { x: 60, y: 50 }, id: "creviceLeft" };
    const creviceBottom = {
      coordinates: { x: 70, y: 55 },
      id: "creviceBottom",
    };
    const creviceRight = { coordinates: { x: 80, y: 50 }, id: "creviceRight" };

    const crevicePrecursors = [creviceLeft, creviceBottom, creviceRight];

    const creviceSquareCoordinates = [
      { coordinates: { x: 50, y: 50 } },
      creviceLeft,
      creviceBottom,
      creviceRight,
      { coordinates: { x: 100, y: 50 } },
      { coordinates: { x: 100, y: 100 } },
      { coordinates: { x: 50, y: 100 } },
    ];
    const creviceSquarePerimeterPoints = coordinatesArrToLinkedPointsMap(
      creviceSquareCoordinates
    );

    it("identifies non-crevice points as right", () => {
      const typedPerimeterPoints = determinePointTypes(
        creviceSquarePerimeterPoints
      );

      for (const crevicePrecursor of crevicePrecursors) {
        typedPerimeterPoints.delete(crevicePrecursor.id);
      }

      for (const [_typedPointId, typedPointValue] of typedPerimeterPoints) {
        expect(typedPointValue.type).to.equal("right");
      }
    });

    it("identifies crevice bottom point as crevice", () => {
      const typedPerimeterPoints = determinePointTypes(
        creviceSquarePerimeterPoints
      );

      const creviceTypedPoint = typedPerimeterPoints.get(creviceBottom.id);

      expect(creviceTypedPoint?.type).to.equal("crevice");
    });

    it("identifies crevice left point as obtuse", () => {
      const typedPerimeterPoints = determinePointTypes(
        creviceSquarePerimeterPoints
      );

      const creviceTypedPoint = typedPerimeterPoints.get(creviceLeft.id);

      expect(creviceTypedPoint?.type).to.equal("obtuse");
    });

    it("identifies crevice right point as obtuse", () => {
      const typedPerimeterPoints = determinePointTypes(
        creviceSquarePerimeterPoints
      );

      const creviceTypedPoint = typedPerimeterPoints.get(creviceRight.id);

      expect(creviceTypedPoint?.type).to.equal("obtuse");
    });
  });
  describe("shuriken shape", () => {
    const topTip = { coordinates: { x: 100, y: 50 }, id: "topTip" };
    const rightTip = { coordinates: { x: 150, y: 150 }, id: "rightTip" };
    const leftTip = { coordinates: { x: 50, y: 150 }, id: "leftTip" };

    const leftCrev = { coordinates: { x: 110, y: 90 }, id: "leftCrev" };
    const rightCrev = { coordinates: { x: 90, y: 90 }, id: "rightCrev" };
    const lowCrev = { coordinates: { x: 100, y: 110 }, id: "lowCrev" };

    const shurikenCoordinates = [
      topTip,
      rightCrev,
      rightTip,
      lowCrev,
      leftTip,
      leftCrev,
    ];

    const shurikenPerimeterPoints =
      coordinatesArrToLinkedPointsMap(shurikenCoordinates);

    it("identifies crevices as crevice", () => {
      const typedPerimeterPoints = determinePointTypes(shurikenPerimeterPoints);

      expect(typedPerimeterPoints.get(leftCrev.id)?.type).to.equal("crevice");
      expect(typedPerimeterPoints.get(rightCrev.id)?.type).to.equal("crevice");
      expect(typedPerimeterPoints.get(lowCrev.id)?.type).to.equal("crevice");
    });

    it("identifies tips as acute", () => {
      const typedPerimeterPoints = determinePointTypes(shurikenPerimeterPoints);

      expect(typedPerimeterPoints.get(topTip.id)?.type).to.equal("acute");
      expect(typedPerimeterPoints.get(rightTip.id)?.type).to.equal("acute");
      expect(typedPerimeterPoints.get(leftTip.id)?.type).to.equal("acute");
    });
  });

  describe("triangle with alcove", () => {
    const rightTip = { coordinates: { x: 150, y: 50 }, id: "rightTip" };
    const leftTip = { coordinates: { x: 50, y: 50 }, id: "leftTip" };
    const lowTip = { coordinates: { x: 100, y: 150 }, id: "lowTip" };

    const leftAlcove = { coordinates: { x: 90, y: 100 }, id: "leftAlcove" };
    const rightAlcove = { coordinates: { x: 110, y: 100 }, id: "rightAlcove" };

    const triAlcoveCoordinates = [
      leftTip,
      leftAlcove,
      rightAlcove,
      rightTip,
      lowTip,
    ];

    const triAlcovePerimeterPoints =
      coordinatesArrToLinkedPointsMap(triAlcoveCoordinates);

    it("identifies alcove points as crevice", () => {
      const typedPerimeterPoints = determinePointTypes(
        triAlcovePerimeterPoints
      );

      expect(typedPerimeterPoints.get(leftAlcove.id)?.type).to.equal("crevice");
      expect(typedPerimeterPoints.get(rightAlcove.id)?.type).to.equal(
        "crevice"
      );
    });

    it("identifies tips are acute", () => {
      const typedPerimeterPoints = determinePointTypes(
        triAlcovePerimeterPoints
      );

      expect(typedPerimeterPoints.get(rightTip.id)?.type).to.equal("acute");
      expect(typedPerimeterPoints.get(leftTip.id)?.type).to.equal("acute");
      expect(typedPerimeterPoints.get(lowTip.id)?.type).to.equal("acute");
    });
  });
});
