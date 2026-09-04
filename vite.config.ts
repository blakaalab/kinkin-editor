import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import prefixSelector from "postcss-prefix-selector";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCOPE = ".kinkin-editor";

/**
 * Nests every rule in the published stylesheet under `.kinkin-editor`, so the
 * library's Tailwind utilities and theme variables cannot escape into a host
 * app that also uses Tailwind (and vice versa).
 */
const scopeToEditor = prefixSelector({
  prefix: SCOPE,
  transform(_prefix, selector, prefixedSelector) {
    // Root-level custom properties belong on the scope element itself.
    if (selector === ":root" || selector === ":host") {
      return SCOPE;
    }
    // Document-level selectors collapse onto the scope element.
    if (selector.startsWith("html") || selector.startsWith("body")) {
      return SCOPE;
    }
    // Keyframe stops must be left alone.
    if (selector === "from" || selector === "to" || /^\d+%$/.test(selector)) {
      return selector;
    }
    // Already scoped.
    if (selector.startsWith(SCOPE)) {
      return selector;
    }

    return prefixedSelector;
  },
});

export default defineConfig(({ mode }) => {
  const isLib = mode === "lib";

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isLib
        ? [
            dts({
              include: ["src"],
              exclude: ["src/app.tsx", "src/main.tsx"],
              insertTypesEntry: true,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    ...(isLib
      ? {
          css: {
            postcss: { plugins: [scopeToEditor] },
          },
          // The playground builds to dist-playground so it can never clobber
          // the library output that `files: ["dist"]` publishes.
          build: {
            lib: {
              entry: path.resolve(__dirname, "src/index.ts"),
              formats: ["es"] as const,
              fileName: () => "index.js",
              cssFileName: "style",
            },
            sourcemap: true,
            emptyOutDir: true,
            rollupOptions: {
              // Anything that must be a single instance in the host app stays
              // external — two copies of ProseMirror or React break at runtime.
              external: [
                "react",
                "react-dom",
                "react/jsx-runtime",
                "react-dom/client",
                /^@tiptap\//,
                /^prosemirror-/,
              ],
            },
          },
        }
      : { build: { outDir: "dist-playground" } }),
  };
});
