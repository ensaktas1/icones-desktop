// Turn a raw Iconify icon into a customized, exportable SVG string.
// All customization (size, padding, rotate, flip, color) is applied here so
// the live preview and the copied/exported output are guaranteed identical.

import { iconToSVG, replaceIDs } from "@iconify/utils";
import type { IconifyIcon } from "@iconify/types";

export interface RenderOptions {
  size: number;
  padding: number;
  rotate: number; // arbitrary degrees
  hFlip: boolean;
  vFlip: boolean;
  color: string; // applied when currentColor is off
  currentColor: boolean;
}

export const DEFAULT_OPTIONS: RenderOptions = {
  size: 18,
  padding: 0,
  rotate: 0,
  hFlip: false,
  vFlip: false,
  color: "#ffffff",
  currentColor: false,
};

const round = (n: number) => Math.round(n * 1000) / 1000;

export function buildSvg(icon: IconifyIcon, o: RenderOptions): string {
  const built = iconToSVG(icon, {
    width: o.size,
    hFlip: o.hFlip,
    vFlip: o.vFlip,
  });

  let body = replaceIDs(built.body);

  const [minX, minY, w0, h0] = built.attributes.viewBox.split(" ").map(Number);
  const wPx = parseFloat(built.attributes.width ?? String(o.size));
  const hPx = parseFloat(built.attributes.height ?? String(o.size));

  if (!o.currentColor && o.color) {
    body = body.replaceAll("currentColor", o.color);
  }

  if (o.rotate % 360 !== 0) {
    const cx = minX + w0 / 2;
    const cy = minY + h0 / 2;
    body = `<g transform="rotate(${o.rotate} ${round(cx)} ${round(cy)})">${body}</g>`;
  }

  // Padding grows the canvas symmetrically around the glyph.
  const unitPerPx = w0 / wPx;
  const padU = o.padding * unitPerPx;
  const viewBox = [minX - padU, minY - padU, w0 + 2 * padU, h0 + 2 * padU]
    .map(round)
    .join(" ");
  const width = round(wPx + 2 * o.padding);
  const height = round(hPx + 2 * o.padding);

  const attrs = [
    `xmlns="http://www.w3.org/2000/svg"`,
    `width="${width}"`,
    `height="${height}"`,
    `viewBox="${viewBox}"`,
    o.currentColor ? `fill="currentColor"` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return `<svg ${attrs}>${body}</svg>`;
}

// ---- export formats ----

export type ExportFormat = "SVG" | "JSX" | "React" | "Data URL";
export const EXPORT_FORMATS: ExportFormat[] = ["SVG", "JSX", "React", "Data URL"];

const ATTR_MAP: Record<string, string> = {
  class: "className",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-opacity": "strokeOpacity",
  "fill-rule": "fillRule",
  "fill-opacity": "fillOpacity",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
};

function svgToJsx(svg: string): string {
  let out = svg;
  for (const [k, v] of Object.entries(ATTR_MAP)) out = out.replaceAll(`${k}=`, `${v}=`);
  return out;
}

function pascalCase(name: string): string {
  const base = name
    .split(/[-_:]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return `Icon${base || "Symbol"}`;
}

function reactComponent(svg: string, name: string): string {
  const jsx = svgToJsx(svg).replace("<svg ", "<svg {...props} ");
  return `import type { SVGProps } from "react";

export function ${pascalCase(name)}(props: SVGProps<SVGSVGElement>) {
  return (
    ${jsx}
  );
}
`;
}

export function toFormat(svg: string, fmt: ExportFormat, name: string): string {
  switch (fmt) {
    case "SVG":
      return svg;
    case "Data URL":
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    case "JSX":
      return svgToJsx(svg);
    case "React":
      return reactComponent(svg, name);
  }
}
