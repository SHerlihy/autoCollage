export const generateSeed = (canvasContext) => {
  const img = new Image();

  console.log("called");

  img.onload = function () {
    console.log("loaded");
    console.log(img);
    canvasContext.fillRect(130, 190, 40, 60);
    canvasContext.drawImage(img, 100, 100);
  };

  img.src = "logo192.png";
};
