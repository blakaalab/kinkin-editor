import {
  type CSSProperties,
  type HTMLProps,
  useLayoutEffect,
  useMemo,
} from "react";

import type { UseDismissProps, UseFloatingOptions } from "@floating-ui/react";
import {
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";

interface FloatingElementReturn {
  isMounted: boolean;
  ref: (node: HTMLElement | null) => void;
  style: CSSProperties;
  update: () => void;
  getFloatingProps: (
    userProps?: HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
  getReferenceProps: (
    userProps?: HTMLProps<Element>,
  ) => Record<string, unknown>;
}

export function useFloatingElement(
  show: boolean,
  referencePos: DOMRect | null,
  zIndex: number,
  options?: Partial<UseFloatingOptions & { dismissOptions?: UseDismissProps }>,
): FloatingElementReturn {
  const { dismissOptions, ...floatingOptions } = options || {};

  const { refs, update, context, floatingStyles } = useFloating({
    open: show,
    ...floatingOptions,
  });

  const { isMounted, styles } = useTransitionStyles(context);

  const dismiss = useDismiss(context, {
    ...dismissOptions,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  useLayoutEffect(() => {
    if (referencePos === null) {
      return;
    }

    refs.setReference({
      getBoundingClientRect: () => referencePos,
    });
    update();
  }, [referencePos, refs, update]);

  return useMemo(
    () => ({
      isMounted,
      ref: refs.setFloating,
      style: {
        ...styles,
        ...floatingStyles,
        zIndex,
      },
      update,
      getFloatingProps,
      getReferenceProps,
    }),
    [
      floatingStyles,
      isMounted,
      refs.setFloating,
      styles,
      update,
      zIndex,
      getFloatingProps,
      getReferenceProps,
    ],
  );
}
