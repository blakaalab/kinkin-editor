import { useCallback, useEffect, useState } from "react";

import type { Editor } from "@tiptap/react";
import { ArrowLeft, ChevronDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/editor/tiptap-cores/hooks/use-mobile";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { AiAssistButton } from "@/editor/tiptap-cores/ui/ai-assist/ai-assist-button";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";
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
import { BlockquoteButton } from "@/editor/tiptap-cores/ui/blockquote-button";
import { CodeBlockButton } from "@/editor/tiptap-cores/ui/code-block-button";
import { useHeading } from "@/editor/tiptap-cores/ui/heading-button/use-heading";
import { HorizontalRuleButton } from "@/editor/tiptap-cores/ui/horizontal-rule-button";
import { LinkButton, LinkPopoverContent } from "@/editor/tiptap-cores/ui/link";
import { useList } from "@/editor/tiptap-cores/ui/list-button/use-list";
import { MarkButton } from "@/editor/tiptap-cores/ui/mark-button";
import { MoveNodeButton } from "@/editor/tiptap-cores/ui/move-node-button";
import { useParagraph } from "@/editor/tiptap-cores/ui/paragraph-button/use-paragraph";
import { SlashCommandTriggerButton } from "@/editor/tiptap-cores/ui/slash-command-suggestion-menu/slash-command-trigger-button";

const HeadingMenu = () => {
  const { editor } = useTiptapEditor();
  const paragraph = useParagraph({ hideWhenUnavailable: true });
  const h1 = useHeading({ level: 1, hideWhenUnavailable: true });
  const h2 = useHeading({ level: 2, hideWhenUnavailable: true });
  const h3 = useHeading({ level: 3, hideWhenUnavailable: true });

  const items = [paragraph, h1, h2, h3].filter((item) => item.isVisible);
  const activeItem = items.find((item) => item.isActive) || paragraph;

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && editor && !editor.isDestroyed) {
        requestAnimationFrame(() => editor.commands.focus());
      }
    },
    [editor],
  );

  if (items.length === 0) {
    return null;
  }

  const ActiveIcon = activeItem.Icon;

  return (
    <TiptapMenu
      placement="top"
      onOpenChange={handleOpenChange}
      trigger={
        <TiptapMenuButton
          render={
            <TiptapButton isToggled={h1.isActive || h2.isActive || h3.isActive}>
              <ActiveIcon className="size-4" />
              <ChevronDown className="size-3" />
            </TiptapButton>
          }
        />
      }
    >
      <TiptapMenuContent autoFocusOnHide={false} portal autoFocusOnShow={false}>
        <Card className="p-1.5">
          <CardContent className="p-0">
            <TiptapMenuGroup>
              {items.map((item) => {
                const Icon = item.Icon;
                return (
                  <TiptapMenuItem
                    key={item.label}
                    render={
                      <TiptapButton
                        isToggled={item.isActive}
                        isFocused={false}
                      />
                    }
                    onClick={item.handleToggle}
                    disabled={!item.canToggle}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </TiptapMenuItem>
                );
              })}
            </TiptapMenuGroup>
          </CardContent>
        </Card>
      </TiptapMenuContent>
    </TiptapMenu>
  );
};

const ListMenu = () => {
  const { editor } = useTiptapEditor();
  const bullet = useList({ type: "bulletList", hideWhenUnavailable: true });
  const ordered = useList({ type: "orderedList", hideWhenUnavailable: true });
  const task = useList({ type: "taskList", hideWhenUnavailable: true });

  const items = [bullet, ordered, task].filter((item) => item.isVisible);
  const activeItem = items.find((item) => item.isActive) || bullet;

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && editor && !editor.isDestroyed) {
        requestAnimationFrame(() => editor.commands.focus());
      }
    },
    [editor],
  );

  if (items.length === 0) {
    return null;
  }

  const ActiveIcon = activeItem.Icon;

  return (
    <TiptapMenu
      placement="top"
      onOpenChange={handleOpenChange}
      trigger={
        <TiptapMenuButton
          render={
            <TiptapButton
              isToggled={bullet.isActive || ordered.isActive || task.isActive}
            >
              <ActiveIcon className="size-4" />
              <ChevronDown className="size-3" />
            </TiptapButton>
          }
        />
      }
    >
      <TiptapMenuContent autoFocusOnHide={false} autoFocusOnShow={false} portal>
        <Card className="p-1.5">
          <CardContent className="p-0">
            <TiptapMenuGroup>
              {items.map((item) => {
                const Icon = item.Icon;
                return (
                  <TiptapMenuItem
                    key={item.label}
                    focusOnHover={false}
                    render={
                      <TiptapButton
                        isToggled={item.isActive}
                        isFocused={false}
                      />
                    }
                    onClick={item.handleToggle}
                    disabled={!item.canToggle}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </TiptapMenuItem>
                );
              })}
            </TiptapMenuGroup>
          </CardContent>
        </Card>
      </TiptapMenuContent>
    </TiptapMenu>
  );
};

const MainToolbarContent = ({ showLinkView }: { showLinkView: () => void }) => {
  const { editor } = useTiptapEditor();
  const hasSelection = editor?.isEditable && !editor.state.selection.empty;

  return (
    <>
      <TiptapToolbarGroup>
        <SlashCommandTriggerButton />
      </TiptapToolbarGroup>

      <TiptapToolbarSeparator />

      {hasSelection && (
        <>
          <TiptapToolbarGroup>
            <AiAssistButton />
          </TiptapToolbarGroup>

          <TiptapToolbarSeparator />
        </>
      )}

      <TiptapToolbarGroup>
        <HeadingMenu />
        <ListMenu />
        <CodeBlockButton hideWhenUnavailable />
        <BlockquoteButton hideWhenUnavailable />
      </TiptapToolbarGroup>

      {hasSelection && (
        <>
          <TiptapToolbarSeparator />

          <TiptapToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="underline" />
            <MarkButton type="strike" />
          </TiptapToolbarGroup>
        </>
      )}

      <TiptapToolbarSeparator />

      <TiptapToolbarGroup>
        <HorizontalRuleButton />
        {hasSelection && <LinkButton onClick={showLinkView} />}
      </TiptapToolbarGroup>

      <TiptapToolbarSeparator />

      <TiptapToolbarGroup>
        <MoveNodeButton direction="up" />
        <MoveNodeButton direction="down" />
      </TiptapToolbarGroup>
    </>
  );
};

export const MobileToolbar = ({
  editor: providedEditor,
}: {
  editor?: Editor | null;
}) => {
  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile(480);
  const [view, setView] = useState<"main" | "link">("main");

  useEffect(() => {
    if (!isMobile && view !== "main") {
      setView("main");
    }
  }, [isMobile, view]);

  if (!isMobile || !editor?.isEditable) {
    return null;
  }

  return (
    <TiptapToolbar className="overflow-y-hidden">
      {view === "main" ? (
        <MainToolbarContent showLinkView={() => setView("link")} />
      ) : (
        <>
          <TiptapToolbarGroup>
            <TiptapButton onClick={() => setView("main")}>
              <ArrowLeft className="size-4" />
            </TiptapButton>
          </TiptapToolbarGroup>
          <TiptapToolbarSeparator />
          <LinkPopoverContent />
        </>
      )}
    </TiptapToolbar>
  );
};
