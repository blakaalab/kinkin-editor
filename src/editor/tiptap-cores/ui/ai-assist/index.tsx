import { useCallback, useEffect, useRef, useState } from "react";

import type { AiAssistRequest } from "@/editor/tiptap-cores/extensions/ai-assist-extension";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { getSurroundingContext } from "@/editor/tiptap-cores/lib/tiptap-utils";
import { TiptapComboboxPopover } from "@/editor/tiptap-cores/ui/base/tiptap-combobox";
import { TiptapMenu } from "@/editor/tiptap-cores/ui/base/tiptap-menu/tiptap-menu";
import { FloatingElement } from "@/editor/tiptap-cores/ui/floating-element";

import { AiAssistResultActionsMenu } from "./ai-assist-result-actions-menu";
import { AiAssistSuggestionsMenu } from "./ai-assist-suggestions-menu";
import { AiAssistToolbar } from "./ai-assist-toolbar";
import type { AiAssistSuggestion } from "./ai-assist-utils";
import { useAiAssist } from "./use-ai-assist";

const LOADING_MESSAGES = [
  "Thinking...",
  "Brainstorming...",
  "Cooking up ideas...",
  "Crunching words...",
  "Working on it...",
  "Almost there...",
];

interface AiAssistPanelProps {
  onAiAssist?: (request: AiAssistRequest) => void;
  onStopAiAssist?: () => void;
}

export function AiAssistPanel({
  onAiAssist,
  onStopAiAssist,
}: AiAssistPanelProps) {
  const { editor } = useTiptapEditor();
  const {
    state: {
      isOpen,
      originalSelection,
      aiResponse,
      isCalling,
      isStreaming,
      errorMessage,
      lastRequest,
    },
    getBoundingRect,
  } = useAiAssist(editor);

  const { selectedText, afterSelectedText, beforeSelectedText } =
    editor && originalSelection
      ? getSurroundingContext(
          editor,
          originalSelection.from,
          originalSelection.to,
        )
      : {};

  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const isLoading = Boolean(isCalling || isStreaming);

  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setLoadingTextIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingText = LOADING_MESSAGES[loadingTextIndex];

  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  const handleSubmitPrompt = useCallback(
    (prompt: string) => {
      if (!selectedText || !onAiAssist || isLoading) {
        return;
      }

      const metadata = { prompt };
      const rejectedResponse = aiResponse || undefined;

      editor?.commands.executeAiAssistAction("custom", metadata);

      onAiAssist({
        selectedText,
        actionId: "custom",
        metadata,
        rejectedResponse,
        surroundingContext: { afterSelectedText, beforeSelectedText },
      });

      setInputValue("");
    },
    [
      originalSelection,
      onAiAssist,
      isLoading,
      editor,
      aiResponse,
      selectedText,
      afterSelectedText,
      beforeSelectedText,
    ],
  );

  const handleSelectSuggestion = useCallback(
    (suggestion: AiAssistSuggestion, submenuItem?: string) => {
      if (!selectedText || !onAiAssist) return;

      let metadata: Record<string, unknown> | undefined;

      if (submenuItem) {
        if (suggestion.id === "translate") {
          metadata = { language: submenuItem };
        } else if (suggestion.id === "tone") {
          metadata = { tone: submenuItem };
        }
      }

      editor?.commands.executeAiAssistAction(suggestion.id, metadata);

      onAiAssist({
        selectedText,
        actionId: suggestion.id,
        metadata,
        surroundingContext: { afterSelectedText, beforeSelectedText },
      });
    },
    [
      originalSelection,
      onAiAssist,
      editor,
      selectedText,
      afterSelectedText,
      beforeSelectedText,
    ],
  );

  const handleTryAgain = useCallback(() => {
    if (!lastRequest || !selectedText || !onAiAssist) return;

    const rejectedResponse = aiResponse || undefined;

    editor?.commands.executeAiAssistAction(
      lastRequest.actionId,
      lastRequest.metadata,
    );

    onAiAssist({
      selectedText,
      actionId: lastRequest.actionId,
      metadata: lastRequest.metadata,
      rejectedResponse,
      surroundingContext: { afterSelectedText, beforeSelectedText },
    });
  }, [
    lastRequest,
    originalSelection,
    onAiAssist,
    aiResponse,
    editor,
    selectedText,
    afterSelectedText,
    beforeSelectedText,
  ]);

  const handleSubmit = useCallback(() => {
    if (inputValue.trim() && !isLoading) {
      handleSubmitPrompt(inputValue);
    }
  }, [inputValue, isLoading, handleSubmitPrompt]);

  const handleClose = useCallback(() => {
    editor?.commands.closeAiAssist();
  }, [editor]);

  const handleAccept = useCallback(() => {
    editor?.commands.acceptAiAssist();
  }, [editor]);

  const handleDiscard = useCallback(() => {
    editor?.commands.discardAiAssist();
  }, [editor]);

  const handleStop = useCallback(() => {
    onStopAiAssist?.();
    editor?.commands.discardAiAssist();
  }, [editor, onStopAiAssist]);

  const handleInsertBelow = useCallback(() => {
    editor?.commands.insertBelowAiAssist();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const showSuggestions = !aiResponse && !isLoading && !errorMessage;
  const hasResponse = Boolean(aiResponse) || isStreaming;
  const canSubmit = Boolean(inputValue.trim()) && !isLoading;
  const showActions = (hasResponse || errorMessage) && !isLoading;

  return (
    <FloatingElement
      shouldShow={isOpen}
      placement="bottom"
      zIndex={110}
      getBoundingClientRect={getBoundingRect}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <TiptapMenu>
        <div ref={containerRef}>
          <AiAssistToolbar
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={handleSubmit}
            onClose={handleClose}
            onStop={handleStop}
            canSubmit={canSubmit}
            isLoading={isLoading}
            autoFocus={isOpen}
            errorMessage={errorMessage}
            loadingText={loadingText}
          />
        </div>

        {showSuggestions && (
          <TiptapComboboxPopover
            gutter={4}
            getAnchorRect={() =>
              containerRef.current?.getBoundingClientRect() || null
            }
            open
            autoFocusOnShow
            className="w-54 outline-none! z-[120]"
          >
            <AiAssistSuggestionsMenu
              query={inputValue}
              onSelect={handleSelectSuggestion}
            />
          </TiptapComboboxPopover>
        )}

        {showActions && (
          <TiptapComboboxPopover
            gutter={4}
            getAnchorRect={() =>
              containerRef.current?.getBoundingClientRect() || null
            }
            open
            autoFocusOnShow
            className="w-36 outline-none! z-[120]"
          >
            <AiAssistResultActionsMenu
              query={inputValue}
              onAccept={handleAccept}
              onDiscard={handleDiscard}
              onInsertBelow={handleInsertBelow}
              onTryAgain={handleTryAgain}
              hasError={Boolean(errorMessage)}
            />
          </TiptapComboboxPopover>
        )}
      </TiptapMenu>
    </FloatingElement>
  );
}
