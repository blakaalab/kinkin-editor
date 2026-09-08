<p align="center">
  <img src="assets/banner.svg" alt="Kinkin Editor - a drop-in rich text editor for React, built on Tiptap and ProseMirror" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@blakaa/kinkin-editor"><img src="https://img.shields.io/npm/v/@blakaa/kinkin-editor?color=green" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/react-18%20%7C%2019-149eca.svg" alt="React 18 and 19"></a>
  <a href="https://tiptap.dev"><img src="https://img.shields.io/badge/tiptap-3.31-000000.svg" alt="Tiptap 3.31"></a>
  <a href="#api-reference"><img src="https://img.shields.io/badge/types-included-3178c6.svg" alt="TypeScript types included"></a>
</p>

<p align="center">
  <strong>Languages:</strong>
  English ·
  <a href="docs/README.vi.md">Tiếng Việt</a> ·
  <a href="docs/README.zh-CN.md">简体中文</a> ·
  <a href="docs/README.ja.md">日本語</a> ·
  <a href="docs/README.ko.md">한국어</a> ·
  <a href="docs/README.es.md">Español</a> ·
  <a href="docs/README.pt-BR.md">Português (Brasil)</a> ·
  <a href="docs/README.fr.md">Français</a> ·
  <a href="docs/README.de.md">Deutsch</a>
</p>

# Kinkin Editor

**A drop-in rich text editor for React.** A Notion-style WYSIWYG built on
[Tiptap](https://tiptap.dev) and ProseMirror: markdown in, markdown out (or
HTML/JSON), with slash commands, tables, images, emoji, drag-to-reorder blocks, a
table of contents, and an AI Assist panel that streams from whatever LLM you
point it at.

```bash
npm install @blakaa/kinkin-editor
```

It's designed to go into a React app you already have: no global CSS reset, no
required Tailwind setup, no provider to mount, and no backend assumptions — image
upload and AI are plain callbacks you supply, or leave out.

**[Live demo and playground →](https://blakaalab.github.io/kinkin-editor/)** ·
[Setup guide](https://blakaalab.github.io/kinkin-editor/#/docs) ·
[Releases](https://github.com/blakaalab/kinkin-editor/releases)

- [Features](#features)
- [Install](#install)
- [Quick start](#quick-start)
- [Using it with your own Tailwind CSS](#using-it-with-your-own-tailwind-css)
- [Theming](#theming)
- [API reference](#api-reference)
- [Recipes](#recipes)
- [Troubleshooting](#troubleshooting)
- [Licence](#licence)
- [Local development](#local-development)

---

## Features

**Slash menu** (type `/`): Paragraph, Heading 1–4, Bullet list, Numbered list,
Task list, Quote, Code, Emoji, Table, Image, Columns (2–4), Horizontal line.

**Also built in**

- Markdown in and markdown out — and paste markdown to convert it to rich content
- Emoji picker on `:`
- Drag handle on each block to reorder; `Mod-Shift-↑/↓` to move, `Mod-Shift-D` to duplicate
- Tables with column/row controls and drag-to-reorder
- Columns — 2 to 4 side by side, holding any block, stacking on narrow screens
- Link editing, code blocks, task lists, highlights, typography substitutions
- Text alignment, text colour and highlight colour, from the toolbar or the
  selection toolbar
- Image upload through a callback you supply
- Streaming AI Assist — improve, continue, summarize, fix grammar, simplify,
  shorten, extend, translate, change tone, or a custom prompt
- Table of contents via `onTocItemsChange`
- Render saved documents without the editor — a schema-only extension list
  and a display-only stylesheet, both published separately
- Fixed, floating-selection and mobile toolbars
- TypeScript types included; React 18 and 19

---

## Install

```bash
npm install @blakaa/kinkin-editor    # or: pnpm add @blakaa/kinkin-editor
```

That's the whole command on npm 7+ and pnpm: both read `peerDependencies` and
install React and all 21 `@tiptap/*` packages for you — you don't list them.

### Yarn

Yarn does **not** auto-install peer dependencies — neither Classic nor Berry. You
need them explicitly (brace expansion keeps it to two lines):

```bash
yarn add @blakaa/kinkin-editor
yarn add react react-dom \
  @tiptap/{core,react,pm,starter-kit,extensions,markdown,suggestion,extension-emoji,extension-highlight,extension-history,extension-horizontal-rule,extension-image,extension-list,extension-mention,extension-strike,extension-table,extension-table-of-contents,extension-text-align,extension-text-style,extension-typography,extension-unique-id,extension-drag-handle-react}
```

### Why peer dependencies at all

React and ProseMirror must be **single instances**. Two copies of React gives you
"Invalid hook call"; two copies of ProseMirror gives you `RangeError: Invalid
content` and plugin-key collisions, because `prosemirror-model` relies on
`instanceof` checks and a shared schema registry. Declaring them as peers is what
makes package managers dedupe to one copy.

Every `@tiptap/*` peer is pinned to `~3.31.3` — the version this library is built
and tested against. Mixed Tiptap minors fail at build time, so the range stays
deliberately narrow and moves as a whole on each verified Tiptap upgrade.

---

## Quick start

```tsx
import { useState } from "react";
import { FixedToolbar, RichTextEditor } from "@blakaa/kinkin-editor";
import "@blakaa/kinkin-editor/style.css";

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

1. **Import the stylesheet.** `import "@blakaa/kinkin-editor/style.css"` once, anywhere
   in your app. Without it the editor renders unstyled.
2. **Give it a height.** The editor fills its container (`height: 100%`). In a
   container with no height it collapses to nothing. Use a parent with an
   explicit height, or `min-height: 0` if it's a flex child.

The toolbar is optional — omit `toolbar` for a chromeless editor, still driven by
slash commands and the selection toolbar.

---

## Using it with your own Tailwind CSS

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

A colour an author picks from the text-colour or highlight menu is **not** part
of the theme: it is written into the document itself (`<span style="color: …">`),
so it renders the same everywhere and does not follow a consumer into a dark
theme. Theme tokens style the chrome and the content the author did not colour.

Editor *content* styling (code blocks, tables, task lists, blockquotes) uses a
separate `--tt-core-*` namespace, overridable the same way:

```css
.kinkin-editor {
  --tt-core-code-bg: #f5f5f5;
  --tt-core-table-header-bg: #fafafa;
  --tt-core-link: #2563eb;
  --tt-core-selection: #dbeafe;
  --tt-core-selection-text: #1f2937;  /* selected text; defaults to --color-foreground */
}
```

---

## Rendering saved content without the editor

A saved document is Tiptap JSON, and rendering it on a public page needs two
things the editor bundle is the wrong place to get: the schema, and the content
CSS. Both ship separately.

```tsx
// A server component. No React editor, no editor stylesheet, no browser APIs.
import { generateHTML } from "@tiptap/core";
import { CONTENT_SCOPE_CLASS, createContentExtensions } from "@blakaa/kinkin-editor/content";
import "@blakaa/kinkin-editor/content.css";

export function Post({ doc }: { doc: JSONContent }) {
  const html = generateHTML(doc, createContentExtensions());

  return (
    <article
      className={CONTENT_SCOPE_CLASS}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

### `createContentExtensions()`

Every extension that shapes the document — nodes, marks, and the attributes on
them — and nothing that only exists to make editing work. `<RichTextEditor />`
builds its own list on top of this one, attaching node views and commands by
name, so the two cannot drift: a node added for the editor is a node this list
already renders.

It is the list to pass to `generateHTML`, `generateJSON` or `getSchema`.
Hand-mirroring the editor's extensions is the thing to avoid — a document
containing a node your list doesn't know throws
`RangeError: Unknown node type`, and it throws for readers, in production, on
whichever post happened to use the new node.

Three entries look surprising and are all load-bearing:

| Entry | Why it's here |
| --- | --- |
| `ContentTable` | Emits `.table-node-wrapper > .table-scroll-container` around the table, matching what the node view builds while editing. Without it a wide table overflows the page and none of the table CSS applies. |
| `ImageUploadNode` | The placeholder for an upload that never finished. Rare in saved content, and hidden on the page by `content.css`, but a document containing one still has to parse. |
| `TableOfContents` | Owns the `id` and `data-toc-id` attributes on headings. Leave it out and every heading loses its anchor, breaking in-page links and any table of contents you render alongside. |

`generateHTML` serializes through the DOM, so on a server it needs one —
install `jsdom` or `happy-dom` and set `globalThis.document` before calling it.
That is a Tiptap requirement, not a kinkin one. (With jsdom you'll see one
`HTMLCanvasElement's getContext() method` warning: it comes from the emoji
extension's support probe, which correctly falls back to image emoji.)

### `content.css`

The display half. Content rules only — no toolbars, menus, selection or drag
affordances, no Tailwind utilities, no `@theme` block and no reset — and every
rule comes from the same source as the editor's, so a rendered page and the
editor cannot look different.

Three properties worth knowing:

**It is scoped to one opt-in class.** Nothing is styled until you put
`kinkin-content` (exported as `CONTENT_SCOPE_CLASS`) on the element. Font size,
family and text colour are inherited, never set — every measurement is in `em`,
so the content scales with whatever your page gives it.

**It sits in a cascade layer.** Everything is inside `@layer kinkin-content`.
Unlayered CSS beats a layer regardless of specificity, so your own rules win
without `!important` or specificity games:

```css
/* No layer, so this wins over content.css — the selector doesn't have to be
   more specific than the one it's overriding. */
.kinkin-content h1 { font-size: 2.5rem; }
```

**Every colour is a `--tt-core-*` variable, and the sheet declares none of
them.** Each is a `var()` with its default as the fallback, so setting a token
anywhere above the content element themes it — including a dark mode:

```css
html.dark {
  --tt-core-code-bg: #232733;
  --tt-core-code-text: #e6e8ec;
  --tt-core-codeblock-bg: #1b1f27;
  --tt-core-blockquote: #5b6472;
  --tt-core-link: #7ebcfd;
  --tt-core-horizontal-line: #2b303a;
  --tt-core-table-border: #2b303a;
  --tt-core-table-header-bg: #1b1f27;
  --tt-core-table-stripe-bg: #191c23;
  --tt-core-tasklist-bg: #232733;
  --tt-core-tasklist-border: #5b6472;
}
```

(This is why the sheet declares no defaults on `.kinkin-content` itself: an
inherited custom property is resolved by proximity, not specificity, so a
declaration on the content element would silently beat one on `html.dark`.)

Two display-only decisions: task-list checkboxes are rendered but not
clickable — a page has nowhere to save the click — and the `imageUpload`
placeholder is hidden.

One constraint: the scope element is `white-space: pre-wrap`, matching the
editor, so runs of spaces the author typed survive. Don't pretty-print or
indent the generated HTML inside it — that indentation would render.

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
| `<FixedToolbar showAiAssist? className? />` | Persistent bar. Pass via the `toolbar` prop. Undo/redo, block type (paragraph, H1–H4), lists (bullet/numbered/task), bold/italic/underline/strike/code, text colour, highlight, alignment, blockquote, code block, horizontal rule, link, table, image, columns, slash trigger, AI Assist. |
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
| `trackScroll` | `boolean` | `true` | Highlight the heading currently in view. It listens on *window* scroll, so turn it off if the editor sits in a scroll container of your own. |

### `imageUploadHandler` — image uploads

Called for images dropped, pasted, or picked via the toolbar. Return the URL to
embed; throwing marks the upload failed in the UI.

```ts
import type { EditorImageUploadHandler } from "@blakaa/kinkin-editor";

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

### `streamCompletion` — streaming AI Assist

Powers AI Assist. The library builds the prompt from the user's chosen action
(`improve`, `continue`, `summarize`, `fix-grammar`, `simplify`, `shorten`,
`extend`, `translate`, `tone`, `custom`) plus surrounding context. You own the
transport: call `onChunk` per token, `onComplete` when done, `onError` on
failure, and respect `signal` so the stop button works.

```ts
import type { StreamCompletionFn } from "@blakaa/kinkin-editor";

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
| `createContentExtensions()` | The schema-only extension list, for rendering saved documents. Also at `@blakaa/kinkin-editor/content`. |
| `CONTENT_SCOPE_CLASS` | `"kinkin-content"` — the class `content.css` scopes to. |
| `<ToCItem />`, `<ToCEmptyState />` | The pieces `<ToC />` is built from, if you want your own outline layout. |
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

## Troubleshooting

### The editor renders unstyled

You didn't `import "@blakaa/kinkin-editor/style.css"`.

### The editor has zero height

It fills its container. Give the parent an explicit height, or `min-height: 0` if
it's a flex child.

### Duplicate `@tiptap/core`, or `getPreviousBlockSibling is not exported`

More than one Tiptap version in your tree. Tiptap's own transitive `^3.31.3` ranges
can resolve to a newer minor and pull in a second copy of `@tiptap/core`. Pin the
scope in your app's `package.json`:

```json
{
  "overrides": {
    "@tiptap/core": "3.31.3",
    "@tiptap/pm": "3.31.3"
  }
}
```

(Yarn calls this `resolutions`.) Move the whole scope together when upgrading —
mixed Tiptap minors fail at build time, not runtime.

### Menus or tooltips appear unstyled

Something is rendering them outside the scoped container. Portal them into
`getEditorPortalRoot()`.

### My app's styles changed after adding the editor

They shouldn't — that's what the scoping prevents. If it happens, it's a bug
worth reporting.

### `RangeError: Unknown node type` when rendering saved JSON

The extension list you passed to `generateHTML` doesn't cover the document.
Pass `createContentExtensions()` from `@blakaa/kinkin-editor/content` rather
than a hand-written list — it is the same schema the editor runs, so it stays
correct as the editor gains nodes. See
[Rendering saved content without the editor](#rendering-saved-content-without-the-editor).

### Rendered content is unstyled, or tables overflow the page

Import `@blakaa/kinkin-editor/content.css` and put `kinkin-content` on the
element the HTML goes into — nothing in that sheet applies without the class.
If tables specifically overflow, the HTML was generated with a plain `Table`
extension instead of the one in `createContentExtensions()`, which emits the
scroll container the CSS needs.

---

## Licence

[MIT](LICENSE). Use it, fork it, ship it commercially — just keep the copyright
notice.

---

## Local development

```bash
git clone https://github.com/blakaalab/kinkin-editor.git
cd kinkin-editor
npm install

npm run dev               # marketing site + docs + playground, with HMR
npm run build             # library → dist/
npm run build:playground  # the site → dist-playground/
npm run type-check
npm run check             # Biome lint + format
npm run check:fix
```

`src/site/` is the public site — a landing page (`/`), a playground
(`#/playground`) and the setup guide (`#/docs`), on a dependency-free hash
router so it deploys to any static host without rewrite rules. Its demo
`imageUploadHandler` (a local data-URL "upload") and `streamCompletion` (a fake
token stream) live in `src/site/demo.ts` — reference only, not for shipping.

### Layout

```
src/
├── index.ts                     # library entry (public API)
├── content.ts                   # entry for rendering saved documents
├── lib.css                      # published stylesheet (no preflight, scoped)
├── editor/
│   ├── rich-text-editor.tsx     # the main component
│   ├── content-extensions.ts    # the shared schema — both lists come from it
│   ├── content-scope.ts         # the content.css scope class
│   ├── fixed-toolbar.tsx        # persistent toolbar
│   ├── selection-toolbar.tsx    # floating toolbar (desktop)
│   ├── mobile-toolbar.tsx       # bottom toolbar (mobile)
│   ├── toc.tsx                  # table of contents
│   ├── portal-root.ts           # scoped container for portalled UI
│   ├── use-ai-assist-stream.ts  # AI prompt building + streaming glue
│   └── tiptap-cores/            # the editor engine (93 files)
├── components/ui/               # shadcn primitives the engine uses
├── lib/utils.ts                 # cn()
├── styles/global.css            # site-only styles (has preflight)
├── site/                        # the public site (not published)
│   ├── router.tsx               # hash router, no dependencies
│   ├── layout.tsx               # header, footer, page shell
│   ├── code-block.tsx           # snippet rendering + copy button
│   ├── logo-mark.tsx            # the K mark, traced to SVG paths
│   ├── doc-parts.tsx            # docs primitives (tables, tabs, callouts)
│   ├── demo.ts                  # demo upload/AI callbacks + sample content
│   ├── magicui/                 # vendored MagicUI components (site-only)
│   └── pages/                   # home.tsx, playground.tsx, docs.tsx
└── app.tsx                      # route switch

scripts/build-content-css.mjs    # compiles dist/content.css (see Build notes)
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
  It has two entries: `index.ts`, and `content.ts` for rendering saved documents
  without the editor. What they share lands in a chunk both import.
- `dist/content.css` is built by `scripts/build-content-css.mjs` rather than by
  Vite, because the library build runs every stylesheet through
  `postcss-prefix-selector` — which would nest the display rules under
  `.kinkin-editor`, the one thing that sheet must not be. It has no Tailwind in
  it, so Sass is the whole toolchain. It runs after `vite build`, which empties
  `dist/`.
- The content rules live in `@mixin content` blocks in the node stylesheets, so
  `styles/index.scss` (the editor) and `styles/content.scss` (the page) include
  the same rules rather than keeping two copies. `styles/_tokens.scss` holds
  every `--tt-core-*` default: the editor sheet declares them on the scope
  element, the display sheet inlines them as `var()` fallbacks so any ancestor
  can theme it.
- `lib.css` ends its `@source "./"` with `@source not "./site"`. Without it
  Tailwind scans the site too and every site-only utility lands in the published
  stylesheet — that alone was 31 kB of the 82 kB it used to be.
- The landing page uses a few [MagicUI](https://magicui.design) components,
  vendored into `src/site/magicui/` the way the project intends (copy-in, MIT).
  Their keyframes live in `styles/global.css`, never in `lib.css`. `motion` is a
  devDependency for the same reason: the site uses it, the package doesn't.
- Two of them (Marquee, ShimmerButton) do **not** use MagicUI's Tailwind-v4
  `--animate-*` theme variable, and must not. A custom property is substituted
  where it is *declared* — on `:root` — and those values reference a
  per-instance `--duration` / `--speed` that does not exist there, so the whole
  declaration computes to the guaranteed-invalid value and the animation never
  runs, silently. They carry `animate-[...]` arbitrary values instead, which put
  the shorthand on the element where those variables are in scope.
- The playground builds to `dist-playground/` specifically so it can't overwrite
  the `dist/` that gets published.
- `.github/workflows/deploy-pages.yml` publishes `dist-playground/` to GitHub
  Pages on every push to `main`. A project page is served from `/<repo>/`, so
  the site build sets `base: "/kinkin-editor/"` — only for `command === "build"`,
  which leaves `npm run dev` on `/`.
- This repo pins `@tiptap/*` to exactly 3.31.3 via `overrides` to keep one copy
  in its own tree. `overrides` are ignored when the package is installed
  elsewhere, which is why the troubleshooting note above exists.

### Stack

React 19, Vite 7, Tailwind 4, TypeScript 5.9, Tiptap 3.31. The site adds
`motion` and vendored MagicUI components — neither ships in the package.
