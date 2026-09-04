"use client";

import { useCallback, useEffect } from "react";

import type { Editor } from "@tiptap/react";

import { getEditorExtension } from "../lib/tiptap-utils";
import { selectNodeAndHideFloating } from "./use-floating-toolbar-visibility";
import { useTiptapEditor } from "./use-tiptap-editor";

interface UseScrollToHashConfig {
  editor?: Editor | null;
  onTargetFound?: (nodeId: string) => void;
  onTargetNotFound?: (hash: string) => void;
}

export function useScrollToHash(config: UseScrollToHashConfig = {}) {
  const {
    editor: providedEditor,
    onTargetFound = () => {},
    onTargetNotFound = () => {},
  } = config;

  const { editor } = useTiptapEditor(providedEditor);

  const scrollToNode = useCallback(
    (id: string): boolean => {
      if (!editor) return false;

      const attributeName =
        getEditorExtension(editor, "uniqueID")?.options?.attributeName ??
        "data-id";
      let position: number | null = null;

      editor.state.doc.descendants((node, pos) => {
        if (node.attrs?.[attributeName] === id) {
          position = pos;
          return false;
        }
        return true;
      });

      if (position === null) return false;

      selectNodeAndHideFloating(editor, position);

      setTimeout(() => {
        const dom = editor.view.nodeDOM(position!) as HTMLElement | null;

        if (dom) {
          dom.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 0);

      return true;
    },
    [editor],
  );

  const handleScroll = useCallback(
    (delay = 0) => {
      const hash = window.location.hash?.substring(1);
      if (!hash) return;

      setTimeout(() => {
        if (scrollToNode(hash)) {
          onTargetFound(hash);
        } else {
          onTargetNotFound(hash);
        }
      }, delay);
    },
    [scrollToNode, onTargetFound, onTargetNotFound],
  );

  useEffect(() => {
    if (!editor) return;
    handleScroll(500);
  }, [editor, handleScroll]);

  useEffect(() => {
    const immediateScroll = () => handleScroll();
    const delayedScroll = () => handleScroll(500);

    window.addEventListener("hashchange", immediateScroll);
    window.addEventListener("pageshow", delayedScroll);
    window.addEventListener("popstate", immediateScroll);

    return () => {
      window.removeEventListener("hashchange", immediateScroll);
      window.removeEventListener("pageshow", delayedScroll);
      window.removeEventListener("popstate", immediateScroll);
    };
  }, [handleScroll]);

  return { scrollToHash: scrollToNode };
}
