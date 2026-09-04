import { type RefObject, useEffect } from "react";

import { Selection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";

import { isValidPosition } from "../../lib/tiptap-utils";
import { isElementWithinEditor } from "./floating-element-utils";

interface UseFloatingElementEventsConfig {
  editor: Editor | null;
  open: boolean;
  closeOnEscape: boolean;
  updateOnScroll: boolean;
  floatingElementRef: RefObject<HTMLDivElement | null>;
  preventHideRef: RefObject<boolean>;
  preventShowRef: RefObject<boolean>;
  handleOpenChange: (open: boolean) => void;
  updateSelectionState: () => void;
}

export const useFloatingElementEvents = ({
  editor,
  open,
  closeOnEscape,
  updateOnScroll,
  floatingElementRef,
  preventHideRef,
  preventShowRef,
  handleOpenChange,
  updateSelectionState,
}: UseFloatingElementEventsConfig) => {
  useEffect(() => {
    if (!editor || !closeOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        handleOpenChange(false);
        return true;
      }
      return false;
    };

    editor.view.dom.addEventListener("keydown", handleKeyDown);

    return () => {
      editor.view.dom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, open, closeOnEscape, handleOpenChange]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleBlur = (event: FocusEvent) => {
      if (preventHideRef.current) {
        preventHideRef.current = false;
        return;
      }

      const relatedTarget = event.relatedTarget as Node;

      if (!relatedTarget) {
        return;
      }

      const isWithinEditor = isElementWithinEditor(editor, relatedTarget);
      const floatingElement = floatingElementRef.current;

      const isWithinFloatingElement =
        floatingElement &&
        (floatingElement === relatedTarget ||
          floatingElement.contains(relatedTarget));

      if (!isWithinEditor && !isWithinFloatingElement && open) {
        handleOpenChange(false);
      }
    };

    editor.view.dom.addEventListener("blur", handleBlur);

    return () => {
      editor.view.dom.removeEventListener("blur", handleBlur);
    };
  }, [editor, handleOpenChange, open, floatingElementRef, preventHideRef]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleDrag = () => {
      if (open) {
        handleOpenChange(false);
      }
    };

    editor.view.dom.addEventListener("dragstart", handleDrag);
    editor.view.dom.addEventListener("dragover", handleDrag);

    return () => {
      editor.view.dom.removeEventListener("dragstart", handleDrag);
      editor.view.dom.removeEventListener("dragover", handleDrag);
    };
  }, [editor, open, handleOpenChange]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }

      preventShowRef.current = true;

      const { state, view } = editor;

      const posCoords = view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });

      if (!posCoords || !isValidPosition(posCoords.pos)) {
        return;
      }

      const $pos = state.doc.resolve(posCoords.pos);
      const nodeBefore = $pos.nodeBefore;

      if (!nodeBefore || nodeBefore.isBlock) {
        return;
      }

      const tr = state.tr.setSelection(
        Selection.near(state.doc.resolve(posCoords.pos)),
      );

      view.dispatch(tr);
    };

    const handleMouseUp = () => {
      if (preventShowRef.current) {
        preventShowRef.current = false;
        updateSelectionState();
      }
    };

    editor.view.dom.addEventListener("mousedown", handleMouseDown);
    editor.view.root.addEventListener("mouseup", handleMouseUp);

    return () => {
      editor.view.dom.removeEventListener("mousedown", handleMouseDown);
      editor.view.root.removeEventListener("mouseup", handleMouseUp);
    };
  }, [editor, updateSelectionState, preventShowRef]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateIfOpen = () => {
      if (open) {
        updateSelectionState();
      }
    };

    editor.on("selectionUpdate", updateSelectionState);
    window.addEventListener("resize", updateIfOpen);

    if (updateOnScroll) {
      editor.view.root.addEventListener("scroll", updateIfOpen, true);
    }

    return () => {
      editor.off("selectionUpdate", updateSelectionState);
      window.removeEventListener("resize", updateIfOpen);

      if (updateOnScroll) {
        editor.view.root.removeEventListener("scroll", updateIfOpen, true);
      }
    };
  }, [editor, open, updateOnScroll, updateSelectionState]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    updateSelectionState();
  }, [editor, updateSelectionState]);
};
