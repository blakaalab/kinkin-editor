import {
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Editor } from "@tiptap/react";
import { CornerDownLeft, Sparkles } from "lucide-react";

import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { cn, isSelectionValid } from "@/editor/tiptap-cores/lib/tiptap-utils";
import type { TiptapButtonProps } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";

interface AiChatButtonProps extends Omit<TiptapButtonProps, "type"> {
  editor?: Editor | null;
  text?: string;
  onChatRequest?: (message: string, selectedText: string) => void;
}

export const AiChatButton = forwardRef<HTMLButtonElement, AiChatButtonProps>(
  (
    {
      editor: providedEditor,
      text = "What do you want to edit?",
      onClick,
      onChatRequest,
      className,
      children,
      showTooltip = false,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isInputMode, setIsInputMode] = useState(false);
    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when entering input mode
    useEffect(() => {
      if (isInputMode) {
        const timeoutId = setTimeout(() => {
          inputRef.current?.focus();
        }, 50);

        return () => clearTimeout(timeoutId);
      }
    }, [isInputMode]);

    const handleButtonClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setIsInputMode(true);
        }
      },
      [onClick],
    );

    const handleSendMessage = useCallback(() => {
      if (!editor || !message.trim()) {
        return;
      }

      const { selection, doc } = editor.state;
      const selectedText = doc.textBetween(selection.from, selection.to, " ");

      onChatRequest?.(message.trim(), selectedText);

      // Reset state
      setMessage("");
      setIsInputMode(false);
    }, [editor, message, onChatRequest]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === "Enter" && message.trim()) {
          event.preventDefault();
          handleSendMessage();

          // Hide the selection toolbar
          editor?.commands.setTextSelection(editor.state.selection.from);
        }
      },
      [message, handleSendMessage],
    );

    if (!isSelectionValid(editor)) {
      return null;
    }

    // Input mode: show inline input with send button
    if (isInputMode) {
      return (
        <div
          className={cn(
            "flex flex-row items-center gap-1 bg-white rounded-lg",
            className,
          )}
        >
          <div className="relative flex flex-wrap items-stretch flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask AI to edit..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className="block w-full h-full text-sm font-normal leading-normal px-2 rounded-md bg-transparent appearance-none outline-none placeholder:text-gray-400"
            />
          </div>

          <TiptapButton
            type="button"
            onClick={handleSendMessage}
            title="Send message"
            disabled={!message.trim()}
          >
            <CornerDownLeft className="size-4" />
          </TiptapButton>
        </div>
      );
    }

    // Button mode: show button with icon and text
    return (
      <TiptapButton
        type="button"
        tabIndex={-1}
        aria-label="Chat with AI"
        tooltip="Chat with AI"
        onClick={handleButtonClick}
        className={cn("text-blue-500", className)}
        showTooltip={showTooltip}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Sparkles className="size-4" />
            {text && <span className="whitespace-nowrap">{text}</span>}
          </>
        )}
      </TiptapButton>
    );
  },
);
