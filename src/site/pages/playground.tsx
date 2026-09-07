import type { ReactNode } from "react";
import { useEffect, useReducer, useRef, useState } from "react";

import type { TableOfContentDataItem } from "@tiptap/extension-table-of-contents";
import type { Editor } from "@tiptap/react";
import { PanelLeft, PanelRight, RotateCcw } from "lucide-react";

import { RichTextEditor, ToC } from "@/editor";
import { FixedToolbar } from "@/editor/fixed-toolbar";
import { cn } from "@/lib/utils";

import { CopyButton } from "../code-block";
import {
  demoImageUploadHandler,
  demoStreamCompletion,
  PLAYGROUND_CONTENT,
} from "../demo";

const FORMATS = ["markdown", "html", "json", "text"] as const;
type Format = (typeof FORMATS)[number];

function serialize(editor: Editor | null, format: Format): string {
  if (!editor) return "";

  switch (format) {
    case "html":
      return editor.getHTML();
    case "json":
      return JSON.stringify(editor.getJSON(), null, 2);
    case "text":
      return editor.getText();
    default:
      return editor.getMarkdown();
  }
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 select-none">
      <span className="relative inline-flex">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="block h-5 w-9 rounded-full bg-gray-300 transition peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2" />
        <span className="pointer-events-none absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
      {label}
    </label>
  );
}

function IconToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-8 cursor-pointer place-items-center rounded-lg border transition",
        active
          ? "border-gray-300 bg-gray-200 text-gray-800"
          : "border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-700",
      )}
    >
      {children}
    </button>
  );
}

export function PlaygroundPage() {
  const editorRef = useRef<Editor | null>(null);

  const [editable, setEditable] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  const [format, setFormat] = useState<Format>("markdown");
  const [tocItems, setTocItems] = useState<TableOfContentDataItem[]>([]);
  // Remounting the editor is how `initialContent` gets re-applied.
  const [resetKey, setResetKey] = useState(0);
  // The editor reaches us through a ref, so its arrival renders nothing on its
  // own. This is the nudge that lets the output pane and the ToC read it.
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  useEffect(rerender, []);

  const handleReset = () => {
    setResetKey((k) => k + 1);
    // The remounted editor lands in the ref during its own mount effect, which
    // runs after this render — so re-read it on the next frame.
    requestAnimationFrame(rerender);
  };

  const output = serialize(editorRef.current, format);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-gray-300 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <h1 className="mt-0 mb-0 text-sm font-semibold text-gray-800">
            Playground
          </h1>
          <span className="hidden text-xs text-gray-500 sm:inline">
            Every control here is a prop on{" "}
            <code>&lt;RichTextEditor /&gt;</code>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Toggle checked={editable} onChange={setEditable} label="Editable" />

          <label className="flex items-center gap-2 text-sm text-gray-600">
            Output
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as Format)}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1">
            <IconToggle
              active={showToc}
              onClick={() => setShowToc((v) => !v)}
              label="Toggle table of contents"
            >
              <PanelLeft className="size-4" />
            </IconToggle>
            <IconToggle
              active={showOutput}
              onClick={() => setShowOutput((v) => !v)}
              label="Toggle output pane"
            >
              <PanelRight className="size-4" />
            </IconToggle>
            <button
              type="button"
              onClick={handleReset}
              className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:text-gray-800"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {showToc && (
          <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-300 bg-white lg:flex">
            <div className="border-b border-gray-300 px-4 py-2.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Contents
            </div>
            <div className="p-3">
              <ToC
                items={tocItems}
                editor={editorRef.current}
                trackScroll={false}
              />
            </div>
          </aside>
        )}

        <main className="flex min-w-0 flex-1 flex-col bg-white">
          <RichTextEditor
            key={resetKey}
            editorRef={editorRef}
            initialContent={PLAYGROUND_CONTENT}
            contentType="markdown"
            outputContentType="markdown"
            onChange={rerender}
            onTocItemsChange={setTocItems}
            editable={editable}
            aiMode="assist"
            pageTitle="Kinkin Editor playground"
            placeholder="Type / for commands…"
            imageUploadHandler={demoImageUploadHandler}
            streamCompletion={demoStreamCompletion}
            toolbar={<FixedToolbar showAiAssist />}
          />
        </main>

        {showOutput && (
          <aside className="hidden w-[400px] shrink-0 flex-col border-l border-gray-300 bg-gray-100 md:flex">
            <div className="flex items-center justify-between border-b border-gray-300 px-3 py-1.5">
              <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {format} output
              </span>
              <CopyButton
                text={output}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              />
            </div>
            <pre className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-700">
              {output}
            </pre>
          </aside>
        )}
      </div>
    </div>
  );
}
