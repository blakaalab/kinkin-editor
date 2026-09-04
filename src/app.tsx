import { useState } from "react";

import type {
  EditorImageUploadHandler,
  StreamCompletionParams,
} from "./editor";
import { RichTextEditor } from "./editor";
import { FixedToolbar } from "./editor/fixed-toolbar";

// Demo-only: reads the file locally instead of uploading to a server.
// Host apps should replace this with a real upload (S3, etc.) returning a URL.
const demoImageUploadHandler: EditorImageUploadHandler = {
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

// Demo-only: streams a canned response so AI Assist has something to show.
// Host apps should replace this with a real LLM call.
function demoStreamCompletion({
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

const INITIAL_CONTENT = `# Kinkin Editor

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

export function App() {
  const [markdown, setMarkdown] = useState<string>(INITIAL_CONTENT);
  const [editable, setEditable] = useState(true);
  const [showOutput, setShowOutput] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <header className="flex shrink-0 items-center justify-between border-b border-gray-300 bg-white px-4 py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">Kinkin Editor</span>
          <span className="text-xs text-gray-500">playground</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={editable}
              onChange={(e) => setEditable(e.target.checked)}
            />
            Editable
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={showOutput}
              onChange={(e) => setShowOutput(e.target.checked)}
            />
            Show markdown output
          </label>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col bg-white">
          <RichTextEditor
            initialContent={INITIAL_CONTENT}
            contentType="markdown"
            outputContentType="markdown"
            onChange={(value) => setMarkdown(value as string)}
            editable={editable}
            aiMode="assist"
            imageUploadHandler={demoImageUploadHandler}
            streamCompletion={demoStreamCompletion}
            toolbar={<FixedToolbar showAiAssist />}
          />
        </main>

        {showOutput && (
          <aside className="flex w-[420px] shrink-0 flex-col border-l border-gray-300 bg-gray-50">
            <div className="border-b border-gray-300 px-3 py-2 text-xs font-semibold tracking-wide text-gray-600 uppercase">
              Markdown output
            </div>
            <pre className="flex-1 overflow-auto p-3 font-mono text-xs whitespace-pre-wrap text-gray-700">
              {markdown}
            </pre>
          </aside>
        )}
      </div>
    </div>
  );
}
