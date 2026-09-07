import type { ReactNode } from "react";
import { useState } from "react";

import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

export type CodeLang = "tsx" | "ts" | "bash" | "css" | "json" | "yaml";

interface Rule {
  cls: string;
  src: string;
}

const STRINGS = String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\`(?:[^\`\\]|\\.)*\``;

const KEYWORDS = [
  "import",
  "from",
  "export",
  "const",
  "let",
  "var",
  "function",
  "return",
  "async",
  "await",
  "if",
  "else",
  "new",
  "type",
  "interface",
  "extends",
  "class",
  "default",
  "true",
  "false",
  "null",
  "undefined",
  "throw",
  "try",
  "catch",
  "while",
  "for",
  "of",
  "in",
].join("|");

const TS_RULES: Rule[] = [
  {
    cls: "text-slate-500 italic",
    src: String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`,
  },
  { cls: "text-emerald-300", src: STRINGS },
  { cls: "text-sky-300", src: String.raw`\b(?:${KEYWORDS})\b` },
  { cls: "text-violet-300", src: String.raw`<\/?[A-Z][\w.]*` },
  { cls: "text-amber-200", src: String.raw`\b\d[\w.]*\b` },
];

const RULES: Record<CodeLang, Rule[]> = {
  ts: TS_RULES,
  tsx: TS_RULES,
  json: [
    { cls: "text-emerald-300", src: STRINGS },
    { cls: "text-sky-300", src: String.raw`\b(?:true|false|null)\b` },
    { cls: "text-amber-200", src: String.raw`\b\d[\w.]*\b` },
  ],
  bash: [
    { cls: "text-slate-500 italic", src: String.raw`#[^\n]*` },
    { cls: "text-emerald-300", src: STRINGS },
    { cls: "text-amber-200", src: String.raw`(?:^|\s)--?[\w-]+` },
  ],
  css: [
    { cls: "text-slate-500 italic", src: String.raw`\/\*[\s\S]*?\*\/` },
    { cls: "text-emerald-300", src: STRINGS },
    { cls: "text-sky-300", src: String.raw`--[\w-]+` },
    { cls: "text-amber-200", src: String.raw`#[0-9a-fA-F]{3,8}\b` },
  ],
  yaml: [
    { cls: "text-slate-500 italic", src: String.raw`#[^\n]*` },
    { cls: "text-emerald-300", src: STRINGS },
    { cls: "text-sky-300", src: String.raw`\b(?:true|false)\b` },
  ],
};

/**
 * A deliberately small highlighter: one alternation per language, run once over
 * the source. Not a parser — it colours comments, strings and keywords, which
 * is all a docs snippet needs, and it costs nothing to ship.
 */
function highlight(code: string, lang: CodeLang): ReactNode {
  const rules = RULES[lang];
  const pattern = new RegExp(rules.map((r) => `(${r.src})`).join("|"), "g");

  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of code.matchAll(pattern)) {
    const index = match.index ?? 0;
    const ruleIndex = match.slice(1).findIndex((group) => group !== undefined);
    if (ruleIndex === -1) continue;

    if (index > last) out.push(code.slice(last, index));
    out.push(
      <span className={rules[ruleIndex].cls} key={key++}>
        {match[0]}
      </span>,
    );
    last = index + match[0].length;
  }

  if (last < code.length) out.push(code.slice(last));
  return out;
}

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return { copied, copy };
}

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const { copied, copy } = useCopy(text);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn(
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white",
        className,
      )}
    >
      {copied ? (
        <Check className="size-4 text-emerald-300" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  );
}

interface CodeBlockProps {
  code: string;
  lang?: CodeLang;
  filename?: string;
  className?: string;
}

export function CodeBlock({
  code,
  lang = "tsx",
  filename,
  className,
}: CodeBlockProps) {
  const source = code.trim();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-[#111a26] ring-1 ring-white/10",
        className,
      )}
    >
      {filename && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="font-mono text-xs text-slate-400">{filename}</span>
        </div>
      )}
      <div className="flex items-start gap-2">
        <pre className="flex-1 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-200">
          <code>{highlight(source, lang)}</code>
        </pre>
        <CopyButton
          text={source}
          className="mt-2 mr-2 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
        />
      </div>
    </div>
  );
}

interface CommandLineProps {
  command: string;
  className?: string;
}

/** A single shell command, styled as an inline "copy me" affordance. */
export function CommandLine({ command, className }: CommandLineProps) {
  return (
    <div
      // Marks this <code> as a shell line, not prose: the docs page styles
      // inline code as a chip and must skip it.
      data-command=""
      className={cn(
        "flex items-center gap-3 rounded-xl bg-[#111a26] py-2 pr-2 pl-4 ring-1 ring-white/10",
        className,
      )}
    >
      <span aria-hidden className="font-mono text-sm text-slate-500">
        $
      </span>
      <code className="flex-1 overflow-x-auto text-left font-mono text-xs break-all text-slate-100 sm:text-sm sm:break-normal sm:whitespace-nowrap">
        {command}
      </code>
      <CopyButton text={command} />
    </div>
  );
}
