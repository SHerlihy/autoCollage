const loadImage = async (
  imageSource: string,
  res: (image: HTMLImageElement) => void
) => {
  const canvasImage = new Image();
  canvasImage.src = imageSource;
  canvasImage.addEventListener("load", () => {
    res(canvasImage);
  });
};

export const loadImages = (imageSources: Array<string>) => {
  const loadingImages: Promise<HTMLImageElement>[] = imageSources.map(
    (imageSource) => {
      return new Promise((res) => loadImage(imageSource, res));
    }
  );

  const loadedImages = Promise.allSettled(loadingImages);

  return {
    getLoadedImages: async () => {
      return await loadedImages;
    },
  };
};

export const getFulfilled = (
  promises: PromiseSettledResult<HTMLImageElement>[]
) => {
  const fulfilledPromises = promises.reduce((acc, promRes) => {
    if (promRes.status === "fulfilled") {
      acc.push(promRes.value);
    }

    return acc;
  }, [] as Array<HTMLImageElement>);

  return fulfilledPromises;
};
