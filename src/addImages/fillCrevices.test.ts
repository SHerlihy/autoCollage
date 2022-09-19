import { coordinatesArrToLinkedPointsMap } from "../perimeter/pointsHelper";
import { fillCrevices } from "./fillCrevices";

describe("fillCrevices", () => {
  describe("single fillable crevice", () => {
    const rectangleTopCreviceCoordinates = [
      { coordinates: { x: 5, y: 5 } },
      { coordinates: { x: 10, y: 5 } },
      { coordinates: { x: 12, y: 10 } },
      { coordinates: { x: 14, y: 5 } },
      { coordinates: { x: 20, y: 5 } },
      { coordinates: { x: 20, y: 20 } },
      { coordinates: { x: 5, y: 20 } },
    ];

    it("returns image perimeter without crevice bottom coordinate", () => {
      const imgPerimeter = coordinatesArrToLinkedPointsMap(
        rectangleTopCreviceCoordinates
      );

      const filledImgPerimeter = fillCrevices(imgPerimeter, 1);
      for (const point of filledImgPerimeter.values()) {
        const { x, y } = point.coordinates;

        const isCrevicePoint = x === 12 && y === 10;

        expect(isCrevicePoint).to.be.false;
      }
    });

    it("returns image perimeter with points between crevice top coordinates", () => {
      const imgPerimeter = coordinatesArrToLinkedPointsMap(
        rectangleTopCreviceCoordinates
      );

      const filledImgPerimeter = fillCrevices(imgPerimeter, 1);

      const pointsBetweenCreviceTops = [...filledImgPerimeter.values()].reduce(
        (acc, point) => {
          const { x, y } = point.coordinates;

          const inXBounds = 10 < x && x < 14;
          const inYBounds = 4 < y && y < 6;

          if (inXBounds && inYBounds) {
            acc++;
          }

          return acc;
        },
        0
      );

      //but wont happen if crevice cant meet min width
      expect(pointsBetweenCreviceTops).to.equal(2);
    });
  });

  describe("star trek shape", () => {
    const trekShape = [
      { coordinates: { x: 5, y: 20 } },
      { coordinates: { x: 35, y: 5 } },
      { coordinates: { x: 10, y: 20 } },
      { coordinates: { x: 35, y: 35 } },
    ];

    it("returns image perimeter without crevice bottom coordinates", () => {
      const imgPerimeter = coordinatesArrToLinkedPointsMap(trekShape, "002");

      const filledImgPerimeter = fillCrevices(imgPerimeter, 1);
      for (const point of filledImgPerimeter.values()) {
        let isCrevicePoint;

        switch (point.coordinates) {
          case { x: 10, y: 20 }:
            isCrevicePoint = true;
            break;
          default:
            isCrevicePoint = false;
        }

        expect(isCrevicePoint).to.be.false;
      }
    });
  });

  describe("crevice close to edge", () => {
    const rectangleCreviceCloseToEdge = [
      { coordinates: { x: 5, y: 5 } },
      { coordinates: { x: 20, y: 5 } },
      { coordinates: { x: 20, y: 30 } },
      { coordinates: { x: 15, y: 35 } },
      { coordinates: { x: 20, y: 40 } },
      { coordinates: { x: 5, y: 40 } },
    ];

    it("returns image perimeter without crevice bottom coordinates", () => {
      debugger;
      const imgPerimeter = coordinatesArrToLinkedPointsMap(
        rectangleCreviceCloseToEdge,
        "002"
      );

      const filledImgPerimeter = fillCrevices(imgPerimeter, 1);
      for (const point of filledImgPerimeter.values()) {
        let isCrevicePoint;

        switch (point.coordinates) {
          case { x: 10, y: 20 }:
            isCrevicePoint = true;
            break;
          default:
            isCrevicePoint = false;
        }

        expect(isCrevicePoint).to.be.false;
      }
    });
  });

  describe("multiple unrelated crevices", () => {
    const rectangleWithCrevicedSide = [
      { coordinates: { x: 5, y: 5 } },
      { coordinates: { x: 20, y: 5 } },
      { coordinates: { x: 20, y: 6 } },
      { coordinates: { x: 8, y: 12 } },
      { coordinates: { x: 20, y: 18 } },
      { coordinates: { x: 20, y: 20 } },
      { coordinates: { x: 10, y: 29 } },
      { coordinates: { x: 20, y: 30 } },
      { coordinates: { x: 15, y: 35 } },
      { coordinates: { x: 20, y: 40 } },
      { coordinates: { x: 5, y: 40 } },
    ];

    it("returns image perimeter without crevice bottom coordinates", () => {
      debugger;
      const imgPerimeter = coordinatesArrToLinkedPointsMap(
        rectangleWithCrevicedSide,
        "002"
      );

      const filledImgPerimeter = fillCrevices(imgPerimeter, 1);
      for (const point of filledImgPerimeter.values()) {
        let isCrevicePoint;

        switch (point.coordinates) {
          case { x: 8, y: 12 }:
          case { x: 10, y: 29 }:
          case { x: 15, y: 35 }:
            isCrevicePoint = true;
            break;
          default:
            isCrevicePoint = false;
        }

        expect(isCrevicePoint).to.be.false;
      }
    });
  });

  // describe("consecutive crevices on same plane", () => {});

  // describe("crevice in crevice", () => {});

  // describe("alcove", () => {});
});
