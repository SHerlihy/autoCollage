export const toDecimalPlaces = (val: number, timesToDecimal = 1000) => {
  const grandVal = val * timesToDecimal;

  const roundVal = Math.round(grandVal);

  return roundVal / timesToDecimal;
};

export const withinEpsilonBounds = (
  subject: number,
  target: number,
  epsilonFactor = 10
) => {
  const epsilonBounds = Number.EPSILON * epsilonFactor;

  const upperEpsilon = subject + epsilonBounds;
  const lowerEpsilon = subject - epsilonBounds;

  if (target === upperEpsilon || target === lowerEpsilon) {
    return true;
  }

  if (lowerEpsilon < target && target < upperEpsilon) {
    return true;
  }

  return false;
};
