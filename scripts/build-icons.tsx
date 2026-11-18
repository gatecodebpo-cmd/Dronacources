// `npm run icons` – builds public/icons.svg, a sprite of every lucide icon rendered by <SvgIcon>.
// Icons referenced from the sprite cost a few bytes each in the HTML instead of full inline SVG paths.
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as lucide from "lucide-react";
import { SPRITE_ICONS } from "../lib/icons";

const symbols = SPRITE_ICONS.map((name) => {
  const C = (lucide as any)[name];
  if (!C) throw new Error(`lucide-react has no icon named ${name}`);
  const svg = renderToStaticMarkup(createElement(C));
  const inner = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  return `<symbol id="${name}" viewBox="0 0 24 24">${inner}</symbol>`;
});

const out = `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join("")}</svg>\n`;
const file = path.join(process.cwd(), "public", "icons.svg");
fs.writeFileSync(file, out);
console.log(`icons.svg: ${SPRITE_ICONS.length} icons, ${(out.length / 1024).toFixed(1)} KB`);
