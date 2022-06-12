export const addMapToMap = <T, V>(
  oldMap: Map<T, V>,
  additionalMap: Map<T, V>
) => {
  return new Map([...oldMap, ...additionalMap]);
};

export const addMapsToMap = <T, V>(
  startingMap: Map<T, V>,
  additionalMaps: Map<T, V>[]
) => {
  let allElementsMap = new Map([...startingMap]);

  for (const additionalMap of additionalMaps) {
    const newMap = addMapToMap(allElementsMap, additionalMap);

    allElementsMap = newMap;
  }

  return allElementsMap;
};
