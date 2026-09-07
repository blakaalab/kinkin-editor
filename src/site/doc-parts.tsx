import type { ReactNode } from "react";
import { useState } from "react";

import { Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-gray-300 pt-12">
      <h2 className="mt-0 mb-0 text-2xl font-semibold tracking-tight text-gray-800">
        {title}
      </h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export function DocSubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-10 mb-0 text-base font-semibold text-gray-800">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-0 mb-0 text-[15px] leading-relaxed text-gray-600">
      {children}
    </p>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-0 mb-0 space-y-2 pl-0">
      {items.map((item, i) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: static list, never reordered.
          key={i}
          className="flex gap-3 text-[15px] leading-relaxed text-gray-600"
        >
          <span
            aria-hidden
            className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gray-400"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn";
  title?: string;
  children: ReactNode;
}) {
  const Icon = tone === "warn" ? TriangleAlert : Info;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-4",
        tone === "warn"
          ? "border-amber-300 bg-amber-50"
          : "border-blue-300 bg-blue-100",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "warn" ? "text-amber-600" : "text-blue-700",
        )}
      />
      <div className="text-[15px] leading-relaxed text-gray-700">
        {title && <div className="font-semibold text-gray-800">{title}</div>}
        <div className={cn(title && "mt-1")}>{children}</div>
      </div>
    </div>
  );
}

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: ReactNode;
}

export function PropTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-gray-200/60 text-xs tracking-wide text-gray-600 uppercase">
            <th className="px-4 py-2.5 font-semibold">Prop</th>
            <th className="px-4 py-2.5 font-semibold">Type</th>
            <th className="px-4 py-2.5 font-semibold">Default</th>
            <th className="px-4 py-2.5 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-gray-300 align-top">
              <td className="px-4 py-3 font-mono text-[13px] whitespace-nowrap text-gray-800">
                {row.name}
              </td>
              <td className="px-4 py-3 font-mono text-[13px] text-blue-800">
                {row.type}
              </td>
              <td className="px-4 py-3 font-mono text-[13px] text-gray-500">
                {row.default ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ items }: { items: TabItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const current = items.find((item) => item.id === active) ?? items[0];

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-300">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={cn(
              "-mb-px cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition",
              item.id === current?.id
                ? "border-blue-600 text-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-4">{current?.content}</div>
    </div>
  );
}
