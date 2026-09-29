import { common, createLowlight } from "lowlight";

/**
 * The one lowlight instance, with highlight.js's `common` set (~35 languages).
 * The editor's decorations and `highlightCodeBlocks` both read it, so a block
 * is coloured the same while editing and on the page.
 */
export const lowlight: ReturnType<typeof createLowlight> =
  createLowlight(common);

/**
 * What the language picker offers. An empty value is no `language` attribute:
 * the block is auto-detected. `plaintext` opts out of colouring altogether.
 */
export const CODE_BLOCK_LANGUAGES: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: "", label: "Auto-detect" },
  { value: "plaintext", label: "Plain text" },
  { value: "bash", label: "Bash" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "css", label: "CSS" },
  { value: "diff", label: "Diff" },
  { value: "go", label: "Go" },
  { value: "graphql", label: "GraphQL" },
  { value: "html", label: "HTML" },
  { value: "ini", label: "INI / TOML" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "kotlin", label: "Kotlin" },
  { value: "less", label: "Less" },
  { value: "lua", label: "Lua" },
  { value: "makefile", label: "Makefile" },
  { value: "markdown", label: "Markdown" },
  { value: "objectivec", label: "Objective-C" },
  { value: "perl", label: "Perl" },
  { value: "php", label: "PHP" },
  { value: "python", label: "Python" },
  { value: "r", label: "R" },
  { value: "ruby", label: "Ruby" },
  { value: "rust", label: "Rust" },
  { value: "scss", label: "SCSS" },
  { value: "sql", label: "SQL" },
  { value: "swift", label: "Swift" },
  { value: "typescript", label: "TypeScript" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
];

type Root = ReturnType<typeof lowlight.highlight>;
type HastNode = Root["children"][number];

/** Mirrors `@tiptap/extension-code-block-lowlight`: unknown or none → auto. */
const highlight = (code: string, language: string | null): Root =>
  language && lowlight.registered(language)
    ? lowlight.highlight(language, code)
    : lowlight.highlightAuto(code);

const toDom = (node: HastNode, doc: Document): Node => {
  if (node.type === "text") {
    return doc.createTextNode(node.value);
  }

  if (node.type !== "element") {
    return doc.createTextNode("");
  }

  const element = doc.createElement(node.tagName);
  const className = node.properties.className;

  if (Array.isArray(className)) {
    element.className = className.join(" ");
  }

  for (const child of node.children) {
    element.append(toDom(child, doc));
  }

  return element;
};

/**
 * Colours every `<pre><code>` under `root`, in place.
 *
 * The editor highlights with decorations, which never reach `getHTML()` or
 * `generateHTML()` — a saved document holds plain code. Run this on the element
 * the document is rendered into (after it is in the DOM, or on a jsdom /
 * happy-dom tree on the server) and `content.css` colours the result.
 *
 *   container.innerHTML = generateHTML(doc, createContentExtensions());
 *   highlightCodeBlocks(container);
 *
 * Safe to run more than once: each block is rebuilt from its text.
 */
export const highlightCodeBlocks = (root: ParentNode): void => {
  for (const code of root.querySelectorAll<HTMLElement>("pre > code")) {
    const language =
      [...code.classList]
        .find((className) => className.startsWith("language-"))
        ?.slice("language-".length) ?? null;
    const tree = highlight(code.textContent ?? "", language);

    code.replaceChildren(
      ...tree.children.map((child) => toDom(child, code.ownerDocument)),
    );
  }
};
