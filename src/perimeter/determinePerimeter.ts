import { validatePerimeter } from "../addImages/shapeHelpers";
import { determineAgglomeratedPerimeterPoints } from "./determineAgglomeratedPerimeterIds";
import { determineCrevicedPerimeterPoints } from "./determineCrevicedPerimeter";
import { IPointsMap } from "./pointsTypes";

export const determinePerimeter = (perimeterPoints: IPointsMap) => {
  const unfilledPerimeter =
    determineAgglomeratedPerimeterPoints(perimeterPoints);

  const filledPerimeter = determineCrevicedPerimeterPoints(perimeterPoints);

  return validatePerimeter(unfilledPerimeter, filledPerimeter);
};
