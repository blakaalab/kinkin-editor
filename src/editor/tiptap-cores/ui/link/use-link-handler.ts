import { useCallback, useEffect, useState } from "react";

import { getMarkRange } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import { isValidUrl } from "../../lib/tiptap-utils";

export interface UseLinkHandlerConfig {
  editor?: Editor | null;
  onSetLink?: () => void;
}

const isLinkActive = (editor: Editor | null): boolean => {
  if (!editor?.isEditable) {
    return false;
  }

  return editor.isActive("link");
};

export const useLinkHandler = ({
  editor: providedEditor,
  onSetLink,
}: UseLinkHandlerConfig = {}) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [url, setUrl] = useState<string | null>(null);
  const isActive = editor ? isLinkActive(editor) : false;

  useEffect(() => {
    if (!editor) {
      return;
    }

    const { href } = editor.getAttributes("link");

    if (isLinkActive(editor) && url === null) {
      setUrl(href || "");
    }
  }, [editor, url]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateLinkState = () => {
      const { href } = editor.getAttributes("link");
      setUrl(href || "");
    };

    editor.on("selectionUpdate", updateLinkState);

    return () => {
      editor.off("selectionUpdate", updateLinkState);
    };
  }, [editor]);

  const setLink = useCallback(() => {
    if (!url || !editor || !isValidUrl(url)) {
      return;
    }

    const { selection } = editor.state;
    const isEmpty = selection.empty;
    const hasExistingLink = editor.isActive("link");

    let chain = editor.chain().focus();

    chain = chain.extendMarkRange("link").setLink({ href: url });

    if (isEmpty && !hasExistingLink) {
      chain = chain.insertContent({ type: "text", text: url });
    }

    chain.run();

    const $pos = editor.state.selection.$to;
    const linkType = editor.schema.marks.link;

    if (linkType) {
      const range = getMarkRange($pos, linkType);

      if (range) {
        editor.chain().setTextSelection(range.to).unsetMark("link").run();
      }
    }

    setUrl(null);

    onSetLink?.();
  }, [editor, onSetLink, url]);

  const removeLink = useCallback(() => {
    if (!editor) {
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .unsetLink()
      .setMeta("preventAutolink", true)
      .run();
    setUrl("");
  }, [editor]);

  const openLink = useCallback(
    (target: string = "_blank", features: string = "noopener,noreferrer") => {
      if (!url || !isValidUrl(url)) {
        return;
      }

      window.open(url, target, features);
    },
    [url],
  );

  return {
    url: url || "",
    setUrl,
    setLink,
    removeLink,
    openLink,
    isActive,
  };
};
