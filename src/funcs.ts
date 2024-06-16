import type { CR, FillStroke, XY } from "./interfaces.js";

export class OXY {
  // An x, y screen space pixel offset,
  // which forces you to convert it to canvas coordinates
  ox: number;
  oy: number;
  source: HTMLCanvasElement;
  constructor(ox: number, oy: number, source: HTMLCanvasElement) {
    this.ox = ox;
    this.oy = oy;
    this.source = source;
  }

  to_xy(target: WH): XY {
    return offset_to_xy(this, target);
  }
}

export function oxy(ox: number, oy: number, source: HTMLCanvasElement): OXY {
  return new OXY(ox, oy, source);
}

export function xy(x: number, y: number): XY {
  return { x: x, y: y };
}

export function cr(c: number, r: number): CR {
  return { c: c, r: r };
}

export function fill_stroke(f: string, s: string): FillStroke {
  return { fill: f, stroke: s };
}

export function distance_xy(a: XY, b: XY) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

export function distance_cr(a: CR, b: CR) {
  return Math.sqrt((b.c - a.c) ** 2 + (b.r - a.r) ** 2);
}

export function distance(a: CR, b: CR): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.c - b.c) ** 2);
}

export function offset_to_xy(offset: OXY, target: WH): XY {
  const source = offset.source;
  const x = (target.width * offset.ox) / source.getBoundingClientRect().width;
  const y = (target.height * offset.oy) / source.getBoundingClientRect().height;
  return xy(x, y);
}

export function xy_to_cr(p: XY, grid: Grid): CR {
  const col = Math.floor((grid.columns * p.x) / grid.width);
  const row = Math.floor((grid.rows * p.y) / grid.height);
  return cr(col, row);
}

export function cr_to_xy(p: CR, grid: Grid): XY {
  return xy(
    Math.floor(p.c * grid.cell_width),
    Math.floor(p.r * grid.cell_height),
  );
}

export function cr_to_xy_centered(p: CR, grid: Grid): XY {
  return xy(
    Math.round((0.5 + p.c) * grid.cell_width),
    Math.round((0.5 + p.r) * grid.cell_height),
  );
}

export class WH {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

export function wh(width: number, height: number): WH {
  return new WH(width, height);
}

export class Grid {
  width: number;
  height: number;
  columns: number;
  rows: number;
  constructor(width: number, height: number, columns: number, rows: number) {
    this.width = width;
    this.height = height;
    this.columns = columns;
    this.rows = rows;
  }

  get cell_width(): number {
    return this.width / this.columns;
  }

  get cell_height(): number {
    return this.height / this.rows;
  }
}

export function get_rotation(a: CR, b: CR): number {
  const rot = Math.atan2(a.r - b.r, b.c - a.c);
  if (rot > 0.0) {
    return rot;
  }
  return rot + 2 * Math.PI;
}

// Numbers / math:

export function limit(min: number, x: number, max: number): number {
  if (x < min) {
    return min;
  }
  if (x > max) {
    return max;
  }
  return x;
}

export function seconds(ms: number): number {
  return ms / 1000;
}

export function dps(dps: number, ms: number): number {
  return dps * seconds(ms);
}

// min and max are both inclusive
// (use max = length - 1 with arrays)
export function randint(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Text wrapping:

export class TextWrapper {
  original: string;
  remaining: string;
  word: string;
  words: string[];
  lines: string[];
  line_length: number;
  fragment_length: number;

  constructor(text: string, line_length: number) {
    this.original = text;
    this.remaining = text.trim().replace("  ", " ");
    this.word = "";
    this.words = [];
    this.lines = [];
    this.line_length = line_length;
    this.fragment_length = line_length - 1;
  }

  push_line() {
    if (this.words.length > 0) {
      this.lines.push(this.words.join(" "));
      this.words = [];
    }
  }

  line_overflow(): boolean {
    const line = this.words.join(" ") + " " + this.word;
    return line.length > this.line_length;
  }

  push_word() {
    if (this.word === "") {
      return;
    }
    if (this.word.length > this.line_length) {
      this.fragment_word();
      return;
    }
    if (this.line_overflow()) {
      this.push_line();
    }
    this.words.push(this.word);
    this.word = "";
  }

  get_fragments(word: string): string[] {
    const fragments = [];
    if (word.includes("-")) {
      for (const fragment of word.split("-")) {
        if (fragment.length > this.fragment_length) {
          fragments.push(...this.get_fragments(fragment));
        } else {
          fragments.push(fragment);
        }
      }
      return fragments;
    }
    while (word.length > 0) {
      const fragment = word.slice(0, this.fragment_length);
      fragments.push(fragment);
      word = word.slice(this.fragment_length);
    }
    return fragments;
  }

  fragment_word() {
    const fragments = this.get_fragments(this.word).join("-\n").split("\n");
    for (const fragment of fragments) {
      this.word = fragment;
      this.push_word();
    }
    // By this point, we have pushed 2 or more words,
    // and this.word is empty
  }

  main_loop() {
    for (const c of this.remaining) {
      if (c === " ") {
        this.push_word();
      } else {
        this.word = this.word + c;
      }
    }
    this.push_word();
    this.push_line();
  }

  run(): string {
    if (this.original === "" || this.original.includes("\n")) {
      return this.original;
    }
    if (this.remaining === "") {
      return "";
    }
    this.main_loop();
    return this.lines.join("\n");
  }
}

export function text_wrap(text: any, line_length: any): string {
  const tw = new TextWrapper(text, line_length);
  return tw.run();
}

// Resolution:

// Since we need all clients and the backend to agree on a width and height,
// for the coordinate system in each game, we define those here.
// Thus, by default we create games and canvas elements with a 1280x720px resolution.
// There are various situations where the actual canvas has a different size,
// for example due to retina displays (window.devicePixelRatio), browser zoom level,
// and CSS (max-width, CSS grid, etc.).
// The frontend code can account for this, and translate mouse offsets as well
// as draw on a canvas object with a different width and height.
export function standard_canvas_width(): number {
  return 1280;
}

export function standard_canvas_height(): number {
  return 720;
}

// Usernames and IDs:

const USERNAMES = ["Turtle", "Bison", "Cheetah", "Gecko", "Orca", "Camel"];

export function get_random_username(): string {
  return random_element(USERNAMES);
}

export function get_random_userid(): string {
  const array = new Uint32Array(14);
  const digits = array.map((_) => randint(0, 9));
  return digits.join("");
}

//  Cookies:

export function get_cookie(key: string): string | null {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${key}=`))
    ?.split("=")[1];
  if (value === undefined) {
    return null;
  }
  return value;
}

export function set_cookie(key: string, value: string) {
  document.cookie = `${key}=${value}; Secure`;
}

// String operations:

export function left_pad(s: string | number, n: number, pad = " ") {
  let result = "" + s;
  while (result.length < n) {
    result = pad + result;
  }
  return result;
}

export function strip_suffix(string: string, suffix: string) {
  if (!string.endsWith(suffix)) {
    return string;
  }
  return string.slice(0, string.length - suffix.length);
}

export function strip_both(prefix: string, string: string, suffix: string) {
  return strip_prefix(prefix, strip_suffix(string, suffix));
}

export function strip_prefix(prefix: string, string: string) {
  if (!string.startsWith(prefix)) {
    return string;
  }
  return string.slice(prefix.length);
}

export function number_string(n: number | string): string {
  const num = Number(n);
  if (num < 0) {
    return "-" + number_string(-1 * num);
  }
  const s = "" + num;
  if (s.includes("e") || s.length <= 3) {
    return s;
  }

  let result = "";
  let length = 0;
  for (const c of s.split("").reverse()) {
    result += c;
    length += 1;
    if (length % 3 === 0) {
      result += " ";
    }
  }
  return result.split("").reverse().join("").trim();
}

// Array / data structure operations:

export function shuffle(array: any[]): any[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randint(0, i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

export function random_element<T>(a: Array<T>): T {
  return a[Math.floor(Math.random() * a.length)];
}

export function deep_copy<T>(obj: T): T {
  return structuredClone(obj);
}

export function array_remove<T>(arr: T[], obj: T) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === obj) {
      arr.splice(i, 1);
      i--;
    }
  }
}

// HTTP:

export async function http_get(url: string): Promise<object> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

export async function get_png(url: string): Promise<Blob> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "image/png",
    },
  });
  return response.blob();
}

export async function http_delete(url: string): Promise<object> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

export async function http_put(url: string, data: object): Promise<object> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function http_post(url: string, data: object): Promise<object> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
