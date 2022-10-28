import Sinon from "cypress/types/sinon";
import { determinePerimeterPoints } from "./determinePerimeter";
import {
  recursingMap,
  separatePerimetersPointsMap,
} from "./determinePerimeterVivoTestData";
import { img1 } from "./imagePointExamples";
import * as nextPerimeterPointModule from "./nextPerimeterPoint";
import { getPerimeterPointIds } from "./pointsHelper";
import { IPointsMap } from "./pointsTypes";

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

describe("determinePerimeter", () => {
  let determineNextPointStub: Sinon.SinonStub<any[], any>;

  const stubDetermineNextPoint = (allPerimeterPoints: string[]) => {
    const nextPerimeterPoint = nextPerimeterPointClosure(allPerimeterPoints);

    determineNextPointStub = cy
      .stub(nextPerimeterPointModule, "determineNextPoint")
      .callsFake(nextPerimeterPoint);
  };

  describe("when correct points returned from determineNextPoint", () => {
    it("returns all image points when give a single image", () => {
      const determineNextPointIdProgression = ["1", "2", "3", "4"];

      stubDetermineNextPoint(determineNextPointIdProgression);

      const allPoints = new Map(Object.entries(img1)) as IPointsMap;

      const perimeterPoints = determinePerimeterPoints(allPoints);

      const newPerimeterPointIds = getPerimeterPointIds("1", perimeterPoints);

      expect(newPerimeterPointIds).to.deep.equal(
        determineNextPointIdProgression
      );
    });

    it("returns correct points when one id is skipped/removed", () => {
      const determineNextPointIdProgression = ["1", "3", "4"];

      stubDetermineNextPoint(determineNextPointIdProgression);

      const allPoints = new Map(Object.entries(img1)) as IPointsMap;

      const perimeterPoints = determinePerimeterPoints(allPoints);

      const newPerimeterPointIds = getPerimeterPointIds("1", perimeterPoints);

      expect(newPerimeterPointIds).to.deep.equal(
        determineNextPointIdProgression
      );
    });
  });

  describe("en vivo failures", () => {
    it("does not infinately recurse", () => {
      const agglomeratedPerimeter = determinePerimeterPoints(recursingMap);

      expect(agglomeratedPerimeter).to.exist;
    });
    it("does not fail when agglomerating perimeters", () => {
      const agglomeratedPerimeter = determinePerimeterPoints(
        separatePerimetersPointsMap
      );

      expect(agglomeratedPerimeter).to.exist;
    });
  });
});
