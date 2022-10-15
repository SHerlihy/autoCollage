const determineEdges = (loadedImages) => {
  const { image, x, y } = loadedImages;

  // find most bottom etc.

  //get coordinated for rectangle corners

  //identify closest point to corner

  //use new point as corner

  //identify if points lie outside of new boundary

  // use outliers as new points for corners (only if there are two either side)
  //otherwise repeat id process but with new point as corner

  const imageBoundaries = new Map();

  let id = 1;

  for (const loadedImage of loadedImages) {
    const boundaries = determineImageBounds(loadedImage);

    imageBoundaries.set(id, boundaries);

    id++;
  }

  let imageCoordinatesId = 1;

  const imageCoordinates = new Map();

  //I get id and tr,tl etc
  for (const loadedImage of loadedImages) {
    const coordinates = determineImageCoordinates(loadedImage);

    imageCoordinates.set(imageCoordinatesId, coordinates);

    imageCoordinatesId++;
  }

  let topPic;

  for (const [imageId, imagesCoordinates] of imageCoordinates) {
    const y = -imagesCoordinates.tl.y;

    if (y > topPic.y) {
      topPic = { id: imageId, y: y };
    }
  }

  const perimeterPoints = determinePerimeterPoints(
    imageCoordinates.get(topPic.id),
    imageCoordinates
  );

  //need to remove interior coordinates

  //if a coordinate has another nearby discard it

  const leftToRight = [...imageCoordinates].sort((a, b) => {
    a.x - b.x;
  });

  const topToBottom = [...imageCoordinates].sort((a, b) => {
    a.y - b.y;
  });

  //iterate thorugh above then inteersect
  //discard too close
  const leftToRightExteriors = leftToRight.reduce(
    (acc, cur) => {
      const imageMinEdge = 10;

      const diff = cur.x - acc[acc.length].x;
      if (diff > imageMinEdge) {
        acc.push(cur);
      }

      //math abs?
      const ydiff = cur.y - acc[acc.length].y;
      if (ydiff > imageMinEdge) {
        acc.push(cur);
      }

      return acc;
    },
    [leftToRight[0]]
  );

  const lt = {
    x: leftToRight[0].x,
    y: topToBottom[0].y,
  };

  // is there anything outside?
};

const boundsByImage = (imageBoundaries) => {
  const topBoundVals = new Map();
  const rightBoundVals = new Map();
  const bottomBoundVals = new Map();
  const leftBoundVals = new Map();

  for (const [id, { top, right, bottom, left }] of imageBoundaries) {
    topBoundVals.set(id, -top.y.start);
    rightBoundVals.set(id, right.x.finish);
    bottomBoundVals.set(id, bottom.y.finish);
    leftBoundVals.set(id, -left.x.start);
  }

  return {
    topBoundVals,
    rightBoundVals,
    bottomBoundVals,
    leftBoundVals,
  };
};

const determineBiggest = (boundVals) => {
  let mostId;
  let mostVal;

  for (const [id, val] of boundVals) {
    if (mostVal > val) return;
    mostId = id;
    mostVal = val;
  }

  return mostId;
};

const determineImageBounds = (loadedImage) => {
  const { image, x, y, rotation } = loadedImage;

  // 4 ranges for each side

  const imageHeight = image.height;
  const imageWidth = image.imageWidth;

  const top = {
    x: {
      start: x,
      finish: x + imageWidth,
    },
    y: {
      start: y,
      finish: y,
    },
  };

  const right = {
    x: {
      start: x + imageWidth,
      finish: x + imageWidth,
    },
    y: {
      start: y,
      finish: y + imageHeight,
    },
  };

  const bottom = {
    x: {
      start: x,
      finish: x + imageWidth,
    },
    y: {
      start: y + imageHeight,
      finish: y + imageHeight,
    },
  };

  const left = {
    x: {
      start: x,
      finish: x,
    },
    y: {
      start: y,
      finish: y + imageHeight,
    },
  };

  return {
    top,
    right,
    bottom,
    left,
  };
};

const determineImageCoordinates = (loadedImage) => {
  const { image, x, y, rotation } = loadedImage;

  // 4 ranges for each side

  const imageHeight = image.height;
  const imageWidth = image.imageWidth;

  const tl = { x, y };
  const tr = { x: x + imageWidth, y };
  const bl = { x, y: y + imageHeight };
  const br = { x: x + imageWidth, y: y + imageHeight };

  return {
    tl,
    tr,
    bl,
    br,
  };
};

const generateImageCoordinatesMap = (imageCoordinates) => {
  const imagePointsMap = new Map();

  const imgId = generateUId();

  const initialCoordinateId = generateUId();
  let currentCoordinateId = initialCoordinateId;

  imageCoordinates.forEach((coordinates, i, arr) => {
    const nextImgPointId = generateUId();

    const value = {
      imgId,
      nextImgPointId,
      coordinates,
    };

    if (i === arr.length) {
      currentCoordinateId = initialCoordinateId;
    }

    imagePointsMap.set(currentImagePointId, value);

    currentCoordinateId = nextImgPointId;
  });

  return imagePointsMap;
};

const generatePointsMap = (loadedImages) => {
  let pointsMap = new Map();

  for (const loadedImage of loadedImages) {
    const { tl, tr, br, bl } = determineImageCoordinates(loadedImage);

    const imageCoordinates = [tl, tr, br, bl];

    const imageCoordinatesMap = generateImageCoordinatesMap(imageCoordinates);

    pointsMap = new Map([...pointsMap], [...imageCoordinatesMap]);
  }

  return pointsMap;
};

// I need points that have uids and coordinantes
