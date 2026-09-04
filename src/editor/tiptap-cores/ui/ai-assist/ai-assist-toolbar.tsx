import { type KeyboardEvent, useCallback, useEffect, useRef } from "react";

import { ArrowUp, CircleStop, Loader2, Sparkles, X } from "lucide-react";

import { cn } from "@/editor/tiptap-cores/lib/tiptap-utils";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapCombobox } from "@/editor/tiptap-cores/ui/base/tiptap-combobox";

interface AiAssistToolbarProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  onStop: () => void;
  canSubmit: boolean;
  isLoading: boolean;
  autoFocus?: boolean;
  errorMessage?: string | null;
  loadingText?: string;
}

export function AiAssistToolbar({
  inputValue,
  onInputChange,
  onSubmit,
  onClose,
  onStop,
  canSubmit,
  isLoading,
  autoFocus = false,
  errorMessage,
  loadingText = "Reading the page...",
}: AiAssistToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus || !isLoading) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [autoFocus, isLoading]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey && inputValue.trim()) {
        event.preventDefault();
        onSubmit();
      }
    },
    [inputValue, onSubmit],
  );

  return (
    <>
      <div
        className={cn(
          "w-80 rounded-lg border overflow-hidden z-100 relative",
          "border-gray-200 bg-white",
          "shadow-xl",
          "flex items-center gap-0.5 p-1",
        )}
      >
        {isLoading ? (
          <>
            <div className="shrink-0 pl-1.5 pr-1">
              <Loader2 className="size-4 text-blue-500 animate-spin" />
            </div>
            <span className="flex-1 text-sm text-gray-600">{loadingText}</span>
            <TiptapButton
              onClick={onStop}
              className="shrink-0 rounded-md text-gray-600 hover:text-gray-800"
            >
              <CircleStop className="size-4" />
            </TiptapButton>
          </>
        ) : (
          <>
            <div className="shrink-0 pl-1.5 pr-1">
              <Sparkles className="size-4 text-blue-500" />
            </div>
            <TiptapCombobox
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              ref={inputRef}
              render={
                <input
                  type="text"
                  placeholder="Start asking..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "flex-1 h-8 text-sm font-normal leading-normal",
                    "bg-transparent appearance-none outline-none",
                    "placeholder:text-gray-400",
                  )}
                />
              }
            />
            <TiptapButton
              onClick={onSubmit}
              disabled={!canSubmit}
              className={cn(
                "shrink-0 rounded-md",
                canSubmit
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-400",
              )}
            >
              <ArrowUp className="size-4" />
            </TiptapButton>
            <TiptapButton
              onClick={onClose}
              className="shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="size-4" />
            </TiptapButton>
          </>
        )}
      </div>
      {errorMessage && (
        <span className="mt-1 text-xs text-red-500">{errorMessage}</span>
      )}
    </>
  );
}
