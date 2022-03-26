export function drawAllItems(ctx) {
  drawBox(ctx);
  drawOtherBox(ctx);
  drawImage(ctx);
}

const drawBox = function (ctx) {
  return new Promise(function (res, rej) {
    ctx.fillStyle = "#991111";
    ctx.fillRect(-50, -50, 100, 100);
    res("drawBox fulfilled");
  }).then((resp) => console.log(resp));
};

const drawOtherBox = function (ctx) {
  return new Promise(function (res, rej) {
    ctx.fillStyle = "#991111";
    ctx.fillRect(-100, -100, 100, 100);
    res("drawOtherBox fulfilled");
  }).then((resp) => console.log(resp));
};

const drawImage = function (ctx) {
  const canvasImage = new Image();
  canvasImage.src = "src/logo.svg";
  canvasImage.onload = () => {
    ctx.drawImage(canvasImage, 100, 100);
  };
};
