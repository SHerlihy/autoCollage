import { addMapToMap } from "../perimeter/mapHelpers";
import { generateImagesPromisesMap } from "../promiseHelpers";

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

  return Promise.all(loadingImages).then((results) => {
    return results;
  });
};

export type MinImage = { image: HTMLImageElement; minDimension: number };

export interface ILoadedImagesClosureResults {
  getLoadedImages: () => Map<string, HTMLImageElement> | undefined;
  loadNewImages: (images: string[]) => Promise<void>;
  getMinimumImage: () => MinImage | undefined;
}

export const loadedImagesClosure = (): ILoadedImagesClosureResults => {
  let loadedImages: Map<string, HTMLImageElement> | undefined;

  const loadNewImages = async (images: Array<string>) => {
    const unloadedImages = images.filter((src) => {
      const hasLoaded = loadedImages?.get(src);

      return hasLoaded === undefined;
    });

    const newLoadedImages = await loadImages(unloadedImages);

    const newLoadedImagesKeys = newLoadedImages.map((loadedImage) => {
      return loadedImage.src;
    });

    const prevLoadedImages = await getLoadedImages();

    const newLoadeImagesMap = generateImagesPromisesMap(
      newLoadedImagesKeys,
      newLoadedImages
    );

    const fulfilledLoadedImages =
      prevLoadedImages !== undefined
        ? addMapToMap(prevLoadedImages, newLoadeImagesMap)
        : newLoadeImagesMap;

    loadedImages = fulfilledLoadedImages;
    return;
  };

  const getLoadedImages = () => {
    return loadedImages;
  };

  const getMinimumImage = () => {
    if (!loadedImages) {
      return;
    }

    // @ts-ignore
    let minImage: MinImage;

    for (const [loadedKey, loadedVal] of loadedImages) {
      const loadedMinDimension =
        loadedVal.width < loadedVal.height ? loadedVal.width : loadedVal.height;

      // @ts-ignore

      if (!minImage) {
        minImage = {
          image: loadedVal,
          minDimension: loadedMinDimension,
        };
      }

      if (loadedMinDimension < minImage.minDimension) {
        minImage.image = loadedVal;
        minImage.minDimension = loadedMinDimension;
      }
    }

    // @ts-ignore

    return minImage;
  };

  return { getLoadedImages, loadNewImages, getMinimumImage };
};
