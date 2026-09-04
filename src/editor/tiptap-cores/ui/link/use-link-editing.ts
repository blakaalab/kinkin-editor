import { useCallback, useEffect, useRef, useState } from "react";

import { getMarkRange } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";

export interface UseLinkEditingConfig {
  editor?: Editor | null;
}

const isInMiddleOfLinkMark = (editor: Editor): boolean => {
  if (!editor.isActive("link")) {
    return false;
  }

  const $pos = editor.state.selection.$anchor;
  const linkType = editor.schema.marks.link;

  if (!linkType) {
    return false;
  }

  const range = getMarkRange($pos, linkType);

  if (!range) {
    return false;
  }

  const linkTextLength = range.to - range.from;
  const positionInLink = editor.state.selection.anchor - range.from;

  return positionInLink > 0 && positionInLink < linkTextLength;
};

const preventLinkExtension = (editor: Editor): void => {
  if (!editor.isActive("link")) {
    return;
  }

  const $pos = editor.state.selection.$anchor;
  const linkType = editor.schema.marks.link;

  if (!linkType) {
    return;
  }

  const range = getMarkRange($pos, linkType);

  if (!range) {
    return;
  }

  const linkTextLength = range.to - range.from;
  const positionInLink = editor.state.selection.anchor - range.from;
  const isInMiddle = positionInLink > 0 && positionInLink < linkTextLength;

  if (!isInMiddle) {
    const currentMarks = editor.state.storedMarks || $pos.marks();
    const filteredMarks = currentMarks.filter(
      (mark) => mark.type.name !== "link",
    );
    editor.view.dispatch(editor.state.tr.setStoredMarks(filteredMarks));
  }
};

export const useLinkEditing = ({
  editor: providedEditor,
}: UseLinkEditingConfig = {}) => {
  const { editor } = useTiptapEditor(providedEditor);

  const [isEditing, setIsEditing] = useState(false);
  const [isInLink, setIsInLink] = useState(false);
  const suppressAutoOpenRef = useRef(false);
  const lastSuppressedPosRef = useRef<number | null>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateLinkState = () => {
      const currentPos = editor.state.selection.anchor;

      if (
        suppressAutoOpenRef.current &&
        lastSuppressedPosRef.current !== null &&
        currentPos !== lastSuppressedPosRef.current
      ) {
        suppressAutoOpenRef.current = false;
        lastSuppressedPosRef.current = null;
      }

      const isInMiddle = isInMiddleOfLinkMark(editor);
      const hasLinkActive = editor.isActive("link");

      setIsInLink(isInMiddle);

      if (isInMiddle && !suppressAutoOpenRef.current) {
        setIsEditing(true);
      }

      if (!isInMiddle && !hasLinkActive) {
        setIsEditing(false);
        suppressAutoOpenRef.current = false;
        lastSuppressedPosRef.current = null;
      }
    };

    const handleKeyDown = () => {
      preventLinkExtension(editor);
    };

    updateLinkState();
    editor.on("selectionUpdate", updateLinkState);
    editor.view.dom.addEventListener("keydown", handleKeyDown);

    return () => {
      editor.off("selectionUpdate", updateLinkState);
      editor.view.dom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    if (!editor) {
      return;
    }

    const $pos = editor.state.selection.$anchor;
    const linkType = editor.schema.marks.link;
    const range = linkType ? getMarkRange($pos, linkType) : null;

    suppressAutoOpenRef.current = true;
    setIsEditing(false);

    if (range) {
      lastSuppressedPosRef.current = range.to;
      editor.chain().focus().setTextSelection(range.to).unsetMark("link").run();
    } else {
      const endPos = editor.state.selection.to;
      lastSuppressedPosRef.current = endPos;
      editor.chain().focus().setTextSelection(endPos).run();
    }
  }, [editor]);

  return {
    isInLink,
    isEditing,
    startEditing,
    stopEditing,
  };
};
