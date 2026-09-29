import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { lowlight } from "./code-block-highlight";
import { CodeBlockNodeView } from "./code-block-node-view";

/**
 * The shared code block, coloured by lowlight and drawn with a language
 * picker. Same `codeBlock` schema as `ContentCodeBlock` — the highlighting is
 * decorations only, so nothing it does reaches the saved document.
 */
export const EditorCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    // A `span`, not the default `div`: the text sits inside `<code>`.
    return ReactNodeViewRenderer(CodeBlockNodeView, {
      contentDOMElementTag: "span",
    });
  },
}).configure({ lowlight });
