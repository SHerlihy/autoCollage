import { createImgPerimeterFromOrderedCoordinates } from "../testHelperFunctions";
import { fillCrevices } from "./fillCrevices";

describe("fillCrevices", () => {
  describe("single fillable crevice", () => {
    const rectangleTopCreviceCoordinates = [
      { x: 5, y: 5 },
      { x: 10, y: 5 },
      { x: 12, y: 10 },
      { x: 14, y: 5 },
      { x: 20, y: 5 },
      { x: 20, y: 20 },
      { x: 5, y: 20 },
    ];

    it("returns image perimeter without crevice bottom coordinate", () => {
      const { imgPerimeter } = createImgPerimeterFromOrderedCoordinates(
        "001",
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
      const { imgPerimeter } = createImgPerimeterFromOrderedCoordinates(
        "001",
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
      { x: 5, y: 20 },
      { x: 35, y: 5 },
      { x: 10, y: 20 },
      { x: 35, y: 35 },
    ];

    it("returns image perimeter without crevice bottom coordinates", () => {
      const { imgPerimeter } = createImgPerimeterFromOrderedCoordinates(
        "002",
        trekShape
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

  describe("crevice close to edge", () => {
    const rectangleCreviceCloseToEdge = [
      { x: 5, y: 5 },
      { x: 20, y: 5 },
      { x: 20, y: 30 },
      { x: 15, y: 35 },
      { x: 20, y: 40 },
      { x: 5, y: 40 },
    ];

    it("returns image perimeter without crevice bottom coordinates", () => {
      const { imgPerimeter } = createImgPerimeterFromOrderedCoordinates(
        "002",
        rectangleCreviceCloseToEdge
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
      { x: 5, y: 5 },
      { x: 20, y: 5 },
      { x: 20, y: 6 },
      { x: 8, y: 12 },
      { x: 20, y: 18 },
      { x: 20, y: 20 },
      { x: 10, y: 29 },
      { x: 20, y: 30 },
      { x: 15, y: 35 },
      { x: 20, y: 40 },
      { x: 5, y: 40 },
    ];

    it("returns image perimeter without crevice bottom coordinates", () => {
      const { imgPerimeter } = createImgPerimeterFromOrderedCoordinates(
        "002",
        rectangleWithCrevicedSide
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

  describe("consecutive crevices on same plane", () => {});

  describe("crevice in crevice", () => {});

  describe("alcove", () => {});
});