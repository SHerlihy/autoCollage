export const removeUndefinedArrElements = <T>(arr: Array<T | undefined>) => {
  const definedArr = arr.filter((el) => el !== undefined);

  if (definedArr.length === 0) {
    return [];
  }

  return definedArr as T[];
};
