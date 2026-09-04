import { type DependencyList, useMemo } from "react";

import { throttle } from "es-toolkit";

import { useUnmount } from "./use-unmount";

interface ThrottleSettings {
  leading?: boolean;
  trailing?: boolean;
}

const defaultOptions: ThrottleSettings = {
  leading: false,
  trailing: true,
};

// Convert lodash-style options to es-toolkit format
function convertToEdges(options: ThrottleSettings): {
  edges?: Array<"leading" | "trailing">;
} {
  const edges: Array<"leading" | "trailing"> = [];
  if (options.leading) edges.push("leading");
  if (options.trailing) edges.push("trailing");
  return edges.length > 0 ? { edges } : {};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait = 250,
  dependencies: DependencyList = [],
  options: ThrottleSettings = defaultOptions,
) {
  const handler = useMemo(
    () => throttle(fn, wait, convertToEdges(options)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  );

  useUnmount(() => {
    handler.cancel();
  });

  return handler;
}
