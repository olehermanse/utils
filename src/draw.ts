import { WH, xy } from "./funcs.js";
import type { XY, XYR, XYWH } from "./interfaces.js";

export type Canvas = HTMLCanvasElement | OffscreenCanvas;
export type Context =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export type Anchor =
  | "top_left"
  | "top_center"
  | "top_right"
  | "middle_left"
  | "middle_center"
  | "middle_right"
  | "bottom_left"
  | "bottom_center"
  | "bottom_right";

export const TEXT_HEIGHT = 8;
export const HALF_TEXT_HEIGHT = 4;

export const GRID_COLOR = "rgba(200,200,200,0.5)";
export const GREEN = "#00ff00";
export const YELLOW = "#ffff00";
export const ORANGE = "#ff8800";
export const RED = "#ff0000";
export const WHITE = "#ffffff";
export const GREY = "#666666";

export const PI = 3.14159;
export const LINE_RATIO = 0.1;

let custom_scale: number | undefined = undefined;

export function set_custom_scale(s: number) {
  custom_scale = s;
}

export function SCALE() {
  if (custom_scale !== undefined) {
    return custom_scale;
  }
  // This should be a constant, but I want this file to be importable by deno,
  // so not using a global variable for this.
  return window.devicePixelRatio;
}

export function sxy(x: number, y: number): XY {
  const obj: XY = {
    x: x * SCALE(),
    y: y * SCALE(),
  };
  return obj;
}

export function sxyr(x: number, y: number, r: number): XYR {
  const obj: XYR = {
    x: x * SCALE(),
    y: y * SCALE(),
    r: r * SCALE(),
  };
  return obj;
}

export function sxywh(x: number, y: number, w: number, h: number): XYWH {
  const obj: XYWH = {
    x: x * SCALE(),
    y: y * SCALE(),
    w: w * SCALE(),
    h: h * SCALE(),
  };
  return obj;
}

function _setLineWidth(
  ctx: CanvasRenderingContext2D,
  r: number,
  lineWidth: number | null,
) {
  if (lineWidth === null) {
    ctx.lineWidth = Math.round(r * LINE_RATIO);
  } else {
    ctx.lineWidth = lineWidth;
  }
}

function _line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeStyle: string,
  lineWidth: number,
) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeStyle: string,
  lineWidth: number,
) {
  const a = sxy(x1, y1);
  const b = sxy(x2, y2);
  _line(ctx, a.x, a.y, b.x, b.y, strokeStyle, lineWidth);
}

function _circle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string | null = null,
  stroke: string | null = null,
  lineWidth: number | null = null,
) {
  _setLineWidth(ctx, r, lineWidth);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * PI);
  if (fill != null) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke != null) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function circle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string | null = null,
  stroke: string | null = null,
  lineWidth: number | null = null,
) {
  const c = sxyr(x, y, r);
  _circle(ctx, c.x, c.y, c.r, fill, stroke, lineWidth);
}

function _triangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  angle: number,
  fill: string,
  stroke: string | null = null,
  lineWidth: number | null = null,
) {
  _setLineWidth(ctx, r, lineWidth);

  // Matrix transformation
  ctx.translate(x, y);
  ctx.rotate(-angle);
  ctx.translate(-x, -y);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x - r * (1 / 2), y - r * (Math.sqrt(3) / 2));
  ctx.lineTo(x - r * (1 / 2), y + r * (Math.sqrt(3) / 2));
  ctx.lineTo(x + r, y);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function triangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  angle: number,
  fill: string,
  stroke: string | null = null,
  lineWidth: number | null = null,
) {
  const t = sxyr(x, y, r);
  _triangle(ctx, t.x, t.y, t.r, angle, fill, stroke, lineWidth);
}

function _rectangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string | null = null,
  stroke: string | null = null,
  lineWidth: number | null = null,
) {
  _setLineWidth(ctx, w / 2, lineWidth);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.strokeRect(x, y, w, h);
  }
}

export function rectangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string | null = null,
  stroke: string | null = null,
  lineWidth: number | null = null,
) {
  const r = sxywh(x, y, w, h);
  _rectangle(ctx, r.x, r.y, r.w, r.h, fill, stroke, lineWidth);
}

function _image(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.drawImage(img, x, y, w, h);
}

export function image(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const i = sxywh(x, y, w, h);
  _image(ctx, img, i.x, i.y, i.w, i.h);
}

function _text(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  string: string,
  c: string,
  size: number,
) {
  if (string.includes("\n")) {
    const strings = string.split("\n");
    for (const s of strings) {
      _text(ctx, x, y, s, c, size);
      y += size * 1.2;
    }
    return;
  }
  ctx.font = Math.floor(size) + "px monospace";
  ctx.fillStyle = c;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.strokeText(string, x, y);
  ctx.fillText(string, x, y);
}

export function text(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  string: string,
  c: string,
  size: number,
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const p = sxy(x, y);
  _text(ctx, p.x, p.y, string, c, SCALE() * size);
}

export function text_bottom_right(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  string: string,
  c: string,
  size: number,
) {
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  const p = sxy(x, y);
  _text(ctx, p.x, p.y, string, c, SCALE() * size);
}

export function text_top_left(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  string: string,
  c: string,
  size: number,
) {
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const p = sxy(x, y);
  _text(ctx, p.x, p.y, string, c, SCALE() * size);
}

export function fill_text(
  ctx: CanvasRenderingContext2D,
  string: string,
  x: number,
  y: number,
  c: string,
  font: number,
  textAlign: string,
  textBaseline: string,
) {
  x = x * SCALE();
  y = y * SCALE();
  ctx.font = "" + Math.floor(SCALE() * font).toString() + "px monospace";
  ctx.textAlign = textAlign as CanvasTextAlign;
  ctx.textBaseline = textBaseline as CanvasTextBaseline;
  ctx.fillStyle = c;
  ctx.fillText(string, x, y);
}

export function grid(
  ctx: CanvasRenderingContext2D,
  size: number,
  x0: number,
  y0: number,
  width: number,
  height: number,
) {
  for (let x = size; x < width; x += size) {
    line(ctx, x, y0, x, y0 + height, GRID_COLOR, size / 25);
  }
  for (let y = size; y < height; y += size) {
    line(ctx, x0, y, x0 + width, y, GRID_COLOR, size / 25);
  }
}
export function healthbar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  current: number,
  max: number,
) {
  const ratio = current / max;
  x -= w / 2;
  y -= h / 2;
  rectangle(ctx, x, y, w, h, WHITE, GREY);
  let color = null;
  if (ratio > 0.8) {
    color = GREEN;
  } else if (ratio >= 0.5) {
    color = YELLOW;
  } else if (ratio >= 0.33) {
    color = ORANGE;
  } else {
    color = RED;
  }
  rectangle(ctx, x, y, w * ratio, h, color, null);
}

/*function _set_pixel(img: ImageData, x: number, y: number, r: number, g: number, b: number, a: number){
  const i = (x + y*img.width) * 4;
  img.data[i] = r;
  img.data[i+1] = g;
  img.data[i+2] = b;
  img.data[i+3] = a;
}
*/
export class Drawer<T extends Canvas> {
  ctx: Context;
  canvas: T;
  autoscale: boolean;
  constructor(canvas: T, autoscale?: boolean) {
    this.canvas = canvas;
    this.ctx = <Context> canvas.getContext("2d");
    this.autoscale = true;
    if (autoscale === false) {
      this.autoscale = false;
    }
  }
  sprite(sprite: ImageBitmap, pos: XY, reversed?: boolean) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(pos.x, pos.y);
    if (reversed) {
      ctx.scale(-1, 1);
      ctx.translate(-16, 0);
    }
    ctx.drawImage(sprite, 0, 0);
    ctx.restore();
  }
  clear() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const rect = this.ctx.createImageData(width, height);
    // Each pixel is 4 8 bit int (RGBA)
    // Defaults to all zeroes (all black and transparent)
    // Loop through all pixels, removing the transparency:
    for (let i = 0; i < width * height; i++) {
      rect.data[3 + i * 4] = 255; // Set alpha to 100%, not transparent
      // Leave other pixels alone, they are black.
    }
    this.ctx.putImageData(rect, 0, 0);
  }

  white_pixel(pos: XY) {
    // TODO: Look for more efficient way of editing the image data
    const pixel = this.ctx.createImageData(1, 1);
    pixel.data[0] = 255; // R
    pixel.data[1] = 255; // G
    pixel.data[2] = 255; // B
    pixel.data[3] = 255; // A
    this.ctx.putImageData(pixel, pos.x, pos.y);
  }

  white_square(pos: XY, scale: number) {
    const pixel = this.ctx.createImageData(scale, scale);
    for (let i = 0; i < 4 * scale * scale; i += 4) {
      pixel.data[i] = 255; // R
      pixel.data[i + 1] = 255; // G
      pixel.data[i + 2] = 255; // B
      pixel.data[i + 3] = 255; // A
    }
    this.ctx.putImageData(pixel, pos.x, pos.y);
  }

  black_pixel(pos: XY) {
    // TODO: Look for more efficient way of editing the image data
    const pixel = this.ctx.createImageData(1, 1);
    pixel.data[0] = 0; // R
    pixel.data[1] = 0; // G
    pixel.data[2] = 0; // B
    pixel.data[3] = 255; // A
    this.ctx.putImageData(pixel, pos.x, pos.y);
  }

  black_square(pos: XY, scale: number) {
    const pixel = this.ctx.createImageData(scale, scale);
    for (let i = 0; i < 4 * scale * scale; i += 4) {
      pixel.data[i] = 0; // R
      pixel.data[i + 1] = 0; // G
      pixel.data[i + 2] = 0; // B
      pixel.data[i + 3] = 255; // A
    }
    this.ctx.putImageData(pixel, pos.x, pos.y);
  }
  text(
    message: string,
    font: Record<string, ImageBitmap>,
    pos: XY,
    anchor: Anchor = "top_left",
    line_height: number = 16,
  ) {
    let x = pos.x;
    let y = pos.y;
    if (anchor !== "top_left") {
      const text_width = 6 * message.length;
      if (
        anchor === "top_right" ||
        anchor === "middle_right" ||
        anchor === "bottom_right"
      ) {
        x -= text_width;
      } else if (
        anchor === "top_center" ||
        anchor === "middle_center" ||
        anchor === "bottom_center"
      ) {
        x -= Math.floor(text_width / 2);
      }
      if (
        anchor === "bottom_left" ||
        anchor === "bottom_center" ||
        anchor === "bottom_right"
      ) {
        y -= TEXT_HEIGHT;
      } else if (
        anchor === "middle_left" ||
        anchor === "middle_center" ||
        anchor === "middle_right"
      ) {
        y -= HALF_TEXT_HEIGHT;
      }
      this.text(message, font, xy(x, y));
    }
    for (let i = 0; i < message.length; ++i) {
      let letter = message[i];
      if (letter === " ") {
        x += 6;
        continue;
      }
      if (letter === "\n") {
        x = pos.x;
        y += line_height;
        continue;
      }
      if (font[letter] === undefined) {
        letter = ".";
      }
      this.sprite(font[letter], xy(x, y));
      x += 6;
    }
  }
  rectangle(pos: XY, size: WH) {
    let x = pos.x;
    let y = pos.y;
    let width = size.width;
    let height = size.height;
    if (this.autoscale) {
      x = x * SCALE();
      y = y * SCALE();
      width = width * SCALE();
      height = height * SCALE();
    }
    const left = this.ctx.createImageData(1, height);
    const right = this.ctx.createImageData(1, height);
    const top = this.ctx.createImageData(width, 1);
    const bottom = this.ctx.createImageData(width, 1);
    for (let i = 0; i < width; i++) {
      top.data[i * 4 + 0] = 255;
      top.data[i * 4 + 1] = 255;
      top.data[i * 4 + 2] = 255;
      top.data[i * 4 + 3] = 255;
      bottom.data[i * 4 + 0] = 255;
      bottom.data[i * 4 + 1] = 255;
      bottom.data[i * 4 + 2] = 255;
      bottom.data[i * 4 + 3] = 255;
    }
    for (let i = 0; i < height; i++) {
      left.data[i * 4 + 0] = 255;
      left.data[i * 4 + 1] = 255;
      left.data[i * 4 + 2] = 255;
      left.data[i * 4 + 3] = 255;
      right.data[i * 4 + 0] = 255;
      right.data[i * 4 + 1] = 255;
      right.data[i * 4 + 2] = 255;
      right.data[i * 4 + 3] = 255;
    }
    this.ctx.putImageData(top, x, y);
    this.ctx.putImageData(left, x, y);
    this.ctx.putImageData(right, x + width - 1, y);
    this.ctx.putImageData(bottom, x, y + height - 1);
  }
}
