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

A standalone rich text editor. Everything below is live — edit it.

## Try these

- Type \`/\` for the slash command menu (tables, images, code blocks, emoji)
- Select text to get the floating toolbar, or use the toolbar above
- Type \`:\` to open the emoji picker
- Drag the handle on the left of any block to reorder it
- Paste markdown and it converts automatically

## Formatting

**Bold**, *italic*, ~~strikethrough~~, \`inline code\`, and [links](https://example.com).

> Blockquotes look like this.

1. Numbered lists
2. Work as expected

- [ ] So do task lists
- [x] Including checked items

\`\`\`ts
// Code blocks with syntax highlighting
const editor = useEditor({ extensions });
\`\`\`
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
