import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useEffect, useState } from "react";

/**
 * A hash router, deliberately dependency-free.
 *
 * The site is a static build (`dist-playground/`) that has to work on any
 * host — GitHub Pages included — without server-side rewrite rules, so routes
 * live in the fragment: `#/docs`, `#/playground`.
 */

export const ROUTES = {
  home: "/",
  playground: "/playground",
  docs: "/docs",
} as const;

function readPath(): string {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return ROUTES.home;
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed === "" ? ROUTES.home : trimmed;
}

export function useRoute(): string {
  const [path, setPath] = useState(readPath);

  useEffect(() => {
    const onHashChange = () => {
      const next = readPath();
      setPath((current) => {
        if (current !== next) window.scrollTo({ top: 0 });
        return next;
      });
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return path;
}

interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={`#${to}`} {...rest}>
      {children}
    </a>
  );
}
