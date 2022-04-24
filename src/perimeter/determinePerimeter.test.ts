import Sinon from "cypress/types/sinon";
import { determinePerimeterPoints } from "./determinePerimeter";
import * as bleurg from "./nextPerimeterPoint";

describe("determinePerimeter", () => {
  let determineNextPointStub: Sinon.SinonStub<any[], any>;
  
  const nextPerimeterPointClosure = (allPerimeterPoints: string[]) => {
    const perimeterPoints = [...allPerimeterPoints];
    let currentPointIndex = 0;

    const nextPerimeterPoint = () => {
      currentPointIndex++;
      if (currentPointIndex === perimeterPoints.length) {
        currentPointIndex = 0;
      }

      return perimeterPoints[currentPointIndex];
    };

    return nextPerimeterPoint;
  };

  const stubDetermineNextPoint = (allPerimeterPoints: string[]) =>{
    const nextPerimeterPoint = nextPerimeterPointClosure(allPerimeterPoints);

    determineNextPointStub = cy.stub(bleurg, "determineNextPoint").callsFake(nextPerimeterPoint);
  }

  const img1Point1 = {
    imgId: '1',
    nextImgPointId: '2',
    coordinates: { x: 5, y: 5 },
  };
  const img1Point2 = {
    imgId: '1',
    nextImgPointId: '3',
    coordinates: { x: 10, y: 5 },
  };
  const img1Point3 = {
    imgId: '1',
    nextImgPointId: '4',
    coordinates: { x: 10, y: 10 },
  };
  const img1Point4 = {
    imgId: '1',
    nextImgPointId: '1',
    coordinates: { x: 5, y: 10 },
  };

  const img2Point1 = {
    imgId: '2',
    nextImgPointId: '6',
    coordinates: { x: 5, y: 10 },
  };
  const img2Point2 = {
    imgId: '2',
    nextImgPointId: '7',
    coordinates: { x: 6, y: 10 },
  };
  const img2Point3 = {
    imgId: '2',
    nextImgPointId: '8',
    coordinates: { x: 6, y: 11 },
  };
  const img2Point4 = {
    imgId: '2',
    nextImgPointId: '5',
    coordinates: { x: 5, y: 11 },
  };

  const img3Point1 = {
    imgId: '3',
    nextImgPointId: '10',
    coordinates: { x: 5, y: 11 },
  };
  const img3Point2 = {
    imgId: '3',
    nextImgPointId: '11',
    coordinates: { x: 10, y: 11 },
  };
  const img3Point3 = {
    imgId: '3',
    nextImgPointId: '12',
    coordinates: { x: 10, y: 12 },
  };
  const img3Point4 = {
    imgId: '3',
    nextImgPointId: '9',
    coordinates: { x: 5, y: 12 },
  };

  const img1 = {
    1: img1Point1,
    2: img1Point2,
    3: img1Point3,
    4: img1Point4,
  };

  describe("when correct points returned from determineNextPoint", () => {
    const allPerimeterPoints = ['1', '2', '3', '4'];

    beforeEach(() => {
      stubDetermineNextPoint(allPerimeterPoints)
    });

    it("returns all image points when give a single image", () => {
      const allPoints = new Map(Object.entries(img1));

      const perimeterPoints = determinePerimeterPoints(allPoints, 3);

      expect(perimeterPoints).to.deep.equal(allPerimeterPoints);
    });
  });

  describe("provides correct arguments to determineNextPoint", () => {
    const img2 = {
      5: img2Point1,
      6: img2Point2,
      7: img2Point3,
      8: img2Point4,
    };
    const img3 = {
      9: img3Point1,
      10: img3Point2,
      11: img3Point3,
      12: img3Point4,
    };
    // const img4 = {
    //   13: img4Point1,
    //   14: img4Point2,
    //   15: img4Point3,
    //   16: img4Point4,
    // };
    // const img5 = {
    //   17: img5Point1,
    //   18: img5Point2,
    //   19: img5Point3,
    //   20: img5Point4,
    // };
    it.only("provides all image points when only one image present", () => {
      const allPerimeterPoints = ['1', '2', '3', '4'];

      stubDetermineNextPoint(allPerimeterPoints)

      const allPoints = new Map(Object.entries(img1));

      const firstCallOtherPoints = new Map(Object.entries(allPoints));
      firstCallOtherPoints.delete('1');

      const secondCallOtherPoints = new Map(Object.entries(firstCallOtherPoints));
      secondCallOtherPoints.delete('2');

      const thirdCallOtherPoints = new Map(Object.entries(secondCallOtherPoints));
      thirdCallOtherPoints.delete('3');

      const fourthCallOtherPoints = new Map(Object.entries(thirdCallOtherPoints));
      fourthCallOtherPoints.delete('4');

      determinePerimeterPoints(allPoints, 3);

      expect(determineNextPointStub).to.be.calledWith({ x: 5, y: 5 },{ x: 10, y: 5 },3,firstCallOtherPoints)
      expect(determineNextPointStub).to.be.calledWith({ x: 10, y: 5 },{ x: 10, y: 10 },3,secondCallOtherPoints)
      expect(determineNextPointStub).to.be.calledWith({ x: 10, y: 10 },{ x: 5, y: 10 },3,thirdCallOtherPoints)
      expect(determineNextPointStub).to.be.calledWith({ x: 5, y: 10 },{ x: 5, y: 5 },3,fourthCallOtherPoints)
    });

    it("does not provide points recessed beyond the offset", () => {
      const allPerimeterPoints = ['1', '2', '3', '10', '11', '12', '9', '8', '5', '4'];

      stubDetermineNextPoint(allPerimeterPoints)

      const allPoints = new Map([...Object.entries(img1), ...Object.entries(img2), ...Object.entries(img3)]);

      const firstCallOtherPoints = new Map(Object.entries(allPoints));
      firstCallOtherPoints.delete('1');

      const secondCallOtherPoints = new Map(Object.entries(firstCallOtherPoints));
      secondCallOtherPoints.delete('2');

      const thirdCallOtherPoints = new Map(Object.entries(secondCallOtherPoints));
      thirdCallOtherPoints.delete('3');

      const fourthCallOtherPoints = new Map(Object.entries(thirdCallOtherPoints));
      fourthCallOtherPoints.delete('4');

      determinePerimeterPoints(allPoints, 3);

      expect(determineNextPointStub).to.be.calledWith(img1Point3.coordinates,img1Point4.coordinates)
      expect(determineNextPointStub).to.not.be.calledWith(img2Point2.coordinates,img2Point3.coordinates)
      expect(determineNextPointStub).to.not.be.calledWith(img2Point3.coordinates, img2Point4.coordinates)
      expect(determineNextPointStub).to.be.calledWith(img3Point2.coordinates,img3Point3.coordinates)
    });

    // it("does not provide points of image surrounded by others", () => {
    //   const allPoints = new Map(Object.entries(img1));

    //   const firstCallOtherPoints = new Map(Object.entries(allPoints));
    //   firstCallOtherPoints.delete('1');

    //   const secondCallOtherPoints = new Map(Object.entries(firstCallOtherPoints));
    //   secondCallOtherPoints.delete('2');

    //   const thirdCallOtherPoints = new Map(Object.entries(secondCallOtherPoints));
    //   thirdCallOtherPoints.delete('3');

    //   const fourthCallOtherPoints = new Map(Object.entries(thirdCallOtherPoints));
    //   fourthCallOtherPoints.delete('4');

    //   determinePerimeterPoints(allPoints, 3);

    //   expect(determineNextPointStub).to.be.calledWith({ x: 5, y: 5 },{ x: 10, y: 5 },3,firstCallOtherPoints)
    //   expect(determineNextPointStub).to.be.calledWith({ x: 10, y: 5 },{ x: 10, y: 10 },3,secondCallOtherPoints)
    //   expect(determineNextPointStub).to.be.calledWith({ x: 10, y: 10 },{ x: 5, y: 10 },3,thirdCallOtherPoints)
    //   expect(determineNextPointStub).to.be.calledWith({ x: 5, y: 10 },{ x: 5, y: 5 },3,fourthCallOtherPoints)
    // });
  });
});
