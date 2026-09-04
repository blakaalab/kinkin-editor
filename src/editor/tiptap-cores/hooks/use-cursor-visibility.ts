"use client";

import { useEffect } from "react";

import type { Editor } from "@tiptap/react";

import { useBodyRect } from "./use-element-rect";
import { useWindowSize } from "./use-window-size";

interface CursorVisibilityOptions {
  editor?: Editor | null;
  overlayHeight?: number;
  bottomBuffer?: number;
}

export function useCursorVisibility({
  editor,
  overlayHeight = 40,
  bottomBuffer = 40,
}: CursorVisibilityOptions) {
  const { height: windowHeight } = useWindowSize();
  const rect = useBodyRect({
    enabled: true,
    throttleMs: 100,
    useResizeObserver: true,
  });

  useEffect(() => {
    const ensureCursorVisibility = () => {
      if (!editor?.view.hasFocus()) {
        return;
      }

      if (editor.storage.streamContentState?.isStreaming) {
        return;
      }

      const { state, view } = editor;
      const { from } = state.selection;
      const cursorCoords = view.coordsAtPos(from);

      if (windowHeight < rect.height && cursorCoords) {
        const availableSpace = windowHeight - cursorCoords.top;
        const minRequiredSpace = overlayHeight + bottomBuffer;

        if (availableSpace < minRequiredSpace) {
          const targetCursorY = windowHeight - minRequiredSpace;
          const currentScrollY = window.scrollY;
          const cursorAbsoluteY = cursorCoords.top + currentScrollY;
          const newScrollY = cursorAbsoluteY - targetCursorY;

          window.scrollTo({
            top: Math.max(0, newScrollY),
            behavior: "smooth",
          });
        }
      }
    };

    ensureCursorVisibility();
  }, [editor, overlayHeight, bottomBuffer, windowHeight, rect.height]);

  return rect;
}
