import {
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useState,
} from "react";

import * as Ariakit from "@ariakit/react";

const NAVIGATION_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

export const useTiptapKeyboardNavigation = () => {
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (NAVIGATION_KEYS.has(event.key)) {
      setIsKeyboardActive(true);
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    if (isKeyboardActive) {
      setIsKeyboardActive(false);
    }
  }, [isKeyboardActive]);

  return {
    isKeyboardActive,
    handlers: {
      onKeyDown: handleKeyDown,
      onMouseMove: handleMouseMove,
    },
  };
};

export const useTiptapMenuPlacement = (): string => {
  const store = Ariakit.useMenuStore();
  const currentPlacement = Ariakit.useStoreState(
    store,
    (state) => state.currentPlacement?.split("-")[0] || "bottom",
  );
  return currentPlacement;
};

export const useTiptapMenuItemClick = (
  menu?: Ariakit.MenuStore,
  preventClose?: boolean,
) =>
  useCallback(
    (event: MouseEvent<HTMLElement, globalThis.MouseEvent>) => {
      const expandable = event.currentTarget.hasAttribute("aria-expanded");

      if (expandable || preventClose) {
        return false;
      }

      menu?.hideAll();
      return false;
    },
    [menu, preventClose],
  );
