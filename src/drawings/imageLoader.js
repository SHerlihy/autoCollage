const loadImage = async function (imageSource, res, rej) {
  const canvasImage = new Image();
  canvasImage.src = imageSource;
  canvasImage.addEventListener("load", () => {
    res(canvasImage);
  });
};

export const loadImages = function (imageSources) {
  const loadingImages = imageSources.map((imageSource) => {
    return new Promise((res, rej) => loadImage(imageSource, res, rej));
  });

  const loadedImages = Promise.allSettled(loadingImages);

  return {
    getLoadedImages: async () => {
      return await loadedImages;
    },
  };
};

export const getFulfilled = function (promises) {
  const fulfilledPromises = promises.reduce((acc, { status, value }) => {
    if (status !== "fulfilled") {
      return acc;
    }
    acc.push(value);
    return acc;
  }, []);

  return fulfilledPromises;
};
