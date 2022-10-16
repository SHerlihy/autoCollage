export const getFulfilled = <T>(promises: PromiseSettledResult<T>[]) => {
  const fulfilledPromises = promises.reduce((acc, promRes) => {
    if (promRes.status === 'fulfilled') {
      acc.push(promRes.value)
    }

    return acc
  }, [] as Array<T>)

  return fulfilledPromises
}

export const generateFulfilledPromisesMap = <T, U>(
  keyVals: Array<T>,
  promises: PromiseSettledResult<U>[]
) => {
  const fulfilledPromises = promises.reduce((acc, promRes, idx) => {
    if (promRes.status === 'fulfilled') {
      acc.set(keyVals[idx], promRes.value)
    }

    return acc
  }, new Map() as Map<T, U>)

  return fulfilledPromises
}
