import {
  NodeViewContent,
  type NodeViewProps,
  NodeViewWrapper,
} from "@tiptap/react";

import { CODE_BLOCK_LANGUAGES } from "./code-block-highlight";

export const CodeBlockNodeView = ({
  node,
  updateAttributes,
  HTMLAttributes,
}: NodeViewProps) => {
  const language: string | null = node.attrs.language || null;
  // A language the picker does not list (`tsx`, `sh`, pasted markdown…) still
  // highlights if lowlight knows it, and must not read as "Auto-detect".
  const options =
    language &&
    !CODE_BLOCK_LANGUAGES.some((option) => option.value === language)
      ? [...CODE_BLOCK_LANGUAGES, { value: language, label: language }]
      : CODE_BLOCK_LANGUAGES;

  return (
    <NodeViewWrapper className="tiptap-core-code-block">
      <select
        contentEditable={false}
        className="tiptap-core-code-block-language"
        aria-label="Code language"
        value={language ?? ""}
        onChange={(e) => updateAttributes({ language: e.target.value || null })}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <pre {...HTMLAttributes}>
        <NodeViewContent<"code">
          as="code"
          className={language ? `language-${language}` : undefined}
          // NodeViewContent sets `white-space: pre-wrap` inline, which would
          // wrap long lines instead of letting the block scroll them.
          style={{ whiteSpace: "inherit" }}
        />
      </pre>
    </NodeViewWrapper>
  );
};
