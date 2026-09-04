import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import type { Transaction } from "@tiptap/pm/state";
import type { Editor, Range } from "@tiptap/react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getElementOverflowPosition } from "@/editor/tiptap-cores/lib/tiptap-utils";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import {
  type SuggestionItem,
  SuggestionMenu,
  type SuggestionMenuProps,
  type SuggestionMenuRenderProps,
} from "@/editor/tiptap-cores/ui/suggestion-menu";
import { filterSuggestionItems } from "@/editor/tiptap-cores/ui/suggestion-menu/suggestion-menu-utils";

import type { SlashMenuConfig } from "./slash-command-suggestion-menu-utils";
import {
  getCurrentNodeTitle,
  getSlashMenuItems,
  isSlashJustInserted,
  wasSpaceJustTyped,
} from "./slash-command-suggestion-menu-utils";

interface SlashCommandSuggestionMenuProps
  extends Omit<SuggestionMenuProps, "items" | "children"> {
  config?: SlashMenuConfig;
}

export const SlashCommandSuggestionMenu = (
  props: SlashCommandSuggestionMenuProps,
) => {
  const { config, ...restProps } = props;

  const dismissedPositionsRef = useRef<Set<number>>(new Set());
  const isMenuActiveRef = useRef(false);
  const activeSlashPosRef = useRef<number | null>(null);
  const lastDocSizeRef = useRef<number>(0);

  const handleMenuExit = useCallback((range: Range | null) => {
    if (range && isMenuActiveRef.current) {
      dismissedPositionsRef.current.add(range.from);
    }

    isMenuActiveRef.current = false;
    activeSlashPosRef.current = null;
  }, []);

  const handleMenuStart = useCallback((range: Range) => {
    isMenuActiveRef.current = true;
    activeSlashPosRef.current = range.from;
    dismissedPositionsRef.current.delete(range.from);
  }, []);

  const getInitialSelectedIndex = useCallback(
    (items: SuggestionItem[], editor: Editor) => {
      const currentTitle = getCurrentNodeTitle(editor);

      if (!currentTitle) {
        return 0;
      }

      const index = items.findIndex((item) => item.title === currentTitle);

      return index >= 0 ? index : undefined;
    },
    [],
  );

  const shouldShow = useCallback(
    ({ transaction, range }: { transaction: Transaction; range: Range }) => {
      const slashPos = range.from;
      const currentDocSize = transaction.doc.content.size;

      // Don't show inside blockquote or codeBlock or table
      const $pos = transaction.doc.resolve(slashPos);
      for (let depth = $pos.depth; depth > 0; depth--) {
        const node = $pos.node(depth);
        if (
          node.type.name === "blockquote" ||
          node.type.name === "codeBlock" ||
          node.type.name === "table"
        ) {
          return false;
        }
      }

      // Clear stale dismissed positions when doc changes significantly
      if (
        transaction.docChanged &&
        Math.abs(currentDocSize - lastDocSizeRef.current) > 1
      ) {
        dismissedPositionsRef.current.clear();
      }
      lastDocSizeRef.current = currentDocSize;

      // Fresh "/" typed: start new session (check this FIRST to win race conditions)
      if (isSlashJustInserted(transaction, slashPos)) {
        dismissedPositionsRef.current.delete(slashPos);
        isMenuActiveRef.current = true;
        activeSlashPosRef.current = slashPos;
        return true;
      }

      // Active session: keep showing unless space typed
      if (isMenuActiveRef.current && activeSlashPosRef.current === slashPos) {
        return !(transaction.docChanged && wasSpaceJustTyped(transaction));
      }

      // Typing: show unless dismissed. Cursor movement: never auto-show
      if (transaction.docChanged) {
        return !dismissedPositionsRef.current.has(slashPos);
      }

      return false;
    },
    [],
  );

  return (
    <SuggestionMenu
      char="/"
      maxHeight={205}
      pluginKey="slashCommandSuggestionMenu"
      decorationClass="bg-gray-200 px-1 py-0.5 rounded-sm after:text-gray-500 tiptap-core-slash-decoration"
      decorationContent="Type to search"
      selector="tiptap-slash-command-suggestion-menu"
      items={({ query, editor }) =>
        filterSuggestionItems(getSlashMenuItems(editor, config), query)
      }
      shouldShow={shouldShow}
      onSuggestionStart={handleMenuStart}
      onSuggestionExit={handleMenuExit}
      getInitialSelectedIndex={getInitialSelectedIndex}
      {...restProps}
    >
      {(renderProps) => <SlashMenuList {...renderProps} />}
    </SuggestionMenu>
  );
};

type SlashMenuItem = SuggestionItem & { shortcut?: string; section?: number };

const SlashMenuItemButton = (props: {
  item: SlashMenuItem;
  isSelected: boolean;
  isActiveState: boolean;
  onSelect: () => void;
  onHover: () => void;
}) => {
  const { item, isSelected, isActiveState, onSelect, onHover } = props;
  const itemRef = useRef<HTMLButtonElement>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (!isSelected) {
      hasScrolledRef.current = false;

      return;
    }

    const scrollToItem = () => {
      const scrollContainer = document.querySelector(
        "[data-slash-menu-list]",
      ) as HTMLElement;

      if (!itemRef.current || !scrollContainer) {
        return;
      }

      const overflow = getElementOverflowPosition(
        itemRef.current,
        scrollContainer,
      );

      if (overflow === "top" || overflow === "bottom") {
        const behavior = hasScrolledRef.current ? "smooth" : "instant";
        itemRef.current.scrollIntoView({
          behavior,
          block: overflow === "top" ? "start" : "end",
        });
        hasScrolledRef.current = true;
      }
    };

    requestAnimationFrame(scrollToItem);
  }, [isSelected]);

  const BadgeIcon = item.badge;

  return (
    <TiptapButton
      ref={itemRef}
      className="w-full justify-between!"
      isToggled={isActiveState}
      isFocused={isSelected}
      onClick={onSelect}
      onMouseMove={onHover}
    >
      <span className="flex items-center gap-2">
        {BadgeIcon && <BadgeIcon className="size-4" />}
        <span>{item.title}</span>
      </span>
      {item.shortcut && (
        <span className="text-xs text-muted-foreground font-mono">
          {item.shortcut}
        </span>
      )}
    </TiptapButton>
  );
};

const SlashMenuList = ({
  items,
  query,
  selectedIndex,
  activeStateIndex,
  onSelect,
  onItemHover,
  onMouseLeave,
}: SuggestionMenuRenderProps) => {
  const handleClose = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  }, []);

  const isFiltering = query.length > 0;

  const renderedItems = useMemo(() => {
    const rendered: ReactElement[] = [];
    let currentSection: number | undefined;

    (items as SlashMenuItem[]).forEach((item, index) => {
      if (
        !isFiltering &&
        item.section !== currentSection &&
        currentSection !== undefined
      ) {
        rendered.push(
          <Separator
            // biome-ignore lint/suspicious/noArrayIndexKey: separators are positional by nature
            key={`separator-${index}`}
            orientation="horizontal"
            className="my-1.5"
          />,
        );
      }
      currentSection = item.section;

      rendered.push(
        <SlashMenuItemButton
          // biome-ignore lint/suspicious/noArrayIndexKey: key is disambiguated by item title
          key={`item-${index}-${item.title}`}
          item={item}
          isSelected={index === selectedIndex}
          isActiveState={index === activeStateIndex}
          onSelect={() => onSelect(item)}
          onHover={() => onItemHover(index)}
        />,
      );
    });

    return rendered;
  }, [
    items,
    isFiltering,
    selectedIndex,
    activeStateIndex,
    onSelect,
    onItemHover,
  ]);

  if (!renderedItems.length) {
    return null;
  }

  return (
    <Card className="flex flex-col min-[480px]:w-60 gap-0 p-0 py-1.5">
      <CardContent
        data-slash-menu-list
        className="py-0 px-1.5 overflow-y-auto"
        style={{ maxHeight: "var(--suggestion-menu-max-height)" }}
        onMouseLeave={onMouseLeave}
      >
        {renderedItems}
      </CardContent>
      <Separator orientation="horizontal" className="my-1.5" />
      <div className="px-1.5">
        <TiptapButton className="w-full justify-between!" onClick={handleClose}>
          <span>Close menu</span>
          <span className="text-xs text-muted-foreground font-mono">esc</span>
        </TiptapButton>
      </div>
    </Card>
  );
};
