import { Extension } from "@tiptap/core";

export interface UiState {
  isDragging: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    uiState: {
      resetUiState: () => ReturnType;
      setIsDragging: (value: boolean) => ReturnType;
    };
  }

  interface Storage {
    uiState: UiState;
  }
}

export const defaultUiState: UiState = {
  isDragging: false,
};

export const UiState = Extension.create<UiState>({
  name: "uiState",

  addStorage() {
    return { ...defaultUiState };
  },

  addCommands() {
    return {
      setIsDragging: (value: boolean) => () => {
        this.storage.isDragging = value;
        return true;
      },

      resetUiState: () => () => {
        Object.assign(this.storage, { ...defaultUiState });
        return true;
      },
    };
  },

  onCreate() {
    this.storage = { ...defaultUiState };
  },
});
