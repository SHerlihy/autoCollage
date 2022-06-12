import { ICoordinates, IPoint, IPointsMap } from "../perimeter/pointsTypes";
import { fillCrevices } from "./fillCrevices";
import * as generateEdgesMapModule from "./generateEdgesMap";

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
      pointCoordinates: ICoordinates[],
      preCreviceIndexes: number[]
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

      const edgesArr = pointsArr.map((point, index, arr) => {
        const toCrevice = preCreviceIndexes.find((cIdx) => cIdx === index)
          ? "crevice"
          : "right";
        return [
          `${index}`,
          {
            points: {
              from: point,
              to: arr[index + 1],
            },
            nextEdge: `${index + 1}`,
            type: {
              from: "right",
              to: toCrevice,
            },
          },
        ] as readonly [string, generateEdgesMapModule.IEdge];
      });

      const lastEdge = edgesArr.pop();

      lastEdge![1].points.to = pointsArr[0];

      debugger;

      generateEdgesMapModule.stubGenerateEdgesMap(() => new Map(edgesArr));

      return {
        imgPerimeter,
      };
    };

    it.only("returns image perimeter without crevice bottom coordinate", () => {
      const { imgPerimeter } = setupSingleCreviceTest(
        "001",
        rectangleTopCreviceCoordinates,
        [0]
      );

      const filledImgPerimeter = fillCrevices(imgPerimeter, 1);
      debugger;
      for (const point of filledImgPerimeter.values()) {
        const { x, y } = point.coordinates;

        const isCrevicePoint = x === 12 && y === 10;

        expect(isCrevicePoint).to.be.false;
      }
    });

    it("returns image perimeter with points between crevice top coordinates", () => {
      const { imgPerimeter } = setupSingleCreviceTest(
        "001",
        rectangleTopCreviceCoordinates,
        [1]
      );

      const filledImgPerimeter = fillCrevices(imgPerimeter, 1);

      const pointsBetweenCreviceTops = [...filledImgPerimeter.values()].reduce(
        (acc, point) => {
          const { x, y } = point.coordinates;

          const inXBounds = 10 < x && x < 14;
          const inYBounds = 5 < y && y < 110;

          if (inXBounds && inYBounds) {
            acc++;
          }

          return acc;
        },
        0
      );

      //but wont happen if crevice cant meet min width
      expect(pointsBetweenCreviceTops).to.be.greaterThan(1);
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
