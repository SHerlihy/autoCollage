import Sinon from "cypress/types/sinon";
import {IPoint, IPointsMap} from "../perimeter/pointsTypes"

import { img1Point1, img1Point2, img1Point3, img1Point4, img4Point1, img4Point2, img4Point3, img5Point2, img5Point3, img5Point4, img6Point1, img6Point3, img6Point4 } from "../perimeter/imagePointExamples"

import {CreateIds} from "./createIds";
import { EdgeType, generateEdgesMap, IEdgesMap } from "./generateEdgesMap"

const ascendingArrNumKeyMap = (numKeyMap: Map<string, any>): [string, any][] =>{
  return [...numKeyMap.entries()].sort(([curKey], [nextKey])=>{
    return parseInt(curKey) - parseInt(nextKey)
  })
}

describe("generateEdgesMap", ()=>{
  let generateIdsStub: Sinon.SinonStub<any[], any>;;

  const incrementClosure = (initVal: number) => {
    let value = initVal;

    const nextVal = (): string => {
      value++

      return `${value}`
    }

    return nextVal;
  }

  const stubGenerateNovelId = (initVal: number) => {
    const nextStubbedId = incrementClosure(initVal);

    generateIdsStub = cy.stub(CreateIds.getInstance(), "generateNovelId").callsFake(nextStubbedId);
  }

  const expectMatchingNextCoordinates = (pointsMap: IPointsMap) =>{
    stubGenerateNovelId(0);

    const returnedEdgesMap = generateEdgesMap(pointsMap);
    debugger;
    for (const [returnedEdgeKey, returnedEdgeValue] of returnedEdgesMap) {
      const nextReturnedEdgeValue = returnedEdgesMap.get(returnedEdgeValue.nextEdge)
      expect(returnedEdgeValue.coordinates.to).to.deep.equal(nextReturnedEdgeValue?.coordinates.from);
    }
  }

  describe("perimeter of an image", ()=>{
    const pointsMap = new Map<string, IPoint>([
      ['1', img1Point1],
      ['2', img1Point2],
      ['3', img1Point3],
      ['4', img1Point4],
    ])

    const setupEdgesMap = () => {
      const edge1 = {
        coordinates: {
          from: img1Point1,
          to: img1Point2
        },
        nextEdge: '2',
        type: 'bothObtuse' as EdgeType
      }
  
      const edge2 = {
        coordinates: {
          from: img1Point2,
          to: img1Point3
        },
        nextEdge: '3',
        type: 'bothObtuse' as EdgeType
      }
  
      const edge3 = {
        coordinates: {
          from: img1Point3,
          to: img1Point4
        },
        nextEdge: '4',
        type: 'bothObtuse' as EdgeType
      }
  
      const edge4 = {
        coordinates: {
          from: img1Point4,
          to: img1Point1
        },
        nextEdge: '1',
        type: 'bothObtuse' as EdgeType
      }
  
      const expectedEdgesMap = new Map([
        ['1', edge3],
        ['2', edge4],
        ['3', edge1],
        ['4', edge2],
      ]) as IEdgesMap;
  
      return expectedEdgesMap;
    }

    it('returns coordinates that match the next edge coordinates', ()=>{
      expectMatchingNextCoordinates(pointsMap);
    })

    it('returns an edges map', ()=>{
      stubGenerateNovelId(0);

      const expectedEdgesMap = setupEdgesMap();

      const returnedEdgesMap = generateEdgesMap(pointsMap);

      for (const [expectedEdgeId, expectedEdgeValue] of expectedEdgesMap) {
        const returnedEdgeValue = returnedEdgesMap.get(expectedEdgeId)
        expect(returnedEdgeValue?.coordinates).to.deep.equal(expectedEdgeValue.coordinates)
      }
    })

    it.only('returns all right angles as both obtuse', ()=>{
      stubGenerateNovelId(0);

      const returnedEdgesMap = generateEdgesMap(pointsMap);

      for (const [_key, value] of returnedEdgesMap) {
        expect(value.type).to.equal('bothObtuse');
      }
    })
  })
})

