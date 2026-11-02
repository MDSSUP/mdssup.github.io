// What a student card looks like, and how the guide outline is drawn on top of
// the camera picture so people know where to hold it.
//
// Every measurement is in millimetres, taken off a real card.

// ISO/IEC 7810 ID-1, held portrait: 85.60 x 53.98 mm
export const CARD_WIDTH_MM = 53.98;
export const CARD_HEIGHT_MM = 85.6;
export const CARD_CORNER_RADIUS_MM = 3;

// The barcode strip, running down the right-hand side.
export const BARCODE_RECT = { x: 46, y: 20, width: 6, height: 42 };

// The photograph.
export const IMAGE_RECT = { x: 14, y: 22, width: 30, height: 39 };

// The printed ID number below the photograph.
export const TEXT_RECT = { x: 10, y: 63, width: 23, height: 5 };

// The colour the outline turns once a card has been read: --success from
// index.css, the same green as the words on screen. A canvas can't use a CSS
// variable directly, so it is read off the page when drawing.
function foundGreen(canvas: HTMLCanvasElement): string {
  return getComputedStyle(canvas).getPropertyValue("--success").trim();
}

// --- drawing the guide ------------------------------------------------------

const GUIDE_STROKE_PX = 5;
const GUIDE_STROKE_INNER_PX = 2;

const TEXT_PLACEHOLDER = "XXXXXXXX";

function resizeCanvas(canvas: HTMLCanvasElement): DOMRect {
  const rect = canvas.getBoundingClientRect();
  const dpr = globalThis.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  return rect;
}

// Draws every shape twice: a thick black pass first, then a thinner white one
// on top. That way the outline stays visible against any background.
function strokeTwice(
  ctx: CanvasRenderingContext2D,
  scale: number,
  draw: () => void,
  // The inner pass's colour
  colour: string
): void {
  ctx.strokeStyle = "black";
  ctx.lineWidth = GUIDE_STROKE_PX / scale;
  draw();
  ctx.strokeStyle = colour;
  ctx.lineWidth = GUIDE_STROKE_INNER_PX / scale;
  draw();
}

// An outline of the card at the measurements above, sized to fill the canvas.
export function drawCardGuide(canvas: HTMLCanvasElement, recentlyFound: boolean): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = resizeCanvas(canvas);
  const dpr = globalThis.devicePixelRatio || 1;
  if (!rect.width || !rect.height) return;

  const available = {
    width: rect.width - GUIDE_STROKE_PX,
    height: rect.height - GUIDE_STROKE_PX,
  };
  if (available.width <= 0 || available.height <= 0) return;
  const scale = Math.min(
    available.width / CARD_WIDTH_MM,
    available.height / CARD_HEIGHT_MM,
  );
  const offsetX = (rect.width - CARD_WIDTH_MM * scale) / 2;
  const offsetY = (rect.height - CARD_HEIGHT_MM * scale) / 2;

  // From here on the canvas works in millimetres, so the numbers at the top of
  // this file can be used directly.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  ctx.lineJoin = "round";

  const colour = recentlyFound ? foundGreen(canvas) : "white";

  strokeTwice(ctx, scale, () => {
    ctx.beginPath();
    // Rounded corners need iOS 16 or newer. Older phones get square ones
    // rather than an error screen — the outline is only a guide.
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM, CARD_CORNER_RADIUS_MM);
    } else {
      ctx.rect(0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM);
    }
    ctx.stroke();
  }, colour);

  for (const box of [IMAGE_RECT, BARCODE_RECT]) {
    strokeTwice(ctx, scale, () => {
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.width, box.height);
      ctx.stroke();
    }, colour);
  }

  ctx.font = `${TEXT_RECT.height}px monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  strokeTwice(ctx, scale, () => {
    ctx.strokeText(TEXT_PLACEHOLDER, TEXT_RECT.x, TEXT_RECT.y);
  }, colour);
}

export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
