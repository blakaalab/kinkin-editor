import { useCallback, useState } from "react";

import { Link2, MoreVertical } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { useFloatingToolbarVisibility } from "@/editor/tiptap-cores/hooks/use-floating-toolbar-visibility";
import { useIsMobile } from "@/editor/tiptap-cores/hooks/use-mobile";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { isSelectionValid } from "@/editor/tiptap-cores/lib/tiptap-utils";
import { AiAssistButton } from "@/editor/tiptap-cores/ui/ai-assist/ai-assist-button";
import { useAiAssist } from "@/editor/tiptap-cores/ui/ai-assist/use-ai-assist";
import { AiChatButton } from "@/editor/tiptap-cores/ui/ai-chat-button";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import {
  TiptapCombobox,
  TiptapComboboxList,
} from "@/editor/tiptap-cores/ui/base/tiptap-combobox";
import {
  TiptapMenu,
  TiptapMenuButton,
  TiptapMenuContent,
  TiptapMenuGroup,
  TiptapMenuItem,
} from "@/editor/tiptap-cores/ui/base/tiptap-menu/tiptap-menu";
import {
  TiptapToolbar,
  TiptapToolbarGroup,
  TiptapToolbarSeparator,
} from "@/editor/tiptap-cores/ui/base/tiptap-toolbar";
import { FloatingElement } from "@/editor/tiptap-cores/ui/floating-element";
import { HorizontalRuleButton } from "@/editor/tiptap-cores/ui/horizontal-rule-button";
import { LinkPopoverContent } from "@/editor/tiptap-cores/ui/link";
import { useLinkEditing } from "@/editor/tiptap-cores/ui/link/use-link-editing";
import { MarkButton } from "@/editor/tiptap-cores/ui/mark-button";
import { TurnIntoMenuContent } from "@/editor/tiptap-cores/ui/turn-into-menu";

const MoreOptions = ({ onLinkClick }: { onLinkClick: () => void }) => {
  const { editor } = useTiptapEditor();
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen && editor && !editor.isDestroyed) {
        requestAnimationFrame(() => editor.commands.focus());
      }
    },
    [editor],
  );

  if (!editor?.isEditable) {
    return null;
  }

  const handleLinkClick = () => {
    setOpen(false);
    onLinkClick();
  };

  return (
    <TiptapMenu
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        <TiptapMenuButton
          render={
            <TiptapButton tabIndex={-1}>
              <MoreVertical className="size-4" />
            </TiptapButton>
          }
        />
      }
    >
      <TiptapMenuContent portal>
        <TiptapCombobox className="sr-only" />
        <TiptapComboboxList style={{ minWidth: "12rem" }}>
          <TiptapMenuGroup>
            <TiptapMenuItem
              render={
                <MarkButton
                  type="strike"
                  text="Strikethrough"
                  className="w-full"
                  showTooltip={false}
                />
              }
            />
          </TiptapMenuGroup>

          <TurnIntoMenuContent />

          <Separator orientation="horizontal" className="my-2" />

          <TiptapMenuGroup>
            <TiptapMenuItem
              render={
                <HorizontalRuleButton
                  text="Horizontal line"
                  className="w-full"
                  showTooltip={false}
                />
              }
            />
          </TiptapMenuGroup>

          <TiptapMenuGroup>
            <TiptapMenuItem
              render={<TiptapButton isToggled={editor.isActive("link")} />}
              onClick={handleLinkClick}
            >
              <Link2 className="size-4" />
              <span>Link</span>
            </TiptapMenuItem>
          </TiptapMenuGroup>
        </TiptapComboboxList>
      </TiptapMenuContent>
    </TiptapMenu>
  );
};

interface SelectionToolbarProps {
  onAiChatRequest?: (message: string, selectedText: string) => void;
  aiMode?: "assist" | "chat" | "both";
  aiAssistText?: string;
}

export const SelectionToolbar = ({
  onAiChatRequest,
  aiMode = "assist",
  aiAssistText,
}: SelectionToolbarProps) => {
  const { editor } = useTiptapEditor();
  const isMobile = useIsMobile(480);
  const { shouldShow } = useFloatingToolbarVisibility({
    editor,
    isSelectionValid,
  });
  const { isInLink, isEditing, startEditing, stopEditing } = useLinkEditing({
    editor,
  });
  const {
    state: { isOpen: isAiAssistOpen },
  } = useAiAssist(editor);

  const shouldShowToolbar =
    shouldShow && !isEditing && !isInLink && !isAiAssistOpen;
  const shouldShowLinkEditor =
    (shouldShow || isInLink) && isEditing && !isAiAssistOpen;

  if (isMobile || !editor || !editor.isEditable) {
    return null;
  }

  return (
    <>
      <FloatingElement shouldShow={shouldShowToolbar} placement="bottom">
        <TiptapToolbar variant="floating">
          <TiptapToolbarGroup>
            {(aiMode === "assist" || aiMode === "both") && (
              <AiAssistButton text={aiAssistText} />
            )}
            {(aiMode === "chat" || aiMode === "both") && onAiChatRequest && (
              <AiChatButton onChatRequest={onAiChatRequest} />
            )}
          </TiptapToolbarGroup>

          <TiptapToolbarSeparator />

          <TiptapToolbarGroup>
            <MarkButton type="bold" hideWhenUnavailable />
            <MarkButton type="italic" hideWhenUnavailable />
            <MarkButton type="underline" hideWhenUnavailable />
          </TiptapToolbarGroup>

          <TiptapToolbarSeparator />

          <TiptapToolbarGroup>
            <MoreOptions onLinkClick={startEditing} />
          </TiptapToolbarGroup>
        </TiptapToolbar>
      </FloatingElement>

      <FloatingElement shouldShow={shouldShowLinkEditor} placement="bottom">
        <TiptapToolbar variant="floating">
          <LinkPopoverContent onClose={stopEditing} />
        </TiptapToolbar>
      </FloatingElement>
    </>
  );
};
