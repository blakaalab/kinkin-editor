# Kinkin Editor

A standalone, Tiptap-based rich text editor with no app-specific coupling, built
to be dropped into other apps.

Markdown in, markdown out (or HTML/JSON), with slash commands, tables, images,
emoji, drag-to-reorder blocks, and an AI Assist panel that streams from whatever
LLM you point it at.

## Quick start

```bash
git clone https://github.com/blakaalab/kinkin-editor.git
cd kinkin-editor
npm install
npm run dev
```

The playground opens on Vite's default port (5173 unless taken) — a full editor
with an editable toggle and a live markdown output panel.

| Script | What it does |
| --- | --- |
| `npm run dev` | Playground with HMR |
| `npm run build` | Type-check, then production build |
| `npm run type-check` | `tsc --noEmit` |
| `npm run check` | Biome lint + format + import order |
| `npm run check:fix` | Same, applying safe fixes |
| `npm run format` | Format only |

## What's in here

```
src/
├── editor/
│   ├── rich-text-editor.tsx     # the component you use
│   ├── fixed-toolbar.tsx        # persistent full toolbar
│   ├── selection-toolbar.tsx    # floating toolbar on text selection (desktop)
│   ├── mobile-toolbar.tsx       # bottom toolbar (mobile)
│   ├── toc.tsx                  # optional table-of-contents renderer
│   ├── use-ai-assist-stream.ts  # prompt building + streaming glue for AI Assist
│   ├── index.ts                 # public exports
│   └── tiptap-cores/            # the editor engine (89 files)
├── components/ui/               # 4 shadcn primitives the engine needs
├── lib/utils.ts                 # cn()
├── styles/global.css            # Tailwind v4 theme tokens
└── app.tsx                      # playground
```

`tiptap-cores` is the substantial part: extensions, node views, slash commands,
emoji picker, tables, drag handles, AI Assist UI, markdown paste/serialization.

## Usage

```tsx
import { FixedToolbar, RichTextEditor } from "@/editor";

<RichTextEditor
  initialContent={markdown}
  contentType="markdown"
  outputContentType="markdown"
  onChange={(value) => save(value as string)}
  imageUploadHandler={myUploadHandler}
  streamCompletion={myLlmStream}
  toolbar={<FixedToolbar showAiAssist />}
/>;
```

### Toolbars

Three are included, and they compose independently:

- **`FixedToolbar`** — persistent, always visible. Pass it to the `toolbar` slot
  so it renders inside the editor context. Covers undo/redo, block type, lists,
  marks, blockquote, code block, horizontal rule, link, table, image, slash
  commands and AI Assist.
- **`SelectionToolbar`** — floats over selected text on desktop. Rendered
  automatically.
- **`MobileToolbar`** — docks to the bottom on narrow viewports. Rendered
  automatically.

Omit the `toolbar` prop entirely for a chromeless editor driven by slash commands
and the selection toolbar alone.

### Integration points

The two things the host app must provide — both optional, both plain callbacks:

**`imageUploadHandler`** — uploads images dropped or pasted into the editor and
resolves to a URL. Omit it to disable image upload.

```ts
const handler: EditorImageUploadHandler = {
  upload: async (file, onProgress) => {
    const url = await uploadToWherever(file, onProgress);
    return url;
  },
};
```

**`streamCompletion`** — streams LLM tokens for AI Assist ("improve", "shorten",
"translate", etc.). The hook builds the prompt; you own the transport. Omit it
to disable AI Assist.

```ts
function streamCompletion({ message, signal, onChunk, onComplete, onError }) {
  // POST `message` to your LLM endpoint, call onChunk per token
}
```

`src/app.tsx` has demo implementations of both (a local data-URL "upload" and a
fake token stream) — replace them, don't ship them.

## Dropping it into another app

`src/editor/` is not yet fully self-contained. To move it, you need:

1. **The folder itself** — `src/editor/`.
2. **What it imports from outside** — `src/components/ui/{card,kbd,separator,tooltip}.tsx`,
   `src/lib/utils.ts` (`cn()`), and `src/assets/image-loading-placeholder.svg`.
3. **The `@/*` → `src/*` path alias**, in both `tsconfig.json` and `vite.config.ts`
   (or your bundler's equivalent) — imports use `@/editor/...`.
4. **Tailwind v4** plus the theme tokens in `src/styles/global.css`, and a Sass
   compiler (`sass-embedded`) for the engine's `.scss` files.
5. **Runtime deps**: `@tiptap/*` (see the pin below), `@ariakit/react`,
   `@floating-ui/react`, `@radix-ui/react-{separator,slot,tooltip}`,
   `class-variance-authority`, `clsx`, `tailwind-merge`, `dompurify`,
   `es-toolkit`, `lucide-react`, `react-hotkeys-hook`.

Moving the four UI primitives and `cn()` inside `src/editor/` would reduce this
to steps 1, 3 and 5 — worth doing if the editor gets reused often.

## Conventions

- **Biome** handles formatting, linting and import order (`biome.json`). File
  names are kebab-case, enforced by `useFilenamingConvention`.
- The `$schema` points at the copy in `node_modules`, so editors resolve it
  offline — it only works after `npm install`.
- Two a11y rules are off (`useSemanticElements`, `noStaticElementInteractions`):
  both flag correct ARIA in the toolbar and menu primitives. Don't read the clean
  lint run as full a11y coverage.
- `useExhaustiveDependencies` is a warning, not an error. The remaining warnings
  are all in `tiptap-cores`; adding the missing deps changes when effects re-run,
  so they need testing rather than a blind fix. `ui/ai-chat-button/index.tsx` is
  the one worth a look — it omits `editor.state.selection.from`.

## Notes

- All `@tiptap/*` packages are pinned to **3.22.4** via npm `overrides`. Tiptap's
  transitive `^3.22.4` ranges otherwise resolve to a newer minor and install a
  second copy of `@tiptap/core`, which breaks both types and the build. Keep the
  overrides in sync if you upgrade — move the whole scope at once.
- Styling is Tailwind v4. `src/styles/global.css` carries only the theme tokens
  the editor needs; swap them for your own design tokens. The engine's own node
  styling uses a self-contained `--tt-core-*` variable namespace
  (`src/editor/tiptap-cores/styles/_variables.scss`).
- Stack: React 19, Vite 7, Tailwind 4, TypeScript 5.9.
