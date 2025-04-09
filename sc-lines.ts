import { Canvas, Path2D } from "skia-canvas";

// Create a canvas
const canvases = 4;

const width = 400;
const height = 400;
const borderPadding = 20;
const minDistance = 20;

const PurpleRain = "#B2ACFF";
const BlueMoon = "#80E8FF";
const YellowSubmarine = "#FFEB80";
// type Colors = typeof PurpleRain | typeof BlueMoon | typeof YellowSubmarine;

const rand = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min));

type Direction = "X_POS" | "X_NEG" | "Y_POS" | "Y_NEG";
// type GenCanvas = {
//   ctx: CanvasRenderingContext2D;
//   canvas: Canvas;
// };

type Intersection = {
  x: number;
  y: number;
  path1: Path2D;
  path2: Path2D;
};

const checkPathIntersection = (
  path1: Path2D,
  path2: Path2D,
  ctx: any,
  bounds = { minX: 0, maxX: width, minY: 0, maxY: height },
  resolution = 1
): Intersection | undefined => {
  // Sample points in the canvas area
  for (let x = bounds.minX; x <= bounds.maxX; x += resolution) {
    for (let y = bounds.minY; y <= bounds.maxY; y += resolution) {
      // If a point is on both paths, we've found an intersection
      if (
        ctx.isPointInStroke(path1, x, y) &&
        ctx.isPointInStroke(path2, x, y)
      ) {
        return { x, y, path1, path2 };
      }
    }
  }
  return undefined;
};

const generateMiniCanvas = () => {
  const canvas = new Canvas(width, height),
    ctx = canvas.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  ctx.lineWidth = 4;
  ctx.beginPath();

  const lines: Path2D[] = [];

  const generateLine = (): {
    line: Path2D;
    allIntersections: Intersection[];
  } => {
    ctx.strokeStyle = [PurpleRain, BlueMoon, YellowSubmarine][rand(0, 3)];

    let x = rand(borderPadding, width - borderPadding * 2),
      y = rand(borderPadding, height - borderPadding * 2);

    const spikes = new Path2D();
    spikes.moveTo(x, y);
    const allIntersections: Intersection[] = [];

    let ok = true,
      i = 0,
      lastDir: Direction = "X_POS";
    while (ok) {
      const dir: Direction = ["X_POS", "X_NEG", "Y_POS", "Y_NEG"].filter(
        (d) => d[0] !== lastDir[0] // don't go on the same axis as last time
      )[rand(0, 2)] as Direction;
      lastDir = dir;

      switch (dir) {
        case "X_POS":
          x += rand(minDistance, width - x);
          break;
        case "X_NEG":
          x -= rand(minDistance, x);
          break;
        case "Y_POS":
          y += rand(minDistance, height - y);
          break;
        case "Y_NEG":
          y -= rand(minDistance, y);
          break;
      }
      // limit to bounds:
      if (x < borderPadding) {
        x = borderPadding;
        ok = false;
      } else if (x > width - borderPadding) {
        x = width - borderPadding;
        ok = false;
      } else if (y < borderPadding) {
        y = borderPadding;
        ok = false;
      } else if (y > height - borderPadding) {
        y = height - borderPadding;
        ok = false;
      }
      spikes.lineTo(x, y);

      const intersections = lines.reduce((acc: Intersection[], l: Path2D) => {
        const intersection = checkPathIntersection(spikes, l, ctx);
        if (intersection) {
          const { x, y } = intersection;
          return [...acc, intersection];
        }
        return acc;
      }, [] as Intersection[]);

      if (intersections.length) {
        // continue;
        console.log("killing line");
        allIntersections.push(...intersections);
        // ok = false;
      } else {
        console.log("appending line");
      }

      // lines[lines.length - 1] = spikes;

      i++;
      if (i > 10) {
        ok = false;
      }
    }

    lines.push(spikes);

    console.log("lines", lines.length);

    return { line: spikes.round(10), allIntersections };
  };

  const numberOfLines = rand(2, 10) * 1;

  for (let i = 0; i < numberOfLines; i++) {
    const isDashed = rand(0, 3) === 1;

    const { line, allIntersections } = generateLine();

    allIntersections.forEach((intersection) => {
      const { x, y } = intersection;
      // const p = new Path2D();
      // p.arc(x, y, 5, 0, Math.PI * 2, true);
      ctx.fillStyle = "red";
      // ctx.fill(p);
      // ctx.fillStyle = "black";
      ctx.fillRect(x - 5, y - 5, 10, 10);
    });

    if (isDashed) ctx.setLineDash([5, 5]);
    ctx.stroke(line);
    if (isDashed) ctx.setLineDash([]);
  }
  return { ctx, canvas };
};

const generateCanvas = () => {
  const w = (width * canvases) / 2;
  const h = (height * canvases) / 2;
  const canvas = new Canvas(w, h),
    ctx = canvas.getContext("2d");
  for (let i = 0; i < canvases; i++) {
    const x = (i % 2) * width;
    const y = Math.floor(i / 2) * height;
    // ctx.save();
    // ctx.translate(x, y);
    const { canvas } = generateMiniCanvas();
    ctx.drawImage(canvas, x, y);
    ctx.strokeStyle = "white";
    ctx.strokeRect(x, y, width, height);
    // ctx.restore();
  }
  return { ctx, canvas };
};

const { canvas } = generateCanvas();

async function render() {
  await canvas.saveAs("sc-lines.png", { density: 4 });
  // let pngData = await canvas.png;
}
render();
