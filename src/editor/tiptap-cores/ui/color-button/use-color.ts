import { useCallback, useEffect, useState } from "react";

import type { Editor } from "@tiptap/react";
import { Baseline, Highlighter } from "lucide-react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import { isMarkInSchema } from "../../lib/tiptap-utils";
import { HIGHLIGHT_COLORS, TEXT_COLORS } from "./colors";

/** `text` writes the glyph colour, `highlight` the colour behind it. */
export type ColorType = "text" | "highlight";

export interface UseColorConfig {
  editor?: Editor | null;
  type: ColorType;
  hideWhenUnavailable?: boolean;
  onApplied?: () => void;
}

const colorIcons = {
  text: Baseline,
  highlight: Highlighter,
};

const colorLabels = {
  text: "Text colour",
  highlight: "Highlight",
};

/** The mark each one is stored on. */
const colorMarks = {
  text: "textStyle",
  highlight: "highlight",
};

export const colorSwatches = {
  text: TEXT_COLORS,
  highlight: HIGHLIGHT_COLORS,
};

const canApplyColor = (editor: Editor | null, type: ColorType): boolean => {
  if (!editor?.isEditable || !isMarkInSchema(colorMarks[type], editor)) {
    return false;
  }

  // Colouring code is meaningless — the code mark owns its own colours.
  if (editor.isActive("code") || editor.isActive("codeBlock")) {
    return false;
  }

  try {
    return type === "text"
      ? editor.can().setColor("#000000")
      : editor.can().setHighlight({ color: "#000000" });
  } catch {
    return false;
  }
};

/** The colour currently under the selection, or null for none. */
const activeColor = (editor: Editor | null, type: ColorType): string | null => {
  if (!editor?.isEditable) {
    return null;
  }

  const attributes = editor.getAttributes(colorMarks[type]);
  return (attributes.color as string | undefined) ?? null;
};

export const useColor = ({
  editor: providedEditor,
  type,
  hideWhenUnavailable = false,
  onApplied,
}: UseColorConfig) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);
  const canApply = canApplyColor(editor, type);
  const color = activeColor(editor, type);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(hideWhenUnavailable ? canApplyColor(editor, type) : true);
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, type, hideWhenUnavailable]);

  const applyColor = useCallback(
    (value: string) => {
      if (!editor || !canApplyColor(editor, type)) {
        return false;
      }

      const chain = editor.chain().focus();
      // Picking the colour that is already applied removes it, so the same
      // swatch toggles rather than becoming a dead end.
      const isCurrent = activeColor(editor, type) === value;
      const success =
        type === "text"
          ? isCurrent
            ? chain.unsetColor().run()
            : chain.setColor(value).run()
          : isCurrent
            ? chain.unsetHighlight().run()
            : chain.setHighlight({ color: value }).run();

      if (success) {
        onApplied?.();
      }

      return success;
    },
    [editor, type, onApplied],
  );

  const clearColor = useCallback(() => {
    if (!editor) {
      return false;
    }

    const chain = editor.chain().focus();
    const success =
      type === "text" ? chain.unsetColor().run() : chain.unsetHighlight().run();

    if (success) {
      onApplied?.();
    }

    return success;
  }, [editor, type, onApplied]);

  return {
    isVisible,
    canApply,
    color,
    applyColor,
    clearColor,
    swatches: colorSwatches[type],
    label: colorLabels[type],
    Icon: colorIcons[type],
  };
};
