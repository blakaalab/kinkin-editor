import { useEffect, useRef, useState } from "react";

import type { Editor } from "@tiptap/core";
import type { TableOfContentDataItem } from "@tiptap/extension-table-of-contents";

import { cn } from "@/lib/utils";

/** Fraction of the viewport height above which a heading counts as "current". */
const THRESHOLD = 0.2;

export const ToCItem = ({
  item,
  isActive,
  onItemClick,
}: {
  item: TableOfContentDataItem;
  isActive: boolean;
  onItemClick: (e: React.MouseEvent, id: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isActive]);

  return (
    <div
      ref={ref}
      style={
        { "--level": item.level } as React.CSSProperties & {
          "--level": number;
        }
      }
    >
      <a
        className={cn(
          "block py-2.5 text-sm leading-snug transition-colors no-underline font-semibold hover:bg-blue-100 hover:text-brand",
          item.level === 1 && "pl-2.5",
          item.level === 2 && "pl-4.5",
          item.level === 3 && "pl-6.5",
          item.level === 4 && "pl-8.5",
          item.level === 5 && "pl-10.5",
          item.level === 6 && "pl-12.5",
          isActive ? "text-primary border-l-2 border-brand" : "text-secondary",
        )}
        href={`#${item.id}`}
        onClick={(e) => onItemClick(e, item.id)}
        data-item-index={item.itemIndex}
      >
        {item.textContent}
      </a>
    </div>
  );
};

export const ToCEmptyState = () => {
  return (
    <div className="empty-state">
      <p className="text-sm text-secondary italic">
        Start editing your document to see the outline
      </p>
    </div>
  );
};

export const ToC = ({
  items = [],
  editor,
  trackScroll = true,
}: {
  items: TableOfContentDataItem[];
  editor: Editor | null;
  trackScroll?: boolean;
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!trackScroll || !editor || items.length === 0) return;

    const headingEls: Element[] = [];
    items.forEach((item) => {
      const el = editor.view.dom.querySelector(`[id="${item.id}"]`);
      if (el) headingEls.push(el);
    });

    if (headingEls.length === 0) return;

    const updateActive = () => {
      // Skip updates while a click-triggered smooth scroll is in progress
      if (isScrollingRef.current) return;

      // If scrolled to the bottom, activate the last heading
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 20;
      if (scrolledToBottom) {
        setActiveId(
          headingEls[headingEls.length - 1]?.getAttribute("id") ?? null,
        );
        return;
      }

      let found: string | null = null;
      for (const el of headingEls) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * THRESHOLD) {
          found = el.getAttribute("id");
        }
      }
      setActiveId(found ?? headingEls[0]?.getAttribute("id") ?? null);
    };

    const observer = new IntersectionObserver(updateActive, {
      rootMargin: "0px 0px -60% 0px",
      threshold: 0,
    });

    headingEls.forEach((el) => {
      observer.observe(el);
    });
    window.addEventListener("scroll", updateActive, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateActive);
    };
  }, [editor, items, trackScroll]);

  if (items.length === 0) {
    return <ToCEmptyState />;
  }

  const onItemClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();

    if (trackScroll) {
      setActiveId(id);

      // Lock out scroll-based updates for the duration of the smooth scroll
      isScrollingRef.current = true;
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }

    const element = editor?.view.dom.querySelector(`[id="${id}"]`);
    if (element) {
      window.scrollTo({
        behavior: "smooth",
        top: element.getBoundingClientRect().top + window.scrollY - 100,
      });
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <ToCItem
          key={item.id}
          item={item}
          isActive={trackScroll && item.id === activeId}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};
