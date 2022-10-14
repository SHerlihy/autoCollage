import Sinon from "cypress/types/sinon";
import { determinePerimeterPoints } from "./determinePerimeter";
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

  describe("when separate perimeters are agglomerated", () => {
    const separatePerimetersPointsMap = new Map([
      [
        "54dd74ec-8477-446c-a560-7dcbd9bb995b",
        {
          imgId: "c5ab24a9-b757-431a-8592-678fd275949f",
          currentImgPointId: "54dd74ec-8477-446c-a560-7dcbd9bb995b",
          nextImgPointId: "76152db9-6d0a-4288-b28b-0c161133ddd5",
          coordinates: {
            x: 0,
            y: 0,
          },
        },
      ],
      [
        "76152db9-6d0a-4288-b28b-0c161133ddd5",
        {
          imgId: "c5ab24a9-b757-431a-8592-678fd275949f",
          currentImgPointId: "76152db9-6d0a-4288-b28b-0c161133ddd5",
          nextImgPointId: "55c823b4-495f-45cc-9c66-5783f2fa4b43",
          coordinates: {
            x: 220,
            y: 0,
          },
        },
      ],
      [
        "55c823b4-495f-45cc-9c66-5783f2fa4b43",
        {
          imgId: "c5ab24a9-b757-431a-8592-678fd275949f",
          currentImgPointId: "55c823b4-495f-45cc-9c66-5783f2fa4b43",
          nextImgPointId: "297c1057-eaa3-47d3-8ce3-d4df435be4b2",
          coordinates: {
            x: 220,
            y: 277,
          },
        },
      ],
      [
        "297c1057-eaa3-47d3-8ce3-d4df435be4b2",
        {
          imgId: "c5ab24a9-b757-431a-8592-678fd275949f",
          currentImgPointId: "297c1057-eaa3-47d3-8ce3-d4df435be4b2",
          nextImgPointId: "54dd74ec-8477-446c-a560-7dcbd9bb995b",
          coordinates: {
            x: 0,
            y: 277,
          },
        },
      ],
      [
        "7e206a91-e32b-4630-a7b8-b85ae1a83a1a",
        {
          imgId: "582a802b-1bec-401b-8ba0-29afe194aaa9",
          currentImgPointId: "7e206a91-e32b-4630-a7b8-b85ae1a83a1a",
          nextImgPointId: "bb65b076-f9cb-4440-8512-b195ff16953a",
          coordinates: {
            x: -110,
            y: -277,
          },
        },
      ],
      [
        "bb65b076-f9cb-4440-8512-b195ff16953a",
        {
          imgId: "582a802b-1bec-401b-8ba0-29afe194aaa9",
          currentImgPointId: "bb65b076-f9cb-4440-8512-b195ff16953a",
          nextImgPointId: "a395551e-a0e9-492b-a0bf-3f8c87fef9c7",
          coordinates: {
            x: 110,
            y: -277,
          },
        },
      ],
      [
        "a395551e-a0e9-492b-a0bf-3f8c87fef9c7",
        {
          imgId: "582a802b-1bec-401b-8ba0-29afe194aaa9",
          currentImgPointId: "a395551e-a0e9-492b-a0bf-3f8c87fef9c7",
          nextImgPointId: "e1cf17bf-e67c-400a-b331-f6f7210e020b",
          coordinates: {
            x: 110,
            y: 0,
          },
        },
      ],
      [
        "e1cf17bf-e67c-400a-b331-f6f7210e020b",
        {
          imgId: "582a802b-1bec-401b-8ba0-29afe194aaa9",
          currentImgPointId: "e1cf17bf-e67c-400a-b331-f6f7210e020b",
          nextImgPointId: "7e206a91-e32b-4630-a7b8-b85ae1a83a1a",
          coordinates: {
            x: -110,
            y: 0,
          },
        },
      ],
      [
        "7442cad6-387e-4202-93f6-b670d6d47a35",
        {
          imgId: "2d131e6f-dc37-4364-9e98-a49dd23a280e",
          currentImgPointId: "7442cad6-387e-4202-93f6-b670d6d47a35",
          nextImgPointId: "7047517d-9bd2-44b8-b52e-9ac9a54f07c3",
          coordinates: {
            x: 146.66666666666666,
            y: -277,
          },
        },
      ],
      [
        "7047517d-9bd2-44b8-b52e-9ac9a54f07c3",
        {
          imgId: "2d131e6f-dc37-4364-9e98-a49dd23a280e",
          currentImgPointId: "7047517d-9bd2-44b8-b52e-9ac9a54f07c3",
          nextImgPointId: "c4491a47-b872-4de4-b86a-324b0d81c688",
          coordinates: {
            x: 366.66666666666663,
            y: -277,
          },
        },
      ],
      [
        "c4491a47-b872-4de4-b86a-324b0d81c688",
        {
          imgId: "2d131e6f-dc37-4364-9e98-a49dd23a280e",
          currentImgPointId: "c4491a47-b872-4de4-b86a-324b0d81c688",
          nextImgPointId: "42f12355-e427-41e1-b6ef-873d2efb6111",
          coordinates: {
            x: 366.66666666666663,
            y: 0,
          },
        },
      ],
      [
        "42f12355-e427-41e1-b6ef-873d2efb6111",
        {
          imgId: "2d131e6f-dc37-4364-9e98-a49dd23a280e",
          currentImgPointId: "42f12355-e427-41e1-b6ef-873d2efb6111",
          nextImgPointId: "7442cad6-387e-4202-93f6-b670d6d47a35",
          coordinates: {
            x: 146.66666666666666,
            y: 0,
          },
        },
      ],
    ]);
    it("does not fail when agglomerating perimeters", () => {
      const agglomeratedPerimeter = determinePerimeterPoints(
        separatePerimetersPointsMap
      );

      expect(agglomeratedPerimeter).to.exist;
    });
  });
});
