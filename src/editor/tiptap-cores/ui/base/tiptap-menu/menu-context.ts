import { createContext, useContext } from "react";

interface TiptapMenuContextValue {
  isRootMenu: boolean;
  open: boolean;
}

export const TiptapSearchableContext = createContext<boolean>(false);

export const TiptapMenuContext = createContext<TiptapMenuContextValue>({
  isRootMenu: false,
  open: false,
});

export const useTiptapSearchableContext = (): boolean => {
  return useContext(TiptapSearchableContext);
};

export const useTiptapMenuContext = (): TiptapMenuContextValue => {
  return useContext(TiptapMenuContext);
};
