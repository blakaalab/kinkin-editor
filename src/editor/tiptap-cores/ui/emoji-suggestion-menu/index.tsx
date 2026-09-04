import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import type { EmojiItem } from "@tiptap/extension-emoji";
import type { Transaction } from "@tiptap/pm/state";
import type { Editor, Range } from "@tiptap/react";

import { Card, CardContent } from "@/components/ui/card";
import { getElementOverflowPosition } from "@/editor/tiptap-cores/lib/tiptap-utils";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import {
  type SuggestionItem,
  SuggestionMenu,
  type SuggestionMenuProps,
  type SuggestionMenuRenderProps,
} from "@/editor/tiptap-cores/ui/suggestion-menu";

import {
  getFilteredEmojis,
  isColonJustInserted,
  wasSpaceJustTyped,
} from "./emoji-suggestion-menu-utils";

type EmojiSuggestionMenuProps = Omit<SuggestionMenuProps, "items" | "children">;

export const EmojiSuggestionMenu = (props: EmojiSuggestionMenuProps) => {
  const dismissedPositionsRef = useRef<Set<number>>(new Set());
  const isMenuActiveRef = useRef(false);
  const activeColonPosRef = useRef<number | null>(null);
  const lastDocSizeRef = useRef<number>(0);
  const closedDueToQueryLengthRef = useRef(false);

  const handleMenuExit = useCallback((range: Range | null) => {
    if (
      range &&
      isMenuActiveRef.current &&
      !closedDueToQueryLengthRef.current
    ) {
      dismissedPositionsRef.current.add(range.from);
    }
    isMenuActiveRef.current = false;
    activeColonPosRef.current = null;
    closedDueToQueryLengthRef.current = false;
  }, []);

  const handleMenuStart = useCallback((range: Range) => {
    isMenuActiveRef.current = true;
    activeColonPosRef.current = range.from;
    dismissedPositionsRef.current.delete(range.from);
  }, []);

  const shouldShow = useCallback(
    ({
      transaction,
      range,
      query,
    }: {
      transaction: Transaction;
      range: Range;
      query: string;
    }) => {
      const colonPos = range.from;
      const currentDocSize = transaction.doc.content.size;

      // Clear stale dismissed positions when doc changes significantly
      if (
        transaction.docChanged &&
        Math.abs(currentDocSize - lastDocSizeRef.current) > 1
      ) {
        dismissedPositionsRef.current.clear();
      }
      lastDocSizeRef.current = currentDocSize;

      // Fresh ":" typed - allow re-showing at this position
      if (isColonJustInserted(transaction, colonPos)) {
        dismissedPositionsRef.current.delete(colonPos);
      }

      // Require at least 1 character after ":"
      if (query.length < 1) {
        closedDueToQueryLengthRef.current = isMenuActiveRef.current;
        return false;
      }
      closedDueToQueryLengthRef.current = false;

      // Active session: keep showing unless space typed (ends search)
      if (isMenuActiveRef.current && activeColonPosRef.current === colonPos) {
        return !(transaction.docChanged && wasSpaceJustTyped(transaction));
      }

      // Typing: show unless dismissed. Cursor movement: never auto-show
      if (transaction.docChanged) {
        return !dismissedPositionsRef.current.has(colonPos);
      }

      return false;
    },
    [],
  );

  return (
    <SuggestionMenu
      char=":"
      maxHeight={218}
      pluginKey="emojiSuggestionMenu"
      decorationClass="tiptap-emoji-decoration"
      selector="tiptap-emoji-suggestion-menu"
      items={getSuggestionItems}
      shouldShow={shouldShow}
      onSuggestionStart={handleMenuStart}
      onSuggestionExit={handleMenuExit}
      orientation="grid"
      columns={9}
      {...props}
    >
      {(renderProps) => <EmojiList {...renderProps} />}
    </SuggestionMenu>
  );
};

const getSuggestionItems = async (props: { query: string; editor: Editor }) => {
  const emojis: EmojiItem[] = props.editor.extensionStorage.emoji.emojis || [];
  const filteredEmojis = getFilteredEmojis({ query: props.query, emojis });

  return filteredEmojis.map(
    (emoji): SuggestionItem => ({
      title: emoji.name,
      subtext: emoji.shortcodes.join(", "),
      context: emoji,
      onSelect: (selectProps: {
        editor: Editor;
        range: Range;
        context?: EmojiItem;
      }) => {
        if (!selectProps.editor || !selectProps.range || !selectProps.context)
          return;
        selectProps.editor
          .chain()
          .focus()
          .setEmoji(selectProps.context.name)
          .run();
      },
    }),
  );
};

const EmojiMenuItem = (props: {
  emoji: EmojiItem;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  selector: string;
}) => {
  const { emoji, isSelected, onSelect, onHover, selector } = props;
  const itemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const menuElement = document.querySelector(selector) as HTMLElement;
    if (!itemRef.current || !isSelected || !menuElement) return;

    const overflow = getElementOverflowPosition(itemRef.current, menuElement);
    if (overflow === "top") {
      itemRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (overflow === "bottom") {
      itemRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isSelected, selector]);

  if (!emoji) return null;

  return (
    <TiptapButton
      ref={itemRef}
      isFocused={isSelected}
      onClick={onSelect}
      onMouseMove={onHover}
      className="p-0! justify-center!"
    >
      {emoji.fallbackImage ? (
        <img className="w-6" src={emoji.fallbackImage} alt={emoji.name} />
      ) : (
        <span className="text-2xl">{emoji.emoji}</span>
      )}
    </TiptapButton>
  );
};

const EmojiList = ({
  items,
  selectedIndex,
  onSelect,
  onItemHover,
  onMouseLeave,
}: SuggestionMenuRenderProps<EmojiItem>) => {
  const renderedItems = useMemo(() => {
    const rendered: ReactElement[] = [];

    items.forEach((item, index) => {
      if (!item.context) return;

      rendered.push(
        <EmojiMenuItem
          key={item.title}
          emoji={item.context}
          isSelected={index === selectedIndex}
          onSelect={() => onSelect(item)}
          onHover={() => onItemHover(index)}
          selector="[data-emoji-menu-list]"
        />,
      );
    });

    return rendered;
  }, [items, selectedIndex, onSelect, onItemHover]);

  if (!renderedItems.length) {
    return null;
  }

  return (
    <Card
      style={{
        maxHeight: "var(--suggestion-menu-max-height)",
      }}
      className="p-0 py-1.5 max-w-82.5"
    >
      <CardContent
        data-emoji-menu-list
        className="py-0 px-1.5 overflow-y-auto"
        onMouseLeave={onMouseLeave}
      >
        <div className="flex flex-wrap gap-0.5">{renderedItems}</div>
      </CardContent>
    </Card>
  );
};
