/*
 * Compiles the display-only stylesheet to `dist/content.css`.
 *
 * It is built here rather than through Vite on purpose: the library build runs
 * every stylesheet through `postcss-prefix-selector`, which would nest these
 * rules under `.kinkin-editor` — the one thing this sheet must not be. It also
 * has no Tailwind in it, so plain Sass is the whole toolchain.
 *
 * Runs after `vite build --mode lib`, which empties `dist/`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as sass from "sass-embedded";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const entry = path.join(
  root,
  "src/editor/tiptap-cores/styles/content.scss",
);
const outFile = path.join(root, "dist/content.css");

const { css } = await sass.compileAsync(entry, { style: "compressed" });

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, `${css}\n`);

const size = (Buffer.byteLength(css) / 1024).toFixed(2);
console.log(`dist/content.css  ${size} kB`);
