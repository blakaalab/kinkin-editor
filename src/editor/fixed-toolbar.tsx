import { useCallback, useState } from "react";

import {
  ChevronDown,
  ImageIcon,
  Link2,
  Redo2,
  Table2,
  Undo2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
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
import { LinkPopoverContent } from "@/editor/tiptap-cores/ui/link";
import { useList } from "@/editor/tiptap-cores/ui/list-button/use-list";
import { MarkButton } from "@/editor/tiptap-cores/ui/mark-button";
import { useParagraph } from "@/editor/tiptap-cores/ui/paragraph-button/use-paragraph";
import { SlashCommandTriggerButton } from "@/editor/tiptap-cores/ui/slash-command-suggestion-menu/slash-command-trigger-button";

const BlockTypeMenu = () => {
  const { editor } = useTiptapEditor();
  const paragraph = useParagraph({ hideWhenUnavailable: true });
  const h1 = useHeading({ level: 1, hideWhenUnavailable: true });
  const h2 = useHeading({ level: 2, hideWhenUnavailable: true });
  const h3 = useHeading({ level: 3, hideWhenUnavailable: true });
  const h4 = useHeading({ level: 4, hideWhenUnavailable: true });

  const items = [paragraph, h1, h2, h3, h4].filter((item) => item.isVisible);
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
      placement="bottom"
      onOpenChange={handleOpenChange}
      trigger={
        <TiptapMenuButton
          render={
            <TiptapButton
              tooltip="Block type"
              isToggled={items.some(
                (item) => item !== paragraph && item.isActive,
              )}
            >
              <ActiveIcon className="size-4" />
              <span className="text-xs">{activeItem.label}</span>
              <ChevronDown className="size-3" />
            </TiptapButton>
          }
        />
      }
    >
      <TiptapMenuContent portal autoFocusOnShow={false} autoFocusOnHide={false}>
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
      placement="bottom"
      onOpenChange={handleOpenChange}
      trigger={
        <TiptapMenuButton
          render={
            <TiptapButton
              tooltip="Lists"
              isToggled={items.some((item) => item.isActive)}
            >
              <ActiveIcon className="size-4" />
              <ChevronDown className="size-3" />
            </TiptapButton>
          }
        />
      }
    >
      <TiptapMenuContent portal autoFocusOnShow={false} autoFocusOnHide={false}>
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

const LinkMenu = () => {
  const { editor } = useTiptapEditor();
  const [open, setOpen] = useState(false);

  if (!editor?.isEditable) {
    return null;
  }

  return (
    <TiptapMenu
      open={open}
      onOpenChange={setOpen}
      placement="bottom"
      trigger={
        <TiptapMenuButton
          render={
            <TiptapButton tooltip="Link" isToggled={editor.isActive("link")}>
              <Link2 className="size-4" />
            </TiptapButton>
          }
        />
      }
    >
      <TiptapMenuContent portal>
        <Card className="p-1.5">
          <CardContent className="p-0">
            <LinkPopoverContent onClose={() => setOpen(false)} />
          </CardContent>
        </Card>
      </TiptapMenuContent>
    </TiptapMenu>
  );
};

const HistoryButtons = () => {
  const { editor } = useTiptapEditor();

  if (!editor?.isEditable) {
    return null;
  }

  return (
    <>
      <TiptapButton
        tooltip="Undo"
        shortcutKeys="mod+z"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="size-4" />
      </TiptapButton>
      <TiptapButton
        tooltip="Redo"
        shortcutKeys="mod+shift+z"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="size-4" />
      </TiptapButton>
    </>
  );
};

const InsertButtons = () => {
  const { editor } = useTiptapEditor();

  if (!editor?.isEditable) {
    return null;
  }

  return (
    <>
      <TiptapButton
        tooltip="Insert table"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <Table2 className="size-4" />
      </TiptapButton>
      <TiptapButton
        tooltip="Insert image"
        onClick={() => editor.chain().focus().insertImagePlaceholder().run()}
      >
        <ImageIcon className="size-4" />
      </TiptapButton>
    </>
  );
};

interface FixedToolbarProps {
  /** Show the AI Assist button. Requires `streamCompletion` on the editor. */
  showAiAssist?: boolean;
  className?: string;
}

/**
 * A persistent, always-visible toolbar covering the editor's full formatting
 * surface. Render it via the `toolbar` slot on `RichTextEditor` so it sits
 * inside the editor context.
 */
export const FixedToolbar = ({
  showAiAssist = false,
  className,
}: FixedToolbarProps) => {
  const { editor } = useTiptapEditor();

  if (!editor?.isEditable) {
    return null;
  }

  return (
    <TiptapToolbar
      variant="floating"
      className={className}
      style={{ borderRadius: 0, borderWidth: 0, boxShadow: "none" }}
    >
      <TiptapToolbarGroup>
        <HistoryButtons />
      </TiptapToolbarGroup>

      <TiptapToolbarSeparator />

      <TiptapToolbarGroup>
        <BlockTypeMenu />
        <ListMenu />
      </TiptapToolbarGroup>

      <TiptapToolbarSeparator />

      <TiptapToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="underline" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
      </TiptapToolbarGroup>

      <TiptapToolbarSeparator />

      <TiptapToolbarGroup>
        <BlockquoteButton />
        <CodeBlockButton />
        <HorizontalRuleButton />
        <LinkMenu />
      </TiptapToolbarGroup>

      <TiptapToolbarSeparator />

      <TiptapToolbarGroup>
        <InsertButtons />
      </TiptapToolbarGroup>

      <TiptapToolbarSeparator />

      <TiptapToolbarGroup>
        <SlashCommandTriggerButton />
        {showAiAssist && <AiAssistButton />}
      </TiptapToolbarGroup>
    </TiptapToolbar>
  );
};
