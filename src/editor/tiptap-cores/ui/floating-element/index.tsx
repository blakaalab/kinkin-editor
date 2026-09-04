import {
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  flip,
  offset,
  shift,
  type UseFloatingOptions,
  useMergeRefs,
} from "@floating-ui/react";
import type { Editor } from "@tiptap/react";

import { useFloatingElement } from "@/editor/tiptap-cores/hooks/use-floating-element";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import {
  getSelectionBoundingRect,
  isSelectionValid,
} from "@/editor/tiptap-cores/lib/tiptap-utils";

import { isElementWithinEditor } from "./floating-element-utils";
import { useFloatingElementEvents } from "./use-floating-element-events";

export interface FloatingElementProps extends HTMLAttributes<HTMLDivElement> {
  editor?: Editor | null;
  shouldShow?: boolean;
  floatingOptions?: Partial<UseFloatingOptions>;
  zIndex?: number;
  onOpenChange?: (open: boolean) => void;
  onRectChange?: (rect: DOMRect | null) => void;
  getBoundingClientRect?: (editor: Editor) => DOMRect | null;
  updateOnScroll?: boolean;
  closeOnEscape?: boolean;
  placement?: "top" | "bottom" | "left" | "right";
}

export const FloatingElement = forwardRef<HTMLDivElement, FloatingElementProps>(
  (
    {
      editor: providedEditor,
      shouldShow = undefined,
      floatingOptions,
      zIndex = 50,
      onOpenChange,
      onRectChange,
      getBoundingClientRect = getSelectionBoundingRect,
      updateOnScroll = true,
      closeOnEscape = true,
      placement = "top",
      children,
      style: propStyle,
      ...props
    },
    forwardedRef,
  ) => {
    const [open, setOpen] = useState<boolean>(
      shouldShow !== undefined ? shouldShow : false,
    );

    const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

    const floatingElementRef = useRef<HTMLDivElement | null>(null);
    const preventHideRef = useRef(false);
    const preventShowRef = useRef(false);
    const shouldShowRef = useRef(shouldShow);
    shouldShowRef.current = shouldShow;

    const { editor } = useTiptapEditor(providedEditor);

    const handleOpenChange = useCallback(
      (newOpen: boolean) => {
        onOpenChange?.(newOpen);
        setOpen(newOpen);
      },
      [onOpenChange],
    );

    const handleFloatingOpenChange = (open: boolean) => {
      if (!open && editor) {
        requestAnimationFrame(() => {
          editor.commands.setTextSelection(editor.state.selection.to);
          editor.commands.focus();
        });
      }

      handleOpenChange(open);
    };

    useEffect(() => {
      if (shouldShow !== undefined) {
        handleOpenChange(shouldShow);
      }
    }, [shouldShow, handleOpenChange]);

    useEffect(() => {
      onRectChange?.(selectionRect);
    }, [selectionRect, onRectChange]);

    const { isMounted, ref, style, getFloatingProps } = useFloatingElement(
      open,
      selectionRect,
      zIndex,
      {
        placement,
        middleware: [shift(), flip(), offset(8)],
        onOpenChange: handleFloatingOpenChange,
        dismissOptions: {
          enabled: true,
          escapeKey: true,
          outsidePress(event) {
            const relatedTarget = event.target as Node;

            if (!relatedTarget) {
              return false;
            }

            return !isElementWithinEditor(editor, relatedTarget);
          },
        },
        ...floatingOptions,
      },
    );

    const updateSelectionState = useCallback(() => {
      if (!editor) {
        return;
      }

      const newRect = getBoundingClientRect(editor);
      const currentShouldShow = shouldShowRef.current;

      if (
        newRect &&
        currentShouldShow !== undefined &&
        !preventShowRef.current
      ) {
        setSelectionRect(newRect);
        handleOpenChange(currentShouldShow);
        return;
      }

      const shouldShowResult = isSelectionValid(editor);

      if (
        newRect &&
        !preventShowRef.current &&
        (shouldShowResult || preventHideRef.current)
      ) {
        setSelectionRect(newRect);
        handleOpenChange(true);
      } else if (
        !preventHideRef.current &&
        (!shouldShowResult || preventShowRef.current || !editor.isEditable)
      ) {
        handleOpenChange(false);
      }
    }, [editor, getBoundingClientRect, handleOpenChange]);

    useFloatingElementEvents({
      editor,
      open,
      closeOnEscape,
      updateOnScroll,
      floatingElementRef,
      preventHideRef,
      preventShowRef,
      handleOpenChange,
      updateSelectionState,
    });

    const finalStyle = useMemo(
      () =>
        propStyle && Object.keys(propStyle).length > 0 ? propStyle : style,
      [propStyle, style],
    );

    const mergedRef = useMergeRefs([ref, forwardedRef, floatingElementRef]);

    if (!editor || !isMounted || !open) {
      return null;
    }

    return (
      <div
        ref={mergedRef}
        style={finalStyle}
        {...props}
        {...getFloatingProps()}
      >
        {children}
      </div>
    );
  },
);
