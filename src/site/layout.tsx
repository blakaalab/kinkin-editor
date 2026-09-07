import type { ReactNode } from "react";

import { Github } from "lucide-react";

import { cn } from "@/lib/utils";

import { LogoMark } from "./logo-mark";
import { Link, ROUTES, useRoute } from "./router";

export const REPO_URL = "https://github.com/blakaalab/kinkin-editor";
export const PACKAGE_NAME = "@blakaa/kinkin-editor";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to={ROUTES.home}
      className={cn("group flex items-center gap-2.5 no-underline", className)}
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm">
        <LogoMark className="h-[13px] w-auto" />
      </span>
      <span className="font-semibold tracking-tight text-gray-800">
        Kinkin Editor
      </span>
    </Link>
  );
}

const NAV = [
  { to: ROUTES.docs, label: "Docs" },
  { to: ROUTES.playground, label: "Playground" },
];

export function SiteHeader() {
  const route = useRoute();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-gray-300/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-lg px-3 py-1.5 no-underline transition",
                route === item.to
                  ? "bg-gray-200 font-medium text-gray-800"
                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-800",
              )}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="ml-1 grid size-8 place-items-center rounded-lg text-gray-600 transition hover:bg-gray-200 hover:text-gray-800"
          >
            <Github className="size-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-300/70 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-5">
          <Link
            to={ROUTES.docs}
            className="text-gray-500 no-underline hover:text-gray-800"
          >
            Docs
          </Link>
          <Link
            to={ROUTES.playground}
            className="text-gray-500 no-underline hover:text-gray-800"
          >
            Playground
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 no-underline hover:text-gray-800"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

interface SiteShellProps {
  children: ReactNode;
  /** Fills the viewport without page scroll — used by the playground. */
  fill?: boolean;
}

export function SiteShell({ children, fill = false }: SiteShellProps) {
  if (fill) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
        <SiteHeader />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
