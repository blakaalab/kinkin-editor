import { useEffect, useState } from "react";

import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { CodeBlock, CommandLine } from "../code-block";
import {
  Bullets,
  Callout,
  DocSection,
  DocSubHeading,
  P,
  PropTable,
  Tabs,
} from "../doc-parts";
import { PACKAGE_NAME, REPO_URL } from "../layout";
import { Link, ROUTES } from "../router";

const SECTIONS = [
  { id: "install", label: "Install" },
  { id: "quick-start", label: "Quick start" },
  { id: "tailwind", label: "Your own Tailwind" },
  { id: "theming", label: "Theming" },
  { id: "props", label: "RichTextEditor props" },
  { id: "toolbars", label: "Toolbars" },
  { id: "toc", label: "Table of contents" },
  { id: "images", label: "Image uploads" },
  { id: "ai", label: "AI Assist" },
  { id: "exports", label: "Other exports" },
  { id: "recipes", label: "Recipes" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "development", label: "Local development" },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);

function useActiveSection(): string {
  const [active, setActive] = useState(SECTION_IDS[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return active;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const QUICK_START = `import { useState } from "react";
import { FixedToolbar, RichTextEditor } from "${PACKAGE_NAME}";
import "${PACKAGE_NAME}/style.css";

export function Editor() {
  const [markdown, setMarkdown] = useState("# Hello\\n\\nStart typing.");

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
}`;

const YARN_INSTALL = `yarn add ${PACKAGE_NAME}
yarn add react react-dom \\
  @tiptap/{core,react,pm,starter-kit,extensions,markdown,suggestion,\\
extension-emoji,extension-highlight,extension-history,\\
extension-horizontal-rule,extension-image,extension-list,\\
extension-mention,extension-strike,extension-table,\\
extension-table-of-contents,extension-text-style,extension-typography,\\
extension-unique-id,extension-drag-handle-react}`;

const THEME_TOKENS = `.kinkin-editor {
  --color-primary-700: #7c3aed;  /* accent: active buttons, focus rings */
  --color-foreground: #1f2937;   /* body text */
  --color-background: #ffffff;
  --color-border: #e5e7eb;
  --color-muted-foreground: #6b7280;
  --font-sans: "Inter", system-ui, sans-serif;
}`;

const CONTENT_TOKENS = `.kinkin-editor {
  --tt-core-code-bg: #f5f5f5;
  --tt-core-table-header-bg: #fafafa;
  --tt-core-link: #2563eb;
  --tt-core-selection: #dbeafe;
}`;

const TOC_SNIPPET = `const [items, setItems] = useState([]);
const editorRef = useRef(null);

<RichTextEditor editorRef={editorRef} onTocItemsChange={setItems} {...rest} />
<ToC items={items} editor={editorRef.current} trackScroll />`;

const IMAGE_SNIPPET = `import type { EditorImageUploadHandler } from "${PACKAGE_NAME}";

const imageUploadHandler: EditorImageUploadHandler = {
  upload: async (file: File, onProgress: (percent: number) => void) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");

    onProgress(100);
    return (await res.json()).url;
  },
};`;

const AI_SNIPPET = `import type { StreamCompletionFn } from "${PACKAGE_NAME}";

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
};`;

const OVERRIDES_SNIPPET = `{
  "overrides": {
    "@tiptap/core": "3.31.3",
    "@tiptap/pm": "3.31.3"
  }
}`;

const DEV_SNIPPET = `git clone ${REPO_URL}.git
cd kinkin-editor
npm install

npm run dev               # this site + playground, with HMR
npm run build             # library -> dist/
npm run build:playground  # this site -> dist-playground/
npm run type-check
npm run check             # Biome lint + format
npm run check:fix`;

const PROP_ROWS = [
  {
    name: "initialContent",
    type: "Content",
    description:
      "Starting content: a markdown/HTML string, or a Tiptap JSON doc. Changing it after mount replaces the content and clears undo history.",
  },
  {
    name: "contentType",
    type: '"markdown" | "html" | "json"',
    default: '"markdown"',
    description: "How to interpret initialContent.",
  },
  {
    name: "outputContentType",
    type: '"markdown" | "html" | "json" | "text"',
    default: '"markdown"',
    description: "What onChange emits.",
  },
  {
    name: "onChange",
    type: "(value, meta?) => void",
    description:
      "Fires on edit. value is a string, or JSONContent when output is json. Suppressed while AI is streaming.",
  },
  {
    name: "editable",
    type: "boolean",
    default: "true",
    description:
      "false renders read-only — toolbars hide, content stays selectable.",
  },
  {
    name: "toolbar",
    type: "ReactNode",
    description:
      "Rendered above the content, inside the editor context. Pass <FixedToolbar />.",
  },
  {
    name: "imageUploadHandler",
    type: "EditorImageUploadHandler",
    description: "Enables image upload. Omit to disable.",
  },
  {
    name: "streamCompletion",
    type: "StreamCompletionFn",
    description: "Enables AI Assist. Omit to disable.",
  },
  {
    name: "aiMode",
    type: '"assist" | "chat"',
    description: "Which AI button the selection toolbar shows.",
  },
  {
    name: "onAiChatRequest",
    type: "(message, selectedText) => void",
    description: 'Called by the chat button when aiMode="chat".',
  },
  {
    name: "onTocItemsChange",
    type: "(items) => void",
    description: "Fires when headings change. Feed into <ToC />.",
  },
  {
    name: "editorRef",
    type: "RefObject<Editor | null>",
    description: "Escape hatch to the underlying Tiptap instance.",
  },
  {
    name: "pageTitle",
    type: "string",
    description: "Included as context in AI Assist prompts.",
  },
  {
    name: "placeholder",
    type: "string",
    description: "Empty-document placeholder.",
  },
];

const TROUBLESHOOTING = [
  {
    problem: "The editor renders unstyled.",
    fix: (
      <>
        You didn't <code>import "{PACKAGE_NAME}/style.css"</code>.
      </>
    ),
  },
  {
    problem: "The editor has zero height.",
    fix: (
      <>
        It fills its container. Give the parent an explicit height, or{" "}
        <code>min-height: 0</code> if it's a flex child.
      </>
    ),
  },
  {
    problem: "Menus or tooltips appear unstyled.",
    fix: (
      <>
        Something is rendering them outside the scoped container. Portal them
        into <code>getEditorPortalRoot()</code>.
      </>
    ),
  },
  {
    problem: "My app's styles changed after adding the editor.",
    fix: "They shouldn't — that's what the scoping prevents. If it happens, it's a bug worth reporting.",
  },
];

export function DocsPage() {
  const active = useActiveSection();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-0.5">
            <div className="mb-3 px-3 text-xs font-semibold tracking-widest text-gray-500 uppercase">
              On this page
            </div>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "block w-full cursor-pointer rounded-lg px-3 py-1.5 text-left text-sm transition",
                  active === section.id
                    ? "bg-gray-200 font-medium text-gray-800"
                    : "text-gray-500 hover:bg-gray-200/70 hover:text-gray-700",
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 [&_:not(pre):not([data-command])>code]:rounded [&_:not(pre):not([data-command])>code]:bg-gray-200 [&_:not(pre):not([data-command])>code]:px-1.5 [&_:not(pre):not([data-command])>code]:py-0.5 [&_:not(pre):not([data-command])>code]:font-mono [&_:not(pre):not([data-command])>code]:text-[0.875em] [&_:not(pre):not([data-command])>code]:text-gray-800">
          <header className="pb-12">
            <div className="text-xs font-semibold tracking-widest text-blue-700 uppercase">
              Documentation
            </div>
            <h1 className="mt-3 mb-0 text-4xl font-semibold tracking-tight text-gray-800">
              Setup and usage
            </h1>
            <p className="mt-4 mb-0 text-lg text-gray-600">
              Everything needed to get <code>{PACKAGE_NAME}</code> running in a
              React app, and every prop it takes once it is.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={ROUTES.playground}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-gray-900"
              >
                Try it in the playground
                <ArrowRight className="size-4" />
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 no-underline transition hover:border-gray-400"
              >
                GitHub
              </a>
            </div>
          </header>

          <div className="space-y-12">
            <DocSection id="install" title="Install">
              <Tabs
                items={[
                  {
                    id: "npm",
                    label: "npm",
                    content: (
                      <>
                        <CommandLine command={`npm install ${PACKAGE_NAME}`} />
                        <P>
                          That's the whole command. npm 7+ reads{" "}
                          <code>peerDependencies</code> and installs React and
                          all 21 <code>@tiptap/*</code> packages automatically —
                          you don't list them.
                        </P>
                      </>
                    ),
                  },
                  {
                    id: "pnpm",
                    label: "pnpm",
                    content: (
                      <>
                        <CommandLine command={`pnpm add ${PACKAGE_NAME}`} />
                        <P>
                          Nothing special needed — pnpm auto-installs peer
                          dependencies by default.
                        </P>
                      </>
                    ),
                  },
                  {
                    id: "yarn",
                    label: "Yarn",
                    content: (
                      <>
                        <P>
                          Yarn does <strong>not</strong> auto-install peer
                          dependencies — neither Classic nor Berry. You need
                          them explicitly (brace expansion keeps it short):
                        </P>
                        <CodeBlock code={YARN_INSTALL} lang="bash" />
                      </>
                    ),
                  },
                ]}
              />

              <Callout title="Licence">
                Published as <code>UNLICENSED</code>. The package installs and
                works, but no redistribution rights are granted. If you need
                different terms, ask the maintainers.
              </Callout>

              <DocSubHeading>Why peer dependencies at all</DocSubHeading>
              <P>
                React and ProseMirror must be <strong>single instances</strong>.
                Two copies of React gives you "Invalid hook call"; two copies of
                ProseMirror gives you <code>RangeError: Invalid content</code>{" "}
                and plugin-key collisions, because{" "}
                <code>prosemirror-model</code> relies on <code>instanceof</code>{" "}
                checks and a shared schema registry. Declaring them as peers is
                what makes package managers dedupe to one copy.
              </P>
              <P>
                Every <code>@tiptap/*</code> peer is pinned to a narrow range —
                the version this library is built and tested against. Mixed
                Tiptap minors fail at build time, so the range is deliberately
                tight; it widens once a newer Tiptap is verified.
              </P>
            </DocSection>

            <DocSection id="quick-start" title="Quick start">
              <CodeBlock code={QUICK_START} lang="tsx" filename="editor.tsx" />

              <DocSubHeading>Two things that trip people up</DocSubHeading>
              <Bullets
                items={[
                  <>
                    <strong>Import the stylesheet.</strong>{" "}
                    <code>import "{PACKAGE_NAME}/style.css"</code> once,
                    anywhere in your app. Without it the editor renders
                    unstyled.
                  </>,
                  <>
                    <strong>Give it a height.</strong> The editor fills its
                    container (<code>height: 100%</code>). In a container with
                    no height it collapses to nothing. Use a parent with an
                    explicit height, or <code>min-height: 0</code> if it's a
                    flex child.
                  </>,
                ]}
              />
              <P>
                The toolbar is optional — omit <code>toolbar</code> for a
                chromeless editor, still driven by slash commands and the
                selection toolbar.
              </P>
            </DocSection>

            <DocSection id="tailwind" title="Using it with your own Tailwind">
              <P>
                <strong>
                  Short version: nothing to configure. It cannot collide with
                  your styles.
                </strong>{" "}
                Shipping Tailwind from a library normally causes three problems.
                All three are handled at build time.
              </P>

              <div className="overflow-x-auto rounded-xl border border-gray-300">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-gray-200/60 text-xs tracking-wide text-gray-600 uppercase">
                      <th className="px-4 py-2.5 font-semibold">Problem</th>
                      <th className="px-4 py-2.5 font-semibold">
                        How it's avoided
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-t border-gray-300 align-top">
                      <td className="px-4 py-3">
                        Utility collisions — the library's <code>.text-sm</code>{" "}
                        silently restyling <em>your</em> app
                      </td>
                      <td className="px-4 py-3">
                        Every rule is nested under <code>.kinkin-editor</code>,
                        so it only applies inside the editor
                      </td>
                    </tr>
                    <tr className="border-t border-gray-300 align-top">
                      <td className="px-4 py-3">
                        Token leakage — the library's <code>--color-*</code>{" "}
                        overriding your theme on <code>:root</code>
                      </td>
                      <td className="px-4 py-3">
                        <code>:root</code> is rewritten to{" "}
                        <code>.kinkin-editor</code>; nothing lands on the
                        document root
                      </td>
                    </tr>
                    <tr className="border-t border-gray-300 align-top">
                      <td className="px-4 py-3">
                        Duplicate preflight — two base resets fighting
                      </td>
                      <td className="px-4 py-3">
                        The stylesheet is built with{" "}
                        <strong>no preflight</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <P>
                You don't need Tailwind at all — what ships is plain compiled
                CSS. Portalled UI (menus, tooltips, drag previews, the mobile
                toolbar) would normally escape that scope by rendering into{" "}
                <code>document.body</code>; it's portalled into a container that
                also carries the class, exposed as{" "}
                <code>getEditorPortalRoot()</code>.
              </P>
            </DocSection>

            <DocSection id="theming" title="Theming">
              <P>
                Override the design tokens on the scope class — they cascade to
                everything inside:
              </P>
              <CodeBlock code={THEME_TOKENS} lang="css" />
              <P>
                Editor <em>content</em> styling (code blocks, tables, task
                lists, blockquotes) uses a separate <code>--tt-core-*</code>{" "}
                namespace, overridable the same way:
              </P>
              <CodeBlock code={CONTENT_TOKENS} lang="css" />
            </DocSection>

            <DocSection id="props" title="<RichTextEditor /> props">
              <PropTable rows={PROP_ROWS} />
              <P>
                <code>onChange</code>'s <code>meta.source</code> is{" "}
                <code>"manual"</code> for user typing and{" "}
                <code>"conversation"</code> for programmatic edits — useful for
                skipping autosave on non-user changes.
              </P>
            </DocSection>

            <DocSection id="toolbars" title="Toolbars">
              <PropTable
                rows={[
                  {
                    name: "<FixedToolbar />",
                    type: "showAiAssist?, className?",
                    description:
                      "Persistent bar. Pass via the toolbar prop. Undo/redo, block type (paragraph, H1–H4), lists, bold/italic/underline/strike/code, blockquote, code block, horizontal rule, link, table, image, slash trigger, AI Assist.",
                  },
                  {
                    name: "<SelectionToolbar />",
                    type: "—",
                    description:
                      "Floats over selected text on desktop. Rendered automatically.",
                  },
                  {
                    name: "<MobileToolbar />",
                    type: "—",
                    description:
                      "Docks to the bottom under 480px. Rendered automatically.",
                  },
                ]}
              />
              <P>
                Only <code>FixedToolbar</code> needs mounting; the other two are
                already wired in.
              </P>
            </DocSection>

            <DocSection id="toc" title="Table of contents">
              <CodeBlock code={TOC_SNIPPET} lang="tsx" />
              <PropTable
                rows={[
                  {
                    name: "items",
                    type: "TableOfContentDataItem[]",
                    default: "[]",
                    description: "From onTocItemsChange.",
                  },
                  {
                    name: "editor",
                    type: "Editor | null",
                    description:
                      "From editorRef. Needed to scroll to headings.",
                  },
                  {
                    name: "trackScroll",
                    type: "boolean",
                    default: "true",
                    description:
                      "Highlight the heading currently in view. Tracks window scroll, so turn it off inside a scroll container of your own.",
                  },
                ]}
              />
            </DocSection>

            <DocSection id="images" title="Image uploads">
              <P>
                Called for images dropped, pasted, or picked via the toolbar.
                Return the URL to embed; throwing marks the upload failed in the
                UI.
              </P>
              <CodeBlock code={IMAGE_SNIPPET} lang="ts" />
            </DocSection>

            <DocSection id="ai" title="AI Assist">
              <P>
                The library builds the prompt from the user's chosen action (
                <code>improve</code>, <code>continue</code>,{" "}
                <code>summarize</code>, <code>fix-grammar</code>,{" "}
                <code>simplify</code>, <code>shorten</code>, <code>extend</code>
                , <code>translate</code>, <code>tone</code>, <code>custom</code>
                ) plus surrounding context. You own the transport: call{" "}
                <code>onChunk</code> per token, <code>onComplete</code> when
                done, <code>onError</code> on failure, and respect{" "}
                <code>signal</code> so the stop button works.
              </P>
              <CodeBlock code={AI_SNIPPET} lang="ts" />
              <P>
                Omit it and the AI buttons become no-ops, with a console
                warning.
              </P>
            </DocSection>

            <DocSection id="exports" title="Other exports">
              <PropTable
                rows={[
                  {
                    name: "useAiAssistStream",
                    type: "(editor, options)",
                    description:
                      "The hook behind AI Assist, if you're composing your own editor.",
                  },
                  {
                    name: "getEditorPortalRoot",
                    type: "() => HTMLElement",
                    description:
                      "The scoped container portalled UI renders into.",
                  },
                  {
                    name: "EDITOR_SCOPE_CLASS",
                    type: "string",
                    default: '"kinkin-editor"',
                    description:
                      "The scope class, for tagging your own portals.",
                  },
                  {
                    name: "Types",
                    type: "RichTextEditorProps, …",
                    description:
                      "Plus EditorImageUploadHandler, StreamCompletionFn, StreamCompletionParams.",
                  },
                ]}
              />
            </DocSection>

            <DocSection id="recipes" title="Recipes">
              <DocSubHeading>
                Autosave, skipping programmatic edits
              </DocSubHeading>
              <CodeBlock
                lang="tsx"
                code={`<RichTextEditor
  onChange={(value, meta) => {
    if (meta?.source === "manual") debouncedSave(value as string);
  }}
  {...rest}
/>`}
              />

              <DocSubHeading>Read-only preview</DocSubHeading>
              <CodeBlock
                lang="tsx"
                code={`<RichTextEditor initialContent={doc} editable={false} contentType="markdown" />`}
              />

              <DocSubHeading>Reach the Tiptap instance</DocSubHeading>
              <CodeBlock
                lang="tsx"
                code={`const editorRef = useRef(null);
<RichTextEditor editorRef={editorRef} {...rest} />;
// later: editorRef.current?.commands.focus()`}
              />

              <DocSubHeading>HTML instead of markdown</DocSubHeading>
              <CodeBlock
                lang="tsx"
                code={`<RichTextEditor contentType="html" outputContentType="html" {...rest} />`}
              />
            </DocSection>

            <DocSection id="troubleshooting" title="Troubleshooting">
              <div className="divide-y divide-gray-300 overflow-hidden rounded-xl border border-gray-300 bg-white">
                {TROUBLESHOOTING.map((item) => (
                  <div key={item.problem} className="p-4">
                    <div className="text-[15px] font-semibold text-gray-800">
                      {item.problem}
                    </div>
                    <div className="mt-1 text-[15px] leading-relaxed text-gray-600">
                      {item.fix}
                    </div>
                  </div>
                ))}
              </div>

              <DocSubHeading>
                Duplicate @tiptap/core, or "getPreviousBlockSibling is not
                exported"
              </DocSubHeading>
              <P>
                More than one Tiptap version in your tree. Tiptap's own
                transitive ranges can resolve to a newer minor and pull in a
                second copy of <code>@tiptap/core</code>. Pin the scope in your
                app's <code>package.json</code>:
              </P>
              <CodeBlock code={OVERRIDES_SNIPPET} lang="json" />
              <P>
                (Yarn calls this <code>resolutions</code>.) Move the whole scope
                together when upgrading — mixed Tiptap minors fail at build
                time, not runtime.
              </P>
            </DocSection>

            <DocSection id="development" title="Local development">
              <CodeBlock code={DEV_SNIPPET} lang="bash" />
              <P>
                <code>src/site/</code> is this site: the landing page, the
                playground and these docs. Its demo{" "}
                <code>imageUploadHandler</code> (a local data-URL "upload") and{" "}
                <code>streamCompletion</code> (a fake token stream) live in{" "}
                <code>src/site/demo.ts</code> — reference only, not for
                shipping.
              </P>
              <P>
                The library build (<code>--mode lib</code>) externalises React
                and all <code>@tiptap/*</code>, then scopes the CSS with{" "}
                <code>postcss-prefix-selector</code>. The site builds to{" "}
                <code>dist-playground/</code> specifically so it can't overwrite
                the <code>dist/</code> that gets published.
              </P>
            </DocSection>
          </div>
        </div>
      </div>
    </div>
  );
}
