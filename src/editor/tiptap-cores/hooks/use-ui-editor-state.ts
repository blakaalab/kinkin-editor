import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";

import { defaultUiState, type UiState } from "../extensions/ui-state-extension";

export const useUiEditorState = (editor: Editor | null): UiState => {
  return (
    useEditorState({
      editor,
      selector: ({ editor }) => {
        if (!editor) {
          return defaultUiState;
        }

        const state = editor.storage.uiState;
        if (!state) {
          console.warn(
            "Editor storage uiState is not initialized. Ensure you added the UIState extension to your editor.",
          );
          return defaultUiState;
        }

        return { ...defaultUiState, ...state };
      },
    }) ?? defaultUiState
  );
};
