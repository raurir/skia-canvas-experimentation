import { Canvas, Path2D } from "skia-canvas";

// Create a canvas
const width = 800;
const height = 600;
const canvas = new Canvas(width, height),
  ctx = canvas.getContext("2d");

// Set background color (optional)
ctx.fillStyle = "white";
ctx.fillRect(0, 0, width, height);

// Set line properties
ctx.lineWidth = 4;

const PurpleRain = "#B2ACFF";
const BlueMoon = "#80E8FF";
const YellowSubmarine = "#FFEB80";

// Draw yellow line
ctx.beginPath();
ctx.strokeStyle = YellowSubmarine; //"#FFD700"; // Yellow
ctx.moveTo(200, 200);
ctx.lineTo(200, 300);
ctx.lineTo(500, 300);
ctx.stroke();

// Draw purple line
ctx.beginPath();
ctx.strokeStyle = PurpleRain; // "#6A5ACD"; // Purple
ctx.moveTo(500, 200);
ctx.lineTo(500, 400);
ctx.lineTo(600, 400);
ctx.stroke();

// Draw light blue dashed line
ctx.beginPath();
ctx.strokeStyle = BlueMoon; // "#87CEEB"; // Light blue
ctx.setLineDash([5, 5]); // Create dashed line
ctx.moveTo(350, 200);
ctx.lineTo(350, 400);
ctx.stroke();

// Reset line dash
ctx.setLineDash([]);

async function render() {
  await canvas.saveAs("sc-lines.png", { density: 1 });
  let pngData = await canvas.png;
}
render();
