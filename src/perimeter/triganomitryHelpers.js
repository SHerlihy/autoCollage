export const getAngleFromSides = (opposite, sideA, sideB) => {
  const A2 = sideA ** 2;
  const B2 = sideB ** 2;
  const opposite2 = opposite ** 2;

  const nominator = A2 + B2 - opposite2;
  const denominator = 2 * sideA * sideB;

  return Math.cosh(nominator / denominator);
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

export const getRadiansFromNonHypotenuseSides = (opposite, adjacent) => {
  const radians = Math.atan(opposite / adjacent);

  return radians;
};

export const SOHOppositeSide = (hyp, oppRads) => {
  return hyp * Math.sin(oppRads);
};

export const getSideLengthFromAnglesAndSide = (sideA, angleA, angleOpp) => {
  const resolvedPair = sideA / Math.sin(angleA);

  return resolvedPair * Math.sin(angleOpp);
};

const radiansToAngle = (rads) => {
  return (rads * 180) / Math.PI;
};

export const getAngleFromSideLengths = (
  oppositeSide,
  angleSideA,
  angleSideB
) => {
  const preCos =
    (angleSideB ** 2 + angleSideA ** 2 - oppositeSide ** 2) /
    (2 * angleSideB * angleSideA);
  return radiansToAngle(Math.acos(preCos));
};

export const edgeLengthFromCoordinates = (
  { x: fromX, y: fromY },
  { x: toX, y: toY }
) => {
  const sideX = Math.abs(fromX - toX);
  const sideY = Math.abs(fromY - toY);

  return getHypotenuseSideFromSides(sideX, sideY);
};

export const angleFromCoordinates = (
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

  return getAngleFromSideLengths(
    prevNextSide,
    subjectPrevSide,
    subjectNextSide
  );
};
