export const getRadiansFromSides = (opposite, sideA, sideB) => {
  const A2 = sideA ** 2;
  const B2 = sideB ** 2;
  const opposite2 = opposite ** 2;

  const nominator = A2 + B2 - opposite2;
  const denominator = 2 * sideA * sideB;

  return Math.acos(nominator / denominator);
};

export const getNonHypotenuseSideFromSides = (hyp, side) => {
  const hyp2 = hyp ** 2;
  const side2 = side ** 2;

  const squaredSide = hyp2 - side2;

  return squaredSide ** 0.5;
};
export const getHypotenuseSideFromSides = (sideA, sideB) => {
  const sideA2 = sideA ** 2;
  const sideB2 = sideB ** 2;

  const squaredSide = sideA2 + sideB2;

  return squaredSide ** 0.5;
};

export const getDegreesFromNonHypotenuseSides = (opposite, adjacent) => {
  const rads = getRadiansFromNonHypotenuseSides(opposite, adjacent);

  return radiansToDegrees(rads);
};

export const getRadiansFromNonHypotenuseSides = (opposite, adjacent) => {
  const radians = Math.atan(opposite / adjacent);

  return radians;
};

export const SOHOppositeSideFromDegrees = (hyp, oppDegrees) => {
  const rads = degreesToRads(oppDegrees);

  return SOHOppositeSideFromRadians(hyp, rads);
};

export const SOHOppositeSideFromRadians = (hyp, oppRads) => {
  return hyp * Math.sin(oppRads);
};

export const getSideLengthFromDegreesAndSide = (
  sideA,
  degreesA,
  degreesOpp
) => {
  const radiansA = degreesToRads(degreesA);
  const radiansOpp = degreesToRads(degreesOpp);

  return getSideLengthFromRadiansAndSide(sideA, radiansA, radiansOpp);
};

export const getSideLengthFromRadiansAndSide = (
  sideA,
  radiansA,
  radiansOpp
) => {
  const resolvedPair = sideA / Math.sin(radiansA);

  return resolvedPair * Math.sin(radiansOpp);
};

export const radiansToDegrees = (rads) => {
  return (rads * 180) / Math.PI;
};

export const degreesToRads = (angle) => {
  return (angle * Math.PI) / 180;
};

export const getRadiansFromSideLengths = (
  oppositeSide,
  angleSideA,
  angleSideB
) => {
  const preCos =
    (angleSideB ** 2 + angleSideA ** 2 - oppositeSide ** 2) /
    (2 * angleSideB * angleSideA);
  return Math.acos(preCos);
};

export const edgeLengthFromOppAngleAndEdges = (oppositeAngle, edgeA, edgeB) => {
  const angleRads = degreesToRads(oppositeAngle);
  const resolvedCosRads = Math.cos(angleRads);
  const deduction = 2 * edgeA * edgeB * resolvedCosRads;
  const addition = edgeA ** 2 + edgeB ** 2;

  return (addition - deduction) ** 0.5;
};

export const edgeLengthFromCoordinates = (
  { x: fromX, y: fromY },
  { x: toX, y: toY }
) => {
  const sideX = Math.abs(fromX - toX);
  const sideY = Math.abs(fromY - toY);

  return getHypotenuseSideFromSides(sideX, sideY);
};

export const radiansFromCoordinates = (
  prevCoordinates,
  subjectCoordinates,
  nextCoordinates
) => {
  const subjectPrevSide = edgeLengthFromCoordinates(
    subjectCoordinates,
    prevCoordinates
  );
  const subjectNextSide = edgeLengthFromCoordinates(
    subjectCoordinates,
    nextCoordinates
  );
  const prevNextSide = edgeLengthFromCoordinates(
    prevCoordinates,
    nextCoordinates
  );

  return getRadiansFromSideLengths(
    prevNextSide,
    subjectPrevSide,
    subjectNextSide
  );
};
