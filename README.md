# Kinkin Editor

A drop-in rich text editor for React, built on [Tiptap](https://tiptap.dev) and
ProseMirror.

Markdown in, markdown out (or HTML/JSON). Slash commands, tables, images, emoji,
drag-to-reorder blocks, a table of contents, and an AI Assist panel that streams
from whatever LLM you point it at.

It's designed to go into an app you already have: no global CSS reset, no
required Tailwind setup, no provider to mount, and no backend assumptions — image
upload and AI are plain callbacks you supply, or leave out.

- [Install](#install)
- [Quick start](#quick-start)
- [Using it with your own Tailwind](#using-it-with-your-own-tailwind)
- [Theming](#theming)
- [API reference](#api-reference)
- [Recipes](#recipes)
- [What the editor can do](#what-the-editor-can-do)
- [Troubleshooting](#troubleshooting)
- [Local development](#local-development)

---

## Install

> **Not published to npm yet.** Until it is, install from GitHub — which works
> with **npm only**. pnpm and Yarn block the build step git installs require
> (see below). Publishing to npm fixes this for every package manager.

### npm

```bash
npm install github:blakaalab/kinkin-editor
```

That's the whole command. npm 7+ reads `peerDependencies` and installs React and
all 21 `@tiptap/*` packages automatically — you don't list them.

Since the repo doesn't commit build output, npm runs the `prepare` script to
build the package during install. First install takes a couple of minutes.

### pnpm

A GitHub install **fails** with `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`: pnpm 10+
refuses to run build scripts for git-hosted packages, and the allowlist entry it
suggests is keyed by commit hash, so it breaks on every update.

Two options until this is on npm:

```bash
# 1. Build a tarball from a local clone, then install that
git clone https://github.com/blakaalab/kinkin-editor.git
cd kinkin-editor && npm install && npm pack
cd ../your-app && pnpm add ../kinkin-editor/kinkin-editor-0.1.0.tgz
```

```yaml
# 2. Or allow the build, in pnpm-workspace.yaml (re-pin on every update)
allowBuilds:
  kinkin-editor@https://codeload.github.com/blakaalab/kinkin-editor/tar.gz/<commit-sha>: true
```

Once published, pnpm needs nothing special — it auto-installs peers by default:

```bash
pnpm add kinkin-editor
```

### Yarn

Yarn does **not** auto-install peer dependencies — neither Classic nor Berry. You
need them explicitly (brace expansion keeps it to two lines):

```bash
yarn add kinkin-editor
yarn add react react-dom \
  @tiptap/{core,react,pm,starter-kit,extensions,markdown,suggestion,extension-emoji,extension-highlight,extension-history,extension-horizontal-rule,extension-image,extension-list,extension-mention,extension-strike,extension-table,extension-table-of-contents,extension-text-style,extension-typography,extension-unique-id,extension-drag-handle-react}
```

### Why peer dependencies at all

React and ProseMirror must be **single instances**. Two copies of React gives you
"Invalid hook call"; two copies of ProseMirror gives you `RangeError: Invalid
content` and plugin-key collisions, because `prosemirror-model` relies on
`instanceof` checks and a shared schema registry. Declaring them as peers is what
makes package managers dedupe to one copy.

Every `@tiptap/*` peer is pinned to `~3.22.4` — the version this library is built
and tested against. Mixed Tiptap minors fail at build time, so the range is
deliberately narrow; it'll widen once newer Tiptap is verified.

---

## Quick start

```tsx
import { useState } from "react";
import { FixedToolbar, RichTextEditor } from "kinkin-editor";
import "kinkin-editor/style.css";

export function Editor() {
  const [markdown, setMarkdown] = useState("# Hello\n\nStart typing.");

  return (
    <div style={{ height: "100vh" }}>
      <RichTextEditor
        initialContent={markdown}
        contentType="markdown"
        outputContentType="markdown"
        onChange={(value) => setMarkdown(value as string)}
        toolbar={<FixedToolbar />}
      />
    </div>
  );
}
```

Two things that trip people up:

1. **Import the stylesheet.** `import "kinkin-editor/style.css"` once, anywhere
   in your app. Without it the editor renders unstyled.
2. **Give it a height.** The editor fills its container (`height: 100%`). In a
   container with no height it collapses to nothing. Use a parent with an
   explicit height, or `min-height: 0` if it's a flex child.

The toolbar is optional — omit `toolbar` for a chromeless editor, still driven by
slash commands and the selection toolbar.

---

## Using it with your own Tailwind

**Short version: nothing to configure. It cannot collide with your styles.**

Shipping Tailwind from a library normally causes three problems. All three are
handled at build time:

| Problem | How it's avoided |
| --- | --- |
| Utility collisions — the library's `.text-sm` silently restyling *your* app | Every rule is nested under `.kinkin-editor`, so it only applies inside the editor |
| Token leakage — the library's `--color-*` overriding your theme on `:root` | `:root` is rewritten to `.kinkin-editor`; nothing lands on the document root |
| Duplicate preflight — two base resets fighting | The stylesheet is built with **no preflight** |

The library's `.text-gray-500` and yours can hold completely different values and
neither is disturbed. You don't need Tailwind at all — what ships is plain
compiled CSS.

Portalled UI (menus, tooltips, drag previews, the mobile toolbar) would normally
escape that scope by rendering into `document.body`. It's portalled into a
container that also carries the class, exposed as `getEditorPortalRoot()`.

---

## Theming

Override the design tokens on the scope class — they cascade to everything
inside:

```css
.kinkin-editor {
  --color-primary-700: #7c3aed;  /* accent: active buttons, focus rings */
  --color-foreground: #1f2937;   /* body text */
  --color-background: #ffffff;
  --color-border: #e5e7eb;
  --color-muted-foreground: #6b7280;
  --font-sans: "Inter", system-ui, sans-serif;
}
```

Editor *content* styling (code blocks, tables, task lists, blockquotes) uses a
separate `--tt-core-*` namespace, overridable the same way:

```css
.kinkin-editor {
  --tt-core-code-bg: #f5f5f5;
  --tt-core-table-header-bg: #fafafa;
  --tt-core-link: #2563eb;
  --tt-core-selection: #dbeafe;
}
```

---

## API reference

### `<RichTextEditor />`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `initialContent` | `Content` | — | Starting content: a markdown/HTML string, or a Tiptap JSON doc. Changing it after mount replaces the content and clears undo history. |
| `contentType` | `"markdown" \| "html" \| "json"` | `"markdown"` | How to interpret `initialContent`. |
| `outputContentType` | `"markdown" \| "html" \| "json" \| "text"` | `"markdown"` | What `onChange` emits. |
| `onChange` | `(value, meta?) => void` | — | Fires on edit. `value` is a string, or `JSONContent` when output is `"json"`. Suppressed while AI is streaming. |
| `editable` | `boolean` | `true` | `false` renders read-only — toolbars hide, content stays selectable. |
| `toolbar` | `ReactNode` | — | Rendered above the content, inside the editor context. Pass `<FixedToolbar />`. |
| `imageUploadHandler` | `EditorImageUploadHandler` | — | Enables image upload. Omit to disable. |
| `streamCompletion` | `StreamCompletionFn` | — | Enables AI Assist. Omit to disable. |
| `aiMode` | `"assist" \| "chat"` | — | Which AI button the selection toolbar shows. |
| `onAiChatRequest` | `(message, selectedText) => void` | — | Called by the chat button when `aiMode="chat"`. |
| `onTocItemsChange` | `(items) => void` | — | Fires when headings change. Feed into `<ToC />`. |
| `editorRef` | `RefObject<Editor \| null>` | — | Escape hatch to the underlying Tiptap instance. |
| `pageTitle` | `string` | — | Included as context in AI Assist prompts. |
| `placeholder` | `string` | — | Empty-document placeholder. |

`onChange`'s `meta.source` is `"manual"` for user typing and `"conversation"` for
programmatic edits — useful for skipping autosave on non-user changes.

### Toolbars

| Export | Behaviour |
| --- | --- |
| `<FixedToolbar showAiAssist? className? />` | Persistent bar. Pass via the `toolbar` prop. Undo/redo, block type (paragraph, H1–H4), lists (bullet/numbered/task), bold/italic/underline/strike/code, blockquote, code block, horizontal rule, link, table, image, slash trigger, AI Assist. |
| `<SelectionToolbar />` | Floats over selected text on desktop. Rendered automatically. |
| `<MobileToolbar />` | Docks to the bottom under 480px. Rendered automatically. |

Only `FixedToolbar` needs mounting; the other two are already wired in.

### `<ToC />`

```tsx
const [items, setItems] = useState([]);
const editorRef = useRef(null);

<RichTextEditor editorRef={editorRef} onTocItemsChange={setItems} {...rest} />
<ToC items={items} editor={editorRef.current} trackScroll />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `TableOfContentDataItem[]` | `[]` | From `onTocItemsChange`. |
| `editor` | `Editor \| null` | — | From `editorRef`. Needed to scroll to headings. |
| `trackScroll` | `boolean` | `true` | Highlight the heading currently in view. |

### `imageUploadHandler`

Called for images dropped, pasted, or picked via the toolbar. Return the URL to
embed; throwing marks the upload failed in the UI.

```ts
import type { EditorImageUploadHandler } from "kinkin-editor";

const imageUploadHandler: EditorImageUploadHandler = {
  upload: async (file: File, onProgress: (percent: number) => void) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");

    onProgress(100);
    return (await res.json()).url;
  },
};
```

### `streamCompletion`

Powers AI Assist. The library builds the prompt from the user's chosen action
(`improve`, `continue`, `summarize`, `fix-grammar`, `simplify`, `shorten`,
`extend`, `translate`, `tone`, `custom`) plus surrounding context. You own the
transport: call `onChunk` per token, `onComplete` when done, `onError` on
failure, and respect `signal` so the stop button works.

```ts
import type { StreamCompletionFn } from "kinkin-editor";

const streamCompletion: StreamCompletionFn = async ({
  message,
  signal,
  onChunk,
  onComplete,
  onError,
}) => {
  try {
    const res = await fetch("/api/llm", {
      method: "POST",
      body: JSON.stringify({ prompt: message }),
      signal,
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }

    onComplete();
  } catch (e) {
    if (!signal?.aborted) onError(e instanceof Error ? e.message : "Failed");
  }
};
```

Omit it and the AI buttons become no-ops, with a console warning.

### Other exports

| Export | Purpose |
| --- | --- |
| `useAiAssistStream(editor, options)` | The hook behind AI Assist, if you're composing your own editor. |
| `getEditorPortalRoot()` | The scoped container portalled UI renders into. |
| `EDITOR_SCOPE_CLASS` | `"kinkin-editor"` — the scope class, for tagging your own portals. |
| Types | `RichTextEditorProps`, `EditorImageUploadHandler`, `StreamCompletionFn`, `StreamCompletionParams` |

---

## Recipes

**Autosave, skipping programmatic edits**

```tsx
<RichTextEditor
  onChange={(value, meta) => {
    if (meta?.source === "manual") debouncedSave(value as string);
  }}
  {...rest}
/>
```

**Read-only preview**

```tsx
<RichTextEditor initialContent={doc} editable={false} contentType="markdown" />
```

**Reach the Tiptap instance**

```tsx
const editorRef = useRef(null);
<RichTextEditor editorRef={editorRef} {...rest} />;
// later: editorRef.current?.commands.focus()
```

**HTML instead of markdown**

```tsx
<RichTextEditor contentType="html" outputContentType="html" {...rest} />
```

---

## What the editor can do

**Slash menu** (type `/`): Paragraph, Heading 1–4, Bullet list, Numbered list,
Task list, Quote, Code, Emoji, Table, Image, Horizontal line.

**Also built in**

- Markdown paste — paste markdown and it converts to rich content
- Emoji picker on `:`
- Drag handle on each block to reorder; `Mod-Shift-↑/↓` to move, `Mod-Shift-D` to duplicate
- Tables with column/row controls and drag-to-reorder
- Link editing, code blocks, task lists, highlights, typography substitutions
- Table of contents via `onTocItemsChange`

---

## Troubleshooting

**The editor renders unstyled.** You didn't `import "kinkin-editor/style.css"`.

**The editor has zero height.** It fills its container. Give the parent an
explicit height, or `min-height: 0` if it's a flex child.

**`Cannot find module 'kinkin-editor'` after a GitHub install.** The `prepare`
build failed — check the install log. It needs devDependencies, so `--omit=dev`
or `--ignore-scripts` will break it.

**Duplicate `@tiptap/core`, or `getPreviousBlockSibling is not exported`.** More
than one Tiptap version in your tree. Tiptap's own transitive `^3.22.4` ranges
can resolve to a newer minor and pull in a second copy of `@tiptap/core`. Pin the
scope in your app's `package.json`:

```json
{
  "overrides": {
    "@tiptap/core": "3.22.4",
    "@tiptap/pm": "3.22.4"
  }
}
```

(Yarn calls this `resolutions`.) Move the whole scope together when upgrading —
mixed Tiptap minors fail at build time, not runtime.

**Menus or tooltips appear unstyled.** Something is rendering them outside the
scoped container. Portal them into `getEditorPortalRoot()`.

**My app's styles changed after adding the editor.** They shouldn't — that's what
the scoping prevents. If it happens, it's a bug worth reporting.

---

## Licence

Published as `UNLICENSED`. The package installs and works, but no redistribution
rights are granted. If you need different terms, ask the maintainers.

---

## Local development

```bash
git clone https://github.com/blakaalab/kinkin-editor.git
cd kinkin-editor
npm install

npm run dev               # playground with HMR
npm run build             # library → dist/
npm run build:playground  # demo app → dist-playground/
npm run type-check
npm run check             # Biome lint + format
npm run check:fix
```

`src/app.tsx` is the playground. It has demo implementations of
`imageUploadHandler` (a local data-URL "upload") and `streamCompletion` (a fake
token stream) — reference only, not for shipping.

### Layout

```
src/
├── index.ts                     # library entry (public API)
├── lib.css                      # published stylesheet (no preflight, scoped)
├── editor/
│   ├── rich-text-editor.tsx     # the main component
│   ├── fixed-toolbar.tsx        # persistent toolbar
│   ├── selection-toolbar.tsx    # floating toolbar (desktop)
│   ├── mobile-toolbar.tsx       # bottom toolbar (mobile)
│   ├── toc.tsx                  # table of contents
│   ├── portal-root.ts           # scoped container for portalled UI
│   ├── use-ai-assist-stream.ts  # AI prompt building + streaming glue
│   └── tiptap-cores/            # the editor engine (89 files)
├── components/ui/               # shadcn primitives the engine uses
├── lib/utils.ts                 # cn()
├── styles/global.css            # playground-only styles
└── app.tsx                      # playground
```

`tiptap-cores` is the bulk of it: extensions, node views, slash commands, the
emoji picker, tables, drag handles, AI Assist UI, and markdown serialization.

### Conventions

- **Biome** for formatting, linting and import order. File names are kebab-case,
  enforced by `useFilenamingConvention`.
- `biome.json`'s `$schema` points into `node_modules` so editors resolve it
  offline — it only works after `npm install`.
- Two a11y rules are off (`useSemanticElements`, `noStaticElementInteractions`);
  both flag correct ARIA in the toolbar and menu primitives. A clean lint run is
  not evidence of full a11y coverage.
- `useExhaustiveDependencies` is a warning. The remaining ones are all in
  `tiptap-cores`; adding the missing deps changes when effects re-run, so they
  need testing rather than a blind fix. `ui/ai-chat-button/index.tsx` omits
  `editor.state.selection.from` and is the one worth investigating.

### Build notes

- The library build (`--mode lib`) externalises React and all `@tiptap/*`, then
  scopes the CSS with `postcss-prefix-selector`. Both live in `vite.config.ts`.
- The playground builds to `dist-playground/` specifically so it can't overwrite
  the `dist/` that gets published.
- This repo pins `@tiptap/*` to exactly 3.22.4 via `overrides` to keep one copy
  in its own tree. `overrides` are ignored when the package is installed
  elsewhere, which is why the troubleshooting note above exists.

### Stack

React 19, Vite 7, Tailwind 4, TypeScript 5.9, Tiptap 3.22.
