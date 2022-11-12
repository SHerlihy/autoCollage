export const removeUndefinedArrElements = <T>(arr: Array<T | undefined>) => {
  const definedArr = arr.filter((el) => el !== undefined);

  if (definedArr.length === 0) {
    return [];
  }

  return definedArr as T[];
};

export const getRandomIndex = <T>(arr: Array<T>) => {
  const arrImagesCount = arr.length;
  // const extraCount = arrImagesCount + 1;
  return Math.floor(Math.random() * arrImagesCount);
};
