import {
  type FC,
  type MemoExoticComponent,
  type ReactElement,
  type ReactNode,
  type SVGProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { UseFloatingOptions } from "@floating-ui/react";
import { flip, offset, shift, size } from "@floating-ui/react";
import { PluginKey } from "@tiptap/pm/state";
import type { Editor, Range } from "@tiptap/react";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import { Suggestion, SuggestionPluginKey } from "@tiptap/suggestion";

import { useFloatingElement } from "@/editor/tiptap-cores/hooks/use-floating-element";
import { useMenuNavigation } from "@/editor/tiptap-cores/hooks/use-menu-navigation";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";

import { calculateStartPosition } from "./suggestion-menu-utils";

type IconProps = SVGProps<SVGSVGElement>;
type IconComponent = ({ className, ...props }: IconProps) => ReactElement;

// biome-ignore lint/suspicious/noExplicitAny: generic default for flexible consumer usage
export interface SuggestionItem<T = any> {
  title: string;
  subtext?: string;
  badge?: MemoExoticComponent<IconComponent> | FC<IconProps> | string;
  group?: string;
  keywords?: string[];
  aliases?: string[];
  context?: T;
  onSelect: (props: { editor: Editor; range: Range; context?: T }) => void;
}

// biome-ignore lint/suspicious/noExplicitAny: generic default for flexible consumer usage
export interface SuggestionMenuRenderProps<T = any> {
  items: SuggestionItem<T>[];
  query: string;
  selectedIndex?: number;
  activeStateIndex?: number;
  onSelect: (item: SuggestionItem<T>) => void;
  onItemHover: (index: number) => void;
  onMouseLeave: () => void;
}

// biome-ignore lint/suspicious/noExplicitAny: generic default for flexible consumer usage
export interface SuggestionMenuProps<T = any>
  extends Omit<SuggestionOptions<SuggestionItem<T>>, "pluginKey" | "editor"> {
  editor?: Editor | null;
  floatingOptions?: Partial<UseFloatingOptions>;
  selector?: string;
  pluginKey?: string | PluginKey;
  maxHeight?: number;
  children: (props: SuggestionMenuRenderProps<T>) => ReactNode;
  onSuggestionStart?: (range: Range) => void;
  onSuggestionExit?: (range: Range | null) => void;
  orientation?: "horizontal" | "vertical" | "both" | "grid";
  columns?: number;
  getInitialSelectedIndex?: (
    items: SuggestionItem<T>[],
    editor: Editor,
  ) => number | undefined;
}

export const SuggestionMenu = ({
  editor: providedEditor,
  floatingOptions,
  selector = "tiptap-suggestion-menu",
  children,
  maxHeight = 384,
  pluginKey = SuggestionPluginKey,
  onSuggestionStart,
  onSuggestionExit,
  orientation = "vertical",
  columns = 1,
  getInitialSelectedIndex,
  ...internalSuggestionProps
}: SuggestionMenuProps) => {
  const { editor } = useTiptapEditor(providedEditor);

  const [show, setShow] = useState<boolean>(false);
  const [internalClientRect, setInternalClientRect] = useState<DOMRect | null>(
    null,
  );
  const [internalCommand, setInternalCommand] = useState<
    ((item: SuggestionItem) => void) | null
  >(null);
  const [internalItems, setInternalItems] = useState<SuggestionItem[]>([]);
  const [internalQuery, setInternalQuery] = useState<string>("");
  const [, setInternalRange] = useState<Range | null>(null);

  const { ref, style, getFloatingProps, isMounted } = useFloatingElement(
    show,
    internalClientRect,
    1000,
    {
      placement: "bottom-start",
      middleware: [
        offset(10),
        flip({
          mainAxis: true,
          crossAxis: false,
        }),
        shift(),
        size({
          apply({ availableHeight, elements }) {
            if (elements.floating) {
              const maxHeightValue = maxHeight
                ? Math.min(maxHeight, availableHeight)
                : availableHeight;

              elements.floating.style.setProperty(
                "--suggestion-menu-max-height",
                `${maxHeightValue}px`,
              );
            }
          },
        }),
      ],
      onOpenChange(open) {
        if (!open) {
          setShow(false);
        }
      },
      ...floatingOptions,
    },
  );

  const internalSuggestionPropsRef = useRef(internalSuggestionProps);
  const onSuggestionStartRef = useRef(onSuggestionStart);
  const onSuggestionExitRef = useRef(onSuggestionExit);
  const currentRangeRef = useRef<Range | null>(null);

  const resolvedPluginKeyRef = useRef<PluginKey>(
    pluginKey instanceof PluginKey ? pluginKey : new PluginKey(pluginKey),
  );

  useEffect(() => {
    internalSuggestionPropsRef.current = internalSuggestionProps;
  }, [internalSuggestionProps]);

  useEffect(() => {
    onSuggestionStartRef.current = onSuggestionStart;
  }, [onSuggestionStart]);

  useEffect(() => {
    onSuggestionExitRef.current = onSuggestionExit;
  }, [onSuggestionExit]);

  const editorRef = useRef(editor);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const showRef = useRef(show);

  useLayoutEffect(() => {
    showRef.current = show;
  }, [show]);

  const closePopup = useCallback(() => {
    if (!showRef.current) {
      return;
    }

    showRef.current = false;
    setShow(false);
    onSuggestionExitRef.current?.(currentRangeRef.current);
    currentRangeRef.current = null;
    editorRef.current?.commands.focus();
  }, []);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showRef.current) {
        e.preventDefault();
        e.stopPropagation();
        closePopup();
      }
    };

    window.addEventListener("keydown", handleEscapeKey, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleEscapeKey, { capture: true });
    };
  }, [closePopup]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const existingPlugin = editor.state.plugins.find(
      (plugin) => plugin.spec.key === pluginKey,
    );

    if (existingPlugin) {
      editor.unregisterPlugin(pluginKey);
    }

    const suggestion = Suggestion({
      pluginKey: resolvedPluginKeyRef.current,
      editor,

      command({ editor, range, props }) {
        if (!range) {
          return;
        }

        const { view, state } = editor;
        const { selection } = state;

        const isMention = editor.extensionManager.extensions.some(
          (extension) => {
            const name = extension.name;
            return (
              name === "mention" &&
              extension.options?.suggestion?.char ===
                internalSuggestionPropsRef.current.char
            );
          },
        );

        if (!isMention) {
          const cursorPosition = selection.$from.pos;
          const previousNode = selection.$head?.nodeBefore;

          const startPosition = previousNode
            ? calculateStartPosition(
                cursorPosition,
                previousNode,
                internalSuggestionPropsRef.current.char,
              )
            : selection.$from.start();

          const transaction = state.tr.deleteRange(
            startPosition,
            cursorPosition,
          );
          view.dispatch(transaction);
        }

        const nodeAfter = view.state.selection.$to.nodeAfter;
        const overrideSpace = nodeAfter?.text?.startsWith(" ");
        const rangeToUse = { ...range };

        if (overrideSpace) {
          rangeToUse.to += 1;
        }

        props.onSelect({ editor, range: rangeToUse, context: props.context });
      },

      render: () => {
        return {
          onStart: (props: SuggestionProps<SuggestionItem>) => {
            showRef.current = true;
            setInternalCommand(() => props.command);
            setInternalItems(props.items);
            setInternalQuery(props.query);
            setInternalRange(props.range);
            setInternalClientRect(props.clientRect?.() ?? null);
            setShow(true);
            currentRangeRef.current = props.range;
            onSuggestionStartRef.current?.(props.range);
          },

          onUpdate: (props: SuggestionProps<SuggestionItem>) => {
            setInternalCommand(() => props.command);
            setInternalItems(props.items);
            setInternalQuery(props.query);
            setInternalRange(props.range);
            setInternalClientRect(props.clientRect?.() ?? null);
            currentRangeRef.current = props.range;
          },

          onExit: () => {
            showRef.current = false;
            const exitRange = currentRangeRef.current;
            setInternalCommand(null);
            setInternalItems([]);
            setInternalQuery("");
            setInternalRange(null);
            setInternalClientRect(null);
            setShow(false);
            onSuggestionExitRef.current?.(exitRange);
            currentRangeRef.current = null;
          },
        };
      },

      ...internalSuggestionPropsRef.current,
    });

    editor.registerPlugin(suggestion);

    return () => {
      if (!editor.isDestroyed) {
        editor.unregisterPlugin(pluginKey);
      }
    };
  }, [editor, pluginKey, closePopup]);

  const onSelect = useCallback(
    (item: SuggestionItem) => {
      closePopup();

      if (internalCommand) {
        internalCommand(item);
      }
    },
    [closePopup, internalCommand],
  );

  const initialSelectedIndex = useMemo(() => {
    if (!editor || !internalItems.length || !getInitialSelectedIndex) {
      return undefined;
    }

    return getInitialSelectedIndex(internalItems, editor);
  }, [editor, internalItems, getInitialSelectedIndex]);

  const {
    selectedIndex,
    isKeyboardActive,
    isCursorHidden,
    handleItemHover,
    handleMouseLeave,
  } = useMenuNavigation({
    editor: editor,
    query: internalQuery,
    items: internalItems,
    onSelect,
    orientation,
    columns,
    initialSelectedIndex,
  });

  if (!isMounted || !show || !editor) {
    return null;
  }

  return (
    <div
      ref={ref}
      style={style}
      {...getFloatingProps()}
      data-selector={selector}
      data-keyboard-active={isKeyboardActive || undefined}
      data-cursor-hidden={isCursorHidden || undefined}
      className="group/keyboard tiptap-suggestion-menu"
      role="listbox"
      aria-label="Suggestions"
      onPointerDown={(e) => e.preventDefault()}
    >
      {children({
        items: internalItems,
        query: internalQuery,
        selectedIndex,
        activeStateIndex: initialSelectedIndex,
        onSelect,
        onItemHover: handleItemHover,
        onMouseLeave: handleMouseLeave,
      })}
    </div>
  );
};
