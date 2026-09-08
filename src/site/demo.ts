import type {
  EditorImageUploadHandler,
  StreamCompletionParams,
} from "@/editor";

/**
 * Demo wiring for the site only.
 *
 * `imageUploadHandler` and `streamCompletion` are the two callbacks a host app
 * supplies for real. These stand-ins keep the demo self-contained: no upload
 * endpoint, no LLM key.
 */

/** Reads the file locally instead of uploading it. Never ship this. */
export const demoImageUploadHandler: EditorImageUploadHandler = {
  upload: (file, onProgress) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
      reader.readAsDataURL(file);
    }),
};

/** Streams a canned sentence so AI Assist has something to show. */
export function demoStreamCompletion({
  onChunk,
  onComplete,
  signal,
}: StreamCompletionParams) {
  const words =
    "This is a placeholder AI Assist response — wire up streamCompletion to a real LLM to replace it.".split(
      " ",
    );
  let i = 0;

  const interval = setInterval(() => {
    if (signal?.aborted || i >= words.length) {
      clearInterval(interval);
      onComplete();
      return;
    }
    onChunk((i === 0 ? "" : " ") + words[i]);
    i++;
  }, 60);

  signal?.addEventListener("abort", () => clearInterval(interval));
}

export const PLAYGROUND_CONTENT = `# Kinkin Editor

A standalone rich text editor. Everything on this page is live — edit it. The
panel on the right is the markdown this document serialises to, updating as you
type.

## Try these

- Type \`/\` for the slash menu — paragraph, headings, lists, quote, code, emoji, table, image, horizontal line
- Select text to raise the floating toolbar, or use the toolbar above
- Type \`:\` to open the emoji picker
- Drag the handle to the left of any block to reorder it; \`Mod-Shift-↑/↓\` moves it, \`Mod-Shift-D\` duplicates it
- Paste markdown and it converts as it lands
- Type \`--\`, \`...\` or \`(c)\` and the typography substitutions fire as you type

## Headings

Heading levels 1 to 4 are available from the slash menu and from the block type
dropdown in the toolbar. They also feed the table of contents.

### Heading 3

#### Heading 4

## Inline formatting

**Bold**, *italic*, \`inline code\`, ~~strikethrough~~ and
[links](https://example.com). Underline is on the toolbar — select a few words
and try it, along with everything else on the selection toolbar.

## Lists

- Bullet lists
- Nest them with Tab
  - Second level
    - Third level

1. Numbered lists
2. Work the same way
   1. Including nested ones

- [ ] Task lists have working checkboxes
- [x] Checked items get struck through
  - [ ] And they nest as well

## Quotes

> Blockquotes look like this, and can hold more than one paragraph.
>
> Like this one.

## Code

\`\`\`ts
// Code blocks keep their language
const editor = useEditor({ extensions });
\`\`\`

## Tables

| Prop | Type | Default |
| --- | --- | --- |
| \`contentType\` | \`markdown\`, \`html\` or \`json\` | \`markdown\` |
| \`editable\` | \`boolean\` | \`true\` |
| \`toolbar\` | \`ReactNode\` | none |

Click into a table to get its row and column controls, and drag to reorder.

## Images

![A placeholder image](data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='440'%20height='150'%3E%3Crect%20width='440'%20height='150'%20rx='10'%20fill='%23eff6ff'/%3E%3Ccircle%20cx='86'%20cy='75'%20r='26'%20fill='%2352a4fb'/%3E%3Crect%20x='136'%20y='57'%20width='230'%20height='12'%20rx='6'%20fill='%23bfdbfe'/%3E%3Crect%20x='136'%20y='83'%20width='158'%20height='12'%20rx='6'%20fill='%23dbeafe'/%3E%3C/svg%3E)

Drop an image anywhere in the document, paste one from the clipboard, or add one
from the toolbar. The playground uploads to a local data URL; in your app you
supply \`imageUploadHandler\`.

## Emoji

Type \`:\` to search for one, or paste them straight in — 🎉 🚀 ✅ 📝

---

That line above is a horizontal rule.
`;

export const HERO_CONTENT = `## This editor is the product

It's live — type in it. Press \`/\` for the slash menu, or select this line to
raise the floating toolbar.

- Markdown in, markdown out — paste some and watch it convert
- Tables, images, emoji, task lists, code blocks
- Drag any block by the handle on its left

> Everything here is the same component you would install.

\`\`\`tsx
<RichTextEditor toolbar={<FixedToolbar />} />
\`\`\`
`;
