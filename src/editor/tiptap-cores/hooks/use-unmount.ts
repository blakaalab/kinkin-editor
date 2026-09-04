import { useEffect, useRef } from "react";

export const useUnmount = (callback: (...args: unknown[]) => unknown) => {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(
    () => () => {
      ref.current();
    },
    [],
  );
};
