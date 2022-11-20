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

export const loadImages = async (imageSources: Array<string>) => {
  const loadingImages: Promise<HTMLImageElement>[] = imageSources.map(
    (imageSource) => {
      return new Promise((res) => loadImage(imageSource, res));
    }
  );

  const loadedImages = await Promise.all(loadingImages).then((results) => {
    return results;
  });

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

    const { getLoadedImages: getNewLoadedImages } = await loadImages(
      unloadedImages
    );
    const newLoadedImages = await getNewLoadedImages();
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

  return { getLoadedImages, loadNewImages };
};
