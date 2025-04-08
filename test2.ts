import { Canvas, Path2D } from "skia-canvas";

const size = 800;
const dots = 8;
const boxSize = size / dots;

const w = boxSize;
const h = boxSize;
const jitter = boxSize;
const spanSize = boxSize + 2 * jitter;

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

const baseHue = Math.random() * 360;
const baseSaturation = 25 + Math.random() * 50;
const baseLightness = 10 + Math.random() * 80;

const getCentre = (): number =>
  boxSize / 2 + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random()) * boxSize;

const getColours = (): string[] => {
  const numColours = Math.floor(Math.random() * 3) + 2;
  const colours = new Array(numColours).fill("").map(() => {
    const hue = (baseHue + Math.random() * 90) % 360,
      saturation = baseSaturation + Math.random() * 10,
      lightness = baseLightness + Math.random() * 10;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  });
  return colours;
};

const getTau = (): number => Math.PI * 2 * Math.random();

const getCp = (xp: number, yp: number): { x: number; y: number } => ({
  x: xp + rand(-1, 1) * jitter,
  y: yp + rand(-1, 1) * jitter,
});

const genBezier = (xp: number, yp: number): Path2D => {
  const s = getCp(xp, yp);
  const cp1 = getCp(xp, yp + spanSize * rand(0.2, 0.4));
  const cp2 = getCp(xp, yp + spanSize * rand(0.6, 0.8));
  const e = getCp(xp, yp + spanSize);

  const bezier = new Path2D();
  bezier.moveTo(s.x, s.y);
  bezier.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, e.x, e.y);
  return bezier;
};

async function render() {
  const canvas = new Canvas(size, size),
    ctx = canvas.getContext("2d");

  const canvasBuffer = new Canvas(boxSize, boxSize),
    ctxBuffer = canvasBuffer.getContext("2d");

  for (let i = 0; i < dots; i++) {
    for (let j = 0; j < dots; j++) {
      //   if (i % 2 == 0 || j % 2 == 0) {
      //     continue;
      //   }

      ctx.save();

      const x = i * boxSize;
      const y = j * boxSize;

      ctx.translate(x, y);

      const cx = getCentre();
      const cy = getCentre();

      const sweep = ctx.createConicGradient(getTau(), cx, cy);

      const colours = getColours();
      colours.forEach((colour, index) => {
        sweep.addColorStop(index / colours.length, colour);
      });
      sweep.addColorStop(1, colours[0]);

      ctx.fillStyle = sweep;
      ctx.fillRect(0, 0, w, h);

      ctxBuffer.save();
      ctxBuffer.clearRect(0, 0, boxSize, boxSize);

      // Translate to the point of rotation
      ctxBuffer.translate(boxSize / 2, boxSize / 2);
      // Rotate the canvas
      ctxBuffer.rotate(getTau());
      // Translate back
      ctxBuffer.translate(-boxSize / 2, -boxSize / 2);

      //   ctxBuffer.fillStyle = "none";
      //   ctxBuffer.lineWidth = 2;
      //   ctxBuffer.strokeStyle = "white";
      //   ctx.fillRect(x, y, boxSize, boxSize);
      //   ctxBuffer.rect(x, y, boxSize, boxSize);
      //   ctxBuffer.stroke();

      const start = genBezier(-jitter, -jitter);
      const end = genBezier(spanSize, -jitter);
      const interpolations = Math.floor(Math.random() * 30) + 30;
      for (let k = 0; k < interpolations; k++) {
        const t = k / interpolations;
        const p = start.interpolate(end, t);
        ctxBuffer.lineWidth = 2;
        ctxBuffer.strokeStyle = "#0009";
        ctxBuffer.stroke(p);
      }

      ctx.drawImage(canvasBuffer, 0, 0);
      ctxBuffer.restore();

      ctx.restore();
    }
  }

  await canvas.saveAs("boxes.png", { density: 2 });
}
render();
