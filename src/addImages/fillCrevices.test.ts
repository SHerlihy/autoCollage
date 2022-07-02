import { ICoordinates, IPoint } from "../perimeter/pointsTypes";
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
    const setupSingleCreviceTest = (
      imgId: string,
      pointCoordinates: ICoordinates[]
    ) => {
      const imgPerimeter = imgPerimeterFromOrderedArr(imgId, pointCoordinates);

      const pointsArr = pointCoordinates.map((coordinates, index) => {
        return {
          imgId,
          nextImgPointId: `${index + 1}`,
          coordinates,
        } as IPoint;
      });

      const lastPoint = pointsArr.pop();

      pointsArr.push({
        imgId: `${imgId}`,
        nextImgPointId: "0",
        coordinates: lastPoint!.coordinates,
      } as IPoint);

      return {
        imgPerimeter,
      };
    };

    it("returns image perimeter without crevice bottom coordinate", () => {
      const { imgPerimeter } = setupSingleCreviceTest(
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
      const { imgPerimeter } = setupSingleCreviceTest(
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
});

const imgPerimeterFromOrderedArr = (
  imgId: string,
  pointCoordinates: ICoordinates[]
): Map<string, IPoint> => {
  const imagePerimeterArr = pointCoordinates.map((coordinate, idx) => {
    return [
      `${idx}`,
      {
        imgId,
        nextImgPointId: `${idx + 1}`,
        coordinates: coordinate,
      },
    ] as readonly [string, IPoint];
  });

  imagePerimeterArr.pop();
  imagePerimeterArr.push([
    `${pointCoordinates.length - 1}`,
    {
      imgId,
      nextImgPointId: `${0}`,
      coordinates: pointCoordinates[pointCoordinates.length - 1],
    },
  ]);

  return new Map(imagePerimeterArr);
};
