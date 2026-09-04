import { useEffect, useRef, useState } from "react";

import { NodeSelection, type Transaction } from "@tiptap/pm/state";
import { type Editor, isNodeSelection } from "@tiptap/react";

export const HIDE_FLOATING_META = "hideFloatingToolbar";

export function useFloatingToolbarVisibility(params: {
  editor: Editor | null;
  isSelectionValid: (
    editor: Editor,
    selection: Editor["state"]["selection"],
  ) => boolean;
  extraHideWhen?: boolean;
}) {
  const { editor, isSelectionValid, extraHideWhen = false } = params;
  const [shouldShow, setShouldShow] = useState(false);
  const hideRef = useRef(false);

  useEffect(() => {
    if (!editor) return;

    const onTx = ({ transaction }: { transaction: Transaction }) => {
      if (transaction.getMeta(HIDE_FLOATING_META)) {
        hideRef.current = true;
      }
    };

    editor.on("transaction", onTx);

    return () => {
      editor.off("transaction", onTx);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;

    const onPointerDown = (e: PointerEvent) => {
      const sel = editor.state.selection;
      if (!(sel instanceof NodeSelection)) {
        return;
      }

      const nodeDom = editor.view.nodeDOM(sel.from) as HTMLElement | null;

      if (nodeDom?.contains(e.target as Node)) {
        hideRef.current = false;
        const valid = isSelectionValid(editor, sel);
        setShouldShow(valid && !extraHideWhen);
      }
    };

    dom.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () =>
      dom.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
  }, [editor, extraHideWhen, isSelectionValid]);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { selection } = editor.state;
      const valid = isSelectionValid(editor, selection);

      if (extraHideWhen || (isNodeSelection(selection) && hideRef.current)) {
        setShouldShow(false);
        return;
      }
      setShouldShow(valid);
    };

    handleSelectionUpdate();
    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, extraHideWhen, isSelectionValid]);

  return { shouldShow };
}

export const selectNodeAndHideFloating = (editor: Editor, pos: number) => {
  if (!editor) return;
  const { state, view } = editor;
  view.dispatch(
    state.tr
      .setSelection(NodeSelection.create(state.doc, pos))
      .setMeta(HIDE_FLOATING_META, true),
  );
};
