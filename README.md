# Kinkin Editor

A standalone, Tiptap-based rich text editor with no app-specific coupling, built
to be dropped into other apps.

## Quick start

```bash
npm install
npm run dev        # playground at http://localhost:5173
npm run type-check
npm run build
```

## What's in here

```
src/
├── editor/
│   ├── RichTextEditor.tsx      # the component you use
│   ├── FixedToolbar.tsx        # persistent full toolbar
│   ├── SelectionToolbar.tsx    # floating toolbar on text selection (desktop)
│   ├── MobileToolbar.tsx       # bottom toolbar (mobile)
│   ├── ToC.tsx                 # optional table-of-contents renderer
│   ├── use-ai-assist-stream.ts # prompt building + streaming glue for AI Assist
│   ├── index.ts                # public exports
│   └── tiptap-cores/           # the editor engine (89 files)
├── components/ui/              # 4 shadcn primitives the engine needs
├── lib/utils.ts                # cn()
├── styles/global.css           # Tailwind v4 theme tokens
└── App.tsx                     # playground
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

`src/App.tsx` has demo implementations of both (a local data-URL "upload" and a
fake token stream) — replace them, don't ship them.

## Notes

- All `@tiptap/*` packages are pinned to **3.22.4** via npm `overrides`. Tiptap's
  transitive `^3.22.4` ranges otherwise resolve to a newer minor and install a
  second copy of `@tiptap/core`, which breaks both types and the build. Keep the
  overrides in sync if you upgrade — move the whole scope at once.
- Styling is Tailwind v4. `src/styles/global.css` carries only the theme tokens
  the editor needs; swap them for your own design tokens. The engine's own node
  styling uses a self-contained `--tt-core-*` variable namespace
  (`src/editor/tiptap-cores/styles/_variables.scss`).
- SCSS requires `sass-embedded` (already a devDependency).
