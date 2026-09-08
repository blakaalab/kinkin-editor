import { existsSync } from "node:fs";
import path from "node:path";
import type { KnipConfig } from "knip";

/**
 * Sass resolves `@use "tokens"` to `_tokens.scss` in the same directory, and
 * treats a bare specifier as relative. Knip resolves imports the way a bundler
 * does, so the compiler below rewrites each `@use`/`@import` to the file it
 * actually means; without it knip skips stylesheets entirely and an orphaned
 * partial would go unnoticed.
 */
const scssImports = (text: string, filePath: string): string => {
  const dir = path.dirname(filePath);

  return [...text.matchAll(/@(?:use|import)\s+['"]([^'"]+)['"]/g)]
    .map(([, specifier]) => {
      if (specifier.startsWith("sass:")) {
        return null; // built-in module, not a file
      }

      const base = path.resolve(dir, specifier);
      const partial = path.join(path.dirname(base), `_${path.basename(base)}`);
      const resolved = [base, `${base}.scss`, partial, `${partial}.scss`].find(
        (candidate) => existsSync(candidate),
      );

      if (!resolved) {
        return null;
      }

      const relative = path.relative(dir, resolved).replaceAll(path.sep, "/");
      return `import '${relative.startsWith(".") ? relative : `./${relative}`}'`;
    })
    .filter(Boolean)
    .join("\n");
};

/**
 * Two entry points knip cannot infer: `src/content.ts` is reached only through
 * package.json's `exports` map, and `content.scss` is compiled by
 * `scripts/build-content-css.mjs`, which names it as a path rather than
 * importing it.
 */
const config: KnipConfig = {
  entry: [
    "src/index.ts!",
    "src/content.ts!",
    "src/editor/tiptap-cores/styles/content.scss!",
    "scripts/*.mjs",
  ],
  project: ["src/**/*.{ts,tsx,scss,sass,css}", "scripts/*.mjs"],
  // Vendored shadcn primitives, kept whole rather than trimmed to what is used.
  ignore: ["src/components/ui/**"],
  // A hook's config type is exported beside the hook here by convention.
  ignoreExportsUsedInFile: true,
  compilers: { scss: scssImports },
};

export default config;
