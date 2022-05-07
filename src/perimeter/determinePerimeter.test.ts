import Sinon from "cypress/types/sinon";
import { determinePerimeterPoints } from "./determinePerimeter";
import { img1, img1Point3, img1Point4, img2, img2Point2, img2Point3, img2Point4, img3, img3Point2, img3Point3 } from "./imagePointExamples";
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
  });
});
