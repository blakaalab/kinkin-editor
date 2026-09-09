"use client";

import { useState } from "react";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/**
 * Tracks the rendered width of an element. Toolbars use it to lay themselves
 * out against the space they actually have — the editor is often embedded in a
 * pane much narrower than the screen, so the viewport is the wrong yardstick.
 *
 * Returns a callback ref so the measurement starts as soon as the element
 * mounts, however late that is, and a layout effect does the first read so the
 * initial paint already uses the real width.
 */
export function useContainerWidth<T extends HTMLElement = HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const [width, setWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
    if (!element) {
      setWidth(0);
      return;
    }

    const measure = () => {
      setWidth(element.getBoundingClientRect().width);
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    // Measuring straight from the callback rather than a rAF: React renders the
    // new width asynchronously, so this cannot re-enter the observer, and a
    // frame callback would never run while the tab is hidden — leaving the
    // toolbar laid out for a width it no longer has.
    const observer = new ResizeObserver(measure);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element]);

  return { ref: setElement, width };
}
