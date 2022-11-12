import { generateFulfilledPromisesMap } from "../promiseHelpers";

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

export interface ILoadedImagesClosureResults {
  getLoadedImages: () => Map<string, HTMLImageElement> | undefined;
  loadNewImages: (images: string[]) => Promise<void>;
}

export const loadedImagesClosure = (): ILoadedImagesClosureResults => {
  let loadedImages: Map<string, HTMLImageElement> | undefined;

  const loadNewImages = async (images: Array<string>) => {
    const unloadedImages = images.filter((src) => {
      const hasLoaded = loadedImages?.get(src);

      return hasLoaded === undefined;
    });

    const { getLoadedImages } = loadImages(unloadedImages);
    const allLoadedImages = await getLoadedImages();

    const fulfilledLoadedImages = generateFulfilledPromisesMap(
      unloadedImages,
      allLoadedImages
    );
    loadedImages = fulfilledLoadedImages;
    return;
  };

  const getLoadedImages = () => {
    return loadedImages;
  };

  return { getLoadedImages, loadNewImages };
};
