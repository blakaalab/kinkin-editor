import { useCallback, useEffect, useState } from "react";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  CodeXml,
  Italic,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
} from "lucide-react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import { isMarkInSchema, isNodeTypeSelected } from "../../lib/tiptap-utils";

type Mark =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "underline"
  | "superscript"
  | "subscript";

export interface UseMarkConfig {
  editor?: Editor | null;
  type: Mark;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

const MARK_SHORTCUT_KEYS: Record<Mark, string> = {
  bold: "mod+b",
  italic: "mod+i",
  underline: "mod+u",
  strike: "mod+shift+s",
  code: "mod+e",
  superscript: "mod+.",
  subscript: "mod+,",
};

const markIcons = {
  bold: Bold,
  italic: Italic,
  underline: Underline,
  strike: Strikethrough,
  code: CodeXml,
  superscript: Superscript,
  subscript: Subscript,
};

const canToggleMark = (editor: Editor | null, type: Mark): boolean => {
  if (
    !editor?.isEditable ||
    !isMarkInSchema(type, editor) ||
    isNodeTypeSelected(editor, ["image"])
  ) {
    return false;
  }

  return editor.can().toggleMark(type);
};

const isMarkActive = (editor: Editor | null, type: Mark): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  return editor.isActive(type);
};

const toggleMark = (editor: Editor | null, type: Mark): boolean => {
  if (!canToggleMark(editor, type)) {
    return false;
  }

  return editor!.chain().focus().toggleMark(type).run();
};

const shouldShowButton = ({
  editor,
  type,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  type: Mark;
  hideWhenUnavailable: boolean;
}): boolean => {
  if (!editor?.isEditable || !isMarkInSchema(type, editor)) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleMark(editor, type);
  }

  return true;
};

const getFormattedMarkName = (type: Mark): string => {
  if (type === "strike") {
    return "Strikethrough";
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const useMark = ({
  editor: providedEditor,
  type,
  hideWhenUnavailable = false,
  onToggled,
}: UseMarkConfig) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);
  const canToggle = canToggleMark(editor, type);
  const isActive = isMarkActive(editor, type);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, type, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, type, hideWhenUnavailable]);

  const handleMark = useCallback(() => {
    if (!editor) {
      return false;
    }

    const success = toggleMark(editor, type);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, type, onToggled]);

  return {
    isVisible,
    isActive,
    handleMark,
    canToggle,
    label: getFormattedMarkName(type),
    shortcutKeys: MARK_SHORTCUT_KEYS[type],
    Icon: markIcons[type],
  };
};
