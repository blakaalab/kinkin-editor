# Kinkin Editor

A standalone, Tiptap-based rich text editor with no app-specific coupling, built
to be dropped into other apps.

Markdown in, markdown out (or HTML/JSON), with slash commands, tables, images,
emoji, drag-to-reorder blocks, and an AI Assist panel that streams from whatever
LLM you point it at.

## Install

```bash
npm install kinkin-editor
```

`react`, `react-dom` and the `@tiptap/*` packages are **peer dependencies** —
the host app owns those versions. Two copies of React or ProseMirror in one page
break at runtime, so they are deliberately not bundled.

```tsx
import { FixedToolbar, RichTextEditor } from "kinkin-editor";
import "kinkin-editor/style.css";

<RichTextEditor
  initialContent={markdown}
  contentType="markdown"
  outputContentType="markdown"
  onChange={(value) => save(value as string)}
  toolbar={<FixedToolbar />}
/>;
```

## Using it alongside your own Tailwind

The shipped `style.css` cannot collide with your styles. It is built with **no
preflight** (so it never fights your base reset), and every rule — including the
theme variables that would normally sit on `:root` — is nested under
`.kinkin-editor`, the class the editor root carries.

That means the library's `.text-sm` and `--color-gray-500` apply *only* inside
the editor, and your app's identically-named utilities are untouched. No prefix
to configure, no Tailwind version requirement on your side, and it works in apps
that don't use Tailwind at all.

Menus, tooltips, drag previews and the mobile toolbar render through a portal, so
they'd normally escape that scope. They're portalled into a container that also
carries the class — exported as `getEditorPortalRoot()` if you need it.

To restyle, override the tokens on the scope:

```css
.kinkin-editor {
  --color-primary-700: #7c3aed;
  --color-foreground: #1f2937;
}
```

## Local development

```bash
npm install
npm run dev              # playground with HMR
npm run build            # library -> dist/
npm run build:playground # demo app -> dist-playground/
npm run check            # Biome lint + format
```

## What's in here

```
src/
├── index.ts                     # library entry (public API)
├── lib.css                      # published stylesheet (no preflight, scoped)
├── editor/
│   ├── rich-text-editor.tsx     # the component you use
│   ├── portal-root.ts           # scoped container for portalled UI
│   ├── fixed-toolbar.tsx        # persistent full toolbar
│   ├── selection-toolbar.tsx    # floating toolbar on text selection (desktop)
│   ├── mobile-toolbar.tsx       # bottom toolbar (mobile)
│   ├── toc.tsx                  # optional table-of-contents renderer
│   ├── use-ai-assist-stream.ts  # prompt building + streaming glue for AI Assist
│   └── tiptap-cores/            # the editor engine (89 files)
├── components/ui/               # 4 shadcn primitives the engine needs
├── lib/utils.ts                 # cn()
├── styles/global.css            # playground-only styles
└── app.tsx                      # playground
```

`tiptap-cores` is the substantial part: extensions, node views, slash commands,
emoji picker, tables, drag handles, AI Assist UI, markdown paste/serialization.

## API

```tsx
import { FixedToolbar, RichTextEditor } from "kinkin-editor";

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

## Vendoring the source instead

`npm install` is the normal path. If you'd rather copy the source in — to fork it
or avoid the dependency — `src/editor/` is not fully self-contained. You need:

1. **The folder itself** — `src/editor/`.
2. **What it imports from outside** — `src/components/ui/{card,kbd,separator,tooltip}.tsx`,
   `src/lib/utils.ts` (`cn()`), and `src/assets/image-loading-placeholder.svg`.
3. **The `@/*` → `src/*` path alias**, in both `tsconfig.json` and `vite.config.ts`
   (or your bundler's equivalent) — imports use `@/editor/...`.
4. **Tailwind v4** plus the theme tokens in `src/lib.css`, and a Sass compiler
   (`sass-embedded`) for the engine's `.scss` files.
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

- Consumers get `@tiptap/*` as a `^3.22.4` peer range. **This repo's own** tree
  pins them to exactly 3.22.4 via npm `overrides`, because Tiptap's transitive
  `^3.22.4` ranges otherwise resolve to a newer minor and install a second copy
  of `@tiptap/core`, breaking types and the build. (`overrides` only affect this
  repo — they are ignored when the package is installed elsewhere.) If you have
  the same duplicate-core problem in your app, apply the same override there.
- The engine's node styling uses a self-contained `--tt-core-*` variable
  namespace (`src/editor/tiptap-cores/styles/_variables.scss`), overridable on
  the `.kinkin-editor` scope like any other token.
- Stack: React 19, Vite 7, Tailwind 4, TypeScript 5.9.
