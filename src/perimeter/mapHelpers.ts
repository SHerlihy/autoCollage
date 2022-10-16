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

export const getMapFromMap = <T, V>(originMap: Map<T, V>) => {
  const subMap = new Map<T, V>();

  const addToSubMap = (keys: T[]) => {
    for (const key of keys) {
      const originValue = originMap.get(key);

      if (originValue) {
        subMap.set(key, originValue);
      }
    }
  };

  const getSubMap = () => {
    return subMap;
  };

  return {
    addToSubMap,
    getSubMap,
  };
};
