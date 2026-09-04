import { canInsertNode, isNodeSelection } from "@tiptap/core";
import TiptapHorizontalRule from "@tiptap/extension-horizontal-rule";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { mergeAttributes } from "@tiptap/react";

export const HorizontalRule = TiptapHorizontalRule.extend({
  renderHTML() {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, { "data-type": this.name }),
      ["hr"],
    ];
  },

  addCommands() {
    return {
      setHorizontalRule:
        () =>
        ({ chain, state }) => {
          if (!canInsertNode(state, state.schema.nodes[this.name])) {
            return false;
          }

          const { selection } = state;
          const currentChain = chain();

          if (isNodeSelection(selection)) {
            currentChain.insertContentAt(selection.$to.pos, {
              type: this.name,
            });
          } else {
            const { $from } = selection;
            const parentNode = $from.parent;
            const isEmptyBlock =
              parentNode.isTextblock && parentNode.content.size === 0;

            if (isEmptyBlock) {
              currentChain.insertContent({ type: this.name });
            } else {
              const endOfBlock = $from.end();
              currentChain.insertContentAt(endOfBlock + 1, {
                type: this.name,
              });
            }
          }

          return currentChain
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                const { $to } = tr.selection;
                const posAfter = $to.end();

                if ($to.nodeAfter) {
                  if ($to.nodeAfter.isTextblock) {
                    tr.setSelection(TextSelection.create(tr.doc, $to.pos + 1));
                  } else if ($to.nodeAfter.isBlock) {
                    tr.setSelection(NodeSelection.create(tr.doc, $to.pos));
                  } else {
                    tr.setSelection(TextSelection.create(tr.doc, $to.pos));
                  }
                } else {
                  const nodeType =
                    state.schema.nodes[this.options.nextNodeType] ||
                    $to.parent.type.contentMatch.defaultType;
                  const node = nodeType?.create();

                  if (node) {
                    tr.insert(posAfter, node);
                    tr.setSelection(TextSelection.create(tr.doc, posAfter + 1));
                  }
                }

                tr.scrollIntoView();
              }

              return true;
            })
            .run();
        },
    };
  },
});
