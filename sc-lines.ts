import { Canvas, Path2D } from "skia-canvas";

type Direction = "X_POS" | "X_NEG" | "Y_POS" | "Y_NEG" | "NONE";
type Point = [number, number];
type Path = Point[];

const canvases = 4; // must be a square number
const width = 400;
const height = 300;
const borderPadding = 20;
const minDistance = 20;

const PurpleRain = "#B2ACFF";
const BlueMoon = "#80E8FF";
const YellowSubmarine = "#FFEB80";
const rand = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min));

const gap = 20;
const randGapped = (min: number, max: number): number =>
  Math.round(rand(min, max) / gap) * gap;

function isVertical(p1: Point, p2: Point): boolean {
  return p1[0] === p2[0];
}

function findPathIntersections(path1: Path, path2: Path): Point[] {
  const intersections: Point[] = [];
  // console.log("findPathIntersections", path1, path2);

  // Check each line segment against each other
  for (let i = 0; i < path1.length - 1; i++) {
    const [x1, y1] = path1[i];
    const [x2, y2] = path1[i + 1];

    for (let j = 0; j < path2.length - 1; j++) {
      const [x3, y3] = path2[j];
      const [x4, y4] = path2[j + 1];

      // One line must be vertical and one horizontal for intersection
      const line1Vertical = isVertical(path1[i], path1[i + 1]);
      const line2Vertical = isVertical(path2[j], path2[j + 1]);

      // If both lines are parallel, they can't intersect
      if (line1Vertical === line2Vertical) continue;

      // Find intersection point
      if (line1Vertical) {
        const vertX = x1;
        const horzY = y3;

        // Check if intersection point lies within both line segments
        if (
          vertX >= Math.min(x3, x4) &&
          vertX <= Math.max(x3, x4) &&
          horzY >= Math.min(y1, y2) &&
          horzY <= Math.max(y1, y2)
        ) {
          intersections.push([vertX, horzY]);
        }
      } else {
        const vertX = x3;
        const horzY = y1;

        // Check if intersection point lies within both line segments
        if (
          vertX >= Math.min(x1, x2) &&
          vertX <= Math.max(x1, x2) &&
          horzY >= Math.min(y3, y4) &&
          horzY <= Math.max(y3, y4)
        ) {
          intersections.push([vertX, horzY]);
        }
      }
    }
  }

  return intersections;
}

const generateMiniCanvas = () => {
  console.log("generating mini canvas");
  const canvas = new Canvas(width, height),
    ctx = canvas.getContext("2d");

  ctx.lineWidth = 4;
  ctx.beginPath();

  const lines: Path[] = [];

  const generateLine = (): {
    line: Path2D;
    intersections: Point[];
  } => {
    ctx.strokeStyle = [PurpleRain, BlueMoon, YellowSubmarine][rand(0, 3)];

    let x = randGapped(borderPadding, width - borderPadding * 2),
      y = randGapped(borderPadding, height - borderPadding * 2);

    const spikes = new Path2D();
    spikes.moveTo(x, y);
    const line: Path = [[x, y]];

    let ok = true,
      count = 0,
      lastDir: Direction = "NONE";
    while (ok) {
      const dir: Direction = ["X_POS", "X_NEG", "Y_POS", "Y_NEG"].filter(
        (d) => d[0] !== lastDir[0] // don't go on the same axis as last time
      )[rand(0, 2)] as Direction;
      lastDir = dir;

      switch (dir) {
        case "X_POS":
          x += randGapped(minDistance, width - x);
          break;
        case "X_NEG":
          x -= randGapped(minDistance, x);
          break;
        case "Y_POS":
          y += randGapped(minDistance, height - y);
          break;
        case "Y_NEG":
          y -= randGapped(minDistance, y);
          break;
      }

      let iteration = Math.random().toString(16);

      // prevent overlapping itself:
      for (let j = 1; j < line.length; j++) {
        const p1 = line[j - 1],
          p2 = line[j];
        const segment1: Path = [p1, p2];
        for (let i = j + 2; i < line.length; i++) {
          const p3 = line[i - 1],
            p4 = line[i];
          const segment2: Path = [p3, p4];
          if (segment1.join(",") === segment2.join(",")) {
            throw new Error("same segment");
          }

          if (p1.join(",") === p3.join(",")) {
            throw new Error("same point");
          }

          const intersection = findPathIntersections(segment1, segment2);
          if (intersection.length) {
            console.log("overlapping", iteration, intersection);

            intersection.forEach(([x, y]) => {
              ctx.fillStyle = "#f0f";
              ctx.fillRect(x - 5, y - 5, 10, 10);
            });
            ok = false;
          }
        }
      }
      if (!ok) {
        line.splice(line.length - 3, 2);
        break;
      }
      // console.log("reached here...", iteration);

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
      line.push([x, y]);

      count++;
      if (count > 10) {
        ok = false;
      }
    }

    lines.push(line);

    // console.log("lines", lines.length);

    const intersections = lines.reduce(
      (acc: Point[], otherLine: Path) => {
        // const intersection = checkPathIntersection(spikes, l, ctx);

        if (otherLine === line) {
          // throw new Error("same line");
          return acc;
        }

        const intersections = findPathIntersections(otherLine, line);

        // console.log("intersections", intersections);
        if (intersections.length) {
          // const { x, y } = intersection;
          return [...acc, ...intersections];
        }
        return acc;
      },
      [] // as Intersection[]
    );

    return { line: spikes.round(8), intersections };
  };

  const numberOfLines = rand(1, 10) * 2;

  for (let i = 0; i < numberOfLines; i++) {
    const isDashed = rand(0, 3) === 1;

    const { line, intersections } = generateLine();
    console.log("allIntersections", intersections);

    intersections.forEach(([x, y]) => {
      // const p = new Path2D();
      // p.arc(x, y, 5, 0, Math.PI * 2, true);
      ctx.fillStyle = "black";
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
  const sqrt = Math.sqrt(canvases);
  const largeWidth = (width * canvases) / sqrt;
  const largeHeight = (height * canvases) / sqrt;
  const canvas = new Canvas(largeWidth, largeHeight),
    ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, largeWidth, largeHeight);

  for (let i = 0; i < canvases; i++) {
    const x = (i % sqrt) * width;
    const y = Math.floor(i / sqrt) * height;
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
  await canvas.saveAs("sc-lines.png", { density: 2 });
  // let pngData = await canvas.png;
}
render();
