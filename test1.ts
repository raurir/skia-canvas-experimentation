import { Canvas } from "skia-canvas";

let canvas = new Canvas(400, 400),
  ctx = canvas.getContext("2d"),
  { width, height } = canvas;

let sweep = ctx.createConicGradient(Math.PI * 1.2, width / 2, height / 2);
sweep.addColorStop(0, "red");
sweep.addColorStop(0.25, "orange");
sweep.addColorStop(0.5, "yellow");
sweep.addColorStop(0.75, "green");
sweep.addColorStop(1, "red");
ctx.strokeStyle = sweep;
ctx.lineWidth = 100;
ctx.strokeRect(100, 100, 200, 200);

// render to multiple destinations using a background thread
async function render() {
  // save a ‘retina’ image...
  await canvas.saveAs("rainbox.png", { density: 2 });
  // ...or use a shorthand for canvas.toBuffer("png")
  let pngData = await canvas.png;
  // ...or embed it in a string
  let pngEmbed = `<img src="${await canvas.toDataURL("png")}">`;
}
render();

// ...or save the file synchronously from the main thread
canvas.saveAsSync("rainbox.pdf");
