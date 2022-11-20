import { determineNextPoint } from "./nextPerimeterPoint";
import { determineTopPointId } from "./pointsHelper";
import { IPoint, IPointsMap } from "./pointsTypes";

interface IThresholdManagement {
  getThreshold: () => number;
  decreaseThreshold: () => void;
  resetThreshold: () => void;
  isBelowBase: () => boolean;
}

interface IRecursionManager {
  isLooping: (current: string) => boolean;
  setLoop: (currentLoop: string[]) => void;
  isLoopCleared: () => boolean;
}

const recursionManager = (): IRecursionManager => {
  let loop: Array<string> = [];
  let loopCleared = false;

  const setLoop = (currentLoop: string[]) => {
    if (currentLoop.length) {
      loopCleared = false;
    }

    loop = currentLoop;
  };

  const isLooping = (current: string) => {
    const loopVal = loop.shift();

    if (loopVal && loop.length === 0) {
      loopCleared = true;
    }

    return loopVal === current;
  };

  const isLoopCleared = () => {
    return loopCleared;
  };

  return {
    isLooping,
    setLoop,
    isLoopCleared,
  };
};

const thresholdManager = (
  initialThreshold: number,
  reductionBase: number
): IThresholdManagement => {
  let threshold = initialThreshold;

  const decreaseThreshold = () => {
    threshold = threshold / 2;
  };

  const resetThreshold = () => {
    threshold = initialThreshold;
  };

  const getThreshold = () => threshold;

  const isBelowBase = () => {
    return threshold < reductionBase;
  };

  return {
    getThreshold,
    decreaseThreshold,
    resetThreshold,
    isBelowBase,
  };
};

export const determineCrevicedPerimeterPoints = (
  perimeterPoints: IPointsMap
) => {
  const topPointId = determineTopPointId(perimeterPoints);
  const nextImagePointId = perimeterPoints.get(topPointId)!.nextImgPointId;

  const perimeterPointIds = determineRemainingPerimeterPointIds(
    topPointId,
    nextImagePointId,
    perimeterPoints
  );

  return perimeterPointIds;
};

const determineRemainingPerimeterPointIds = (
  startingPointId: string,
  startingNextImagePointId: string,
  allPoints: IPointsMap
): IPointsMap => {
  const perimeterPoints = new Map<string, IPoint>();
  const visitedPoints: Array<string> = [];

  const newCurrentPoint = setFirstPerimeterPoints(
    startingPointId,
    startingNextImagePointId,
    allPoints
  );

  const { nextImgPointId: newNextImgPointId } = newCurrentPoint;

  visitedPoints.push(startingNextImagePointId);
  perimeterPoints.set(startingPointId, newCurrentPoint);

  if (newNextImgPointId === startingPointId) {
    return perimeterPoints;
  }

  const nextNextId = allPoints.get(newNextImgPointId)!.nextImgPointId;

  const allOtherPoints = new Map(allPoints);

  const thresholdManagement = thresholdManager(5, 0.6);
  const recursionManagement = recursionManager();

  setRemainingPerimeterPoints(
    startingPointId,
    newNextImgPointId,
    nextNextId,
    allPoints,
    allOtherPoints,
    perimeterPoints,
    thresholdManagement,
    recursionManagement,
    visitedPoints
  );

  return perimeterPoints;
};

const setRemainingPerimeterPoints = (
  startingPointId: string,
  currentPointId: string,
  potentialNextPointId: string,
  allPoints: IPointsMap,
  allOtherPoints: IPointsMap,
  perimeterPoints: Map<string, IPoint>,
  thresholdManagement: IThresholdManagement,
  recursionManagement: IRecursionManager,
  visitedPoints: string[]
) => {
  const potentialNextPoint = allPoints.get(potentialNextPointId)!;

  const currentPoint = allPoints.get(currentPointId)!;

  console.log(currentPoint.coordinates);

  const { coordinates: currentImageCoordinate } = currentPoint;

  const otherPoints = new Map(allOtherPoints);

  otherPoints.delete(currentPointId);

  if (
    !recursionManagement.isLoopCleared() &&
    !recursionManagement.isLooping(currentPointId)
  ) {
    thresholdManagement.resetThreshold();

    recursionManagement.setLoop([]);
  }

  let nextPointId = thresholdManagement.isBelowBase()
    ? potentialNextPointId
    : determineNextPoint(
        currentPoint,
        potentialNextPoint,
        otherPoints,
        visitedPoints,
        thresholdManagement.getThreshold()
      );

  if (nextPointId === startingPointId) {
    const newCurrentPoint = { ...allPoints.get(currentPointId)! };
    newCurrentPoint.nextImgPointId = nextPointId;

    perimeterPoints.set(currentPointId, newCurrentPoint);

    return;
  }

  visitedPoints.push(nextPointId);
  visitedPoints.push(potentialNextPointId);
  visitedPoints.push(currentPointId);

  // if (perimeterPoints.has(nextPointId)) {
  //   handleLooping(
  //     startingPointId,
  //     nextPointId,
  //     allPoints,
  //     allOtherPoints,
  //     perimeterPoints,
  //     thresholdManagement,
  //     recursionManagement,
  //     visitedPoints
  //   );

  //   return;
  // }

  const newCurrentPoint = { ...allPoints.get(currentPointId)! };
  newCurrentPoint.nextImgPointId = nextPointId;

  perimeterPoints.set(currentPointId, newCurrentPoint);

  const nextPointPotentialNextId = allPoints.get(nextPointId)!.nextImgPointId;

  setRemainingPerimeterPoints(
    startingPointId,
    nextPointId,
    nextPointPotentialNextId,
    allPoints,
    allOtherPoints,
    perimeterPoints,
    thresholdManagement,
    recursionManagement,
    visitedPoints
  );

  return;
};

const handleLooping = (
  startingPointId: string,
  nextPointId: string,
  allPoints: IPointsMap,
  allOtherPoints: IPointsMap,
  perimeterPoints: Map<string, IPoint>,
  thresholdManagement: IThresholdManagement,
  recursionManagement: IRecursionManager,
  visitedPoints: string[]
) => {
  const perimeterIdsArr = [...perimeterPoints.keys()];
  const initialLoopIdx = perimeterIdsArr.findIndex((pointId) => {
    return pointId === nextPointId;
  });

  const loopIds = perimeterIdsArr.slice(initialLoopIdx);

  recursionManagement.setLoop(loopIds);

  for (const loopId of loopIds) {
    perimeterPoints.delete(loopId);
  }

  thresholdManagement.decreaseThreshold();

  const nextPointPotentialNextId = allPoints.get(nextPointId)!.nextImgPointId;

  setRemainingPerimeterPoints(
    startingPointId,
    nextPointId,
    nextPointPotentialNextId,
    allPoints,
    allOtherPoints,
    perimeterPoints,
    thresholdManagement,
    recursionManagement,
    visitedPoints
  );
};

const setFirstPerimeterPoints = (
  startingPointId: string,
  startingNextImagePointId: string,
  allPoints: IPointsMap
) => {
  const potentialNextPoint = allPoints.get(startingNextImagePointId)!;

  const startingPoint = allPoints.get(startingPointId)!;

  const firstPassPoints = new Map(allPoints);

  firstPassPoints.delete(startingPointId);

  const nextPointId = determineNextPoint(
    startingPoint,
    potentialNextPoint,
    firstPassPoints,
    []
  );

  const newCurrentPoint = { ...allPoints.get(startingPointId)! };
  newCurrentPoint.nextImgPointId = nextPointId;

  return newCurrentPoint;
};
