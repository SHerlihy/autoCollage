export const toDecimalPlaces = (val: number, timesToDecimal = 1000) => {
  const grandVal = val * timesToDecimal;

  const roundVal = Math.round(grandVal);

  return roundVal / timesToDecimal;
};
