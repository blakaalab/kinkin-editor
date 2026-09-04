"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { Editor } from "@tiptap/react";

type Orientation = "horizontal" | "vertical" | "both" | "grid";

interface MenuNavigationOptions<T> {
  editor?: Editor | null;
  containerRef?: RefObject<HTMLElement | null>;
  query?: string;
  items: T[];
  onSelect?: (item: T) => void;
  onClose?: () => void;
  orientation?: Orientation;
  columns?: number;
  autoSelectFirstItem?: boolean;
  initialSelectedIndex?: number;
}

export function useMenuNavigation<T>({
  editor,
  containerRef,
  query,
  items,
  onSelect,
  onClose,
  orientation = "vertical",
  columns = 1,
  autoSelectFirstItem = true,
  initialSelectedIndex,
}: MenuNavigationOptions<T>) {
  const getDefaultIndex = () => {
    if (initialSelectedIndex !== undefined && initialSelectedIndex >= 0) {
      return initialSelectedIndex;
    }
    return autoSelectFirstItem ? 0 : -1;
  };

  const [selectedIndex, setSelectedIndex] = useState<number>(getDefaultIndex);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [isCursorHidden, setIsCursorHidden] = useState(true);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;

  const isKeyboardActiveRef = useRef(isKeyboardActive);
  isKeyboardActiveRef.current = isKeyboardActive;

  const lastHoveredIndexRef = useRef<number | null>(null);
  const hasAppliedInitialIndexRef = useRef(false);
  const initialMousePosRef = useRef<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (items.length === 0) {
      hasAppliedInitialIndexRef.current = false;
      lastHoveredIndexRef.current = null;
      setSelectedIndex(autoSelectFirstItem ? 0 : -1);
    }
    setIsCursorHidden(true);
    initialMousePosRef.current = null;
  }, [items.length, autoSelectFirstItem]);

  useEffect(() => {
    if (!isCursorHidden) return;

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;

      if (!initialMousePosRef.current) {
        initialMousePosRef.current = { x: clientX, y: clientY };
        return;
      }

      const dx = Math.abs(clientX - initialMousePosRef.current.x);
      const dy = Math.abs(clientY - initialMousePosRef.current.y);

      if (dx >= 5 || dy >= 5) {
        setIsCursorHidden(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isCursorHidden]);

  useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      const currentItems = itemsRef.current;
      if (!currentItems.length) return false;

      const isNavigationKey = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Home",
        "End",
      ].includes(event.key);

      if (isNavigationKey) {
        setIsKeyboardActive(true);
      }

      const moveNext = () =>
        setSelectedIndex((currentIndex) => {
          if (currentIndex === -1) return 0;
          return (currentIndex + 1) % currentItems.length;
        });

      const movePrev = () =>
        setSelectedIndex((currentIndex) => {
          if (currentIndex === -1) return currentItems.length - 1;
          return (currentIndex - 1 + currentItems.length) % currentItems.length;
        });

      const moveBy = (offset: number) =>
        setSelectedIndex((currentIndex) => {
          if (currentIndex === -1) return 0;
          const newIndex = currentIndex + offset;
          if (newIndex < 0 || newIndex >= currentItems.length)
            return currentIndex;
          return newIndex;
        });

      switch (event.key) {
        case "ArrowUp": {
          if (orientation === "horizontal") return false;
          event.preventDefault();
          if (orientation === "grid") {
            moveBy(-columns);
          } else {
            movePrev();
          }
          return true;
        }

        case "ArrowDown": {
          if (orientation === "horizontal") return false;
          event.preventDefault();
          if (orientation === "grid") {
            moveBy(columns);
          } else {
            moveNext();
          }
          return true;
        }

        case "ArrowLeft": {
          if (orientation === "vertical") return false;
          event.preventDefault();
          movePrev();
          return true;
        }

        case "ArrowRight": {
          if (orientation === "vertical") return false;
          event.preventDefault();
          moveNext();
          return true;
        }

        case "Tab": {
          event.preventDefault();
          if (event.shiftKey) {
            movePrev();
          } else {
            moveNext();
          }
          return true;
        }

        case "Home": {
          event.preventDefault();
          setSelectedIndex(0);
          return true;
        }

        case "End": {
          event.preventDefault();
          setSelectedIndex(currentItems.length - 1);
          return true;
        }

        case "Enter": {
          if (event.isComposing) return false;
          event.preventDefault();
          const idx = selectedIndexRef.current;
          if (idx !== -1 && currentItems[idx]) {
            onSelect?.(currentItems[idx]);
          }
          return true;
        }

        case "Escape": {
          event.preventDefault();
          onClose?.();
          return true;
        }

        default:
          return false;
      }
    };

    let targetElement: HTMLElement | null = null;

    if (editor) {
      targetElement = editor.view.dom;
    } else if (containerRef?.current) {
      targetElement = containerRef.current;
    }

    if (targetElement) {
      targetElement.addEventListener("keydown", handleKeyboardNavigation, true);

      return () => {
        targetElement?.removeEventListener(
          "keydown",
          handleKeyboardNavigation,
          true,
        );
      };
    }

    return undefined;
  }, [editor, containerRef, onSelect, onClose, orientation, columns]);

  useEffect(() => {
    if (query) {
      setSelectedIndex(autoSelectFirstItem ? 0 : -1);
    }
  }, [query, autoSelectFirstItem]);

  useLayoutEffect(() => {
    if (items.length > 0 && !hasAppliedInitialIndexRef.current) {
      hasAppliedInitialIndexRef.current = true;
      if (initialSelectedIndex !== undefined && initialSelectedIndex >= 0) {
        setSelectedIndex(initialSelectedIndex);
      }
    }
  }, [items.length, initialSelectedIndex]);

  const handleItemHover = useCallback((index: number) => {
    if (lastHoveredIndexRef.current === index) return;
    lastHoveredIndexRef.current = index;
    setIsKeyboardActive(false);
    setSelectedIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    lastHoveredIndexRef.current = null;
    setIsKeyboardActive(false);
    setSelectedIndex(-1);
  }, []);

  const getEffectiveSelectedIndex = (): number | undefined => {
    if (items.length === 0) return undefined;

    if (hasAppliedInitialIndexRef.current) {
      return selectedIndex;
    }

    if (initialSelectedIndex !== undefined && initialSelectedIndex >= 0) {
      return initialSelectedIndex;
    }

    return autoSelectFirstItem ? 0 : undefined;
  };

  return {
    selectedIndex: getEffectiveSelectedIndex(),
    setSelectedIndex,
    isKeyboardActive,
    isCursorHidden,
    handleItemHover,
    handleMouseLeave,
  };
}
