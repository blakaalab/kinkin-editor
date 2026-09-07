import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  Braces,
  FileCode2,
  GripVertical,
  Image,
  Palette,
  Plug,
  ShieldCheck,
  Smile,
  Sparkles,
  SquareSlash,
  Table,
  Zap,
} from "lucide-react";

import { RichTextEditor } from "@/editor";
import { FixedToolbar } from "@/editor/fixed-toolbar";
import { cn } from "@/lib/utils";

import { CodeBlock, CommandLine } from "../code-block";
import {
  demoImageUploadHandler,
  demoStreamCompletion,
  HERO_CONTENT,
} from "../demo";
import { PACKAGE_NAME, REPO_URL } from "../layout";
import { AnimatedShinyText } from "../magicui/animated-shiny-text";
import { AuroraText } from "../magicui/aurora-text";
import { BlurFade } from "../magicui/blur-fade";
import { BorderBeam } from "../magicui/border-beam";
import { DotPattern } from "../magicui/dot-pattern";
import { Marquee } from "../magicui/marquee";
import { NumberTicker } from "../magicui/number-ticker";
import { ShimmerButton } from "../magicui/shimmer-button";
import { Link, ROUTES } from "../router";

const QUICK_START = `import { useState } from "react";
import {
  FixedToolbar,
  RichTextEditor,
} from "${PACKAGE_NAME}";
import "${PACKAGE_NAME}/style.css";

export function Editor() {
  const [markdown, setMarkdown] = useState("# Hello");

  return (
    <div style={{ height: "100vh" }}>
      <RichTextEditor
        initialContent={markdown}
        contentType="markdown"
        outputContentType="markdown"
        onChange={(value) => setMarkdown(value as string)}
        toolbar={<FixedToolbar />}
      />
    </div>
  );
}`;

// Every figure here is counted from the source, not rounded for effect:
// the slash menu in slash-command-suggestion-menu-utils.ts, the @tiptap/*
// peerDependencies, the outputContentType union, and the three toolbars.
const STATS = [
  { value: 14, label: "slash commands" },
  { value: 21, label: "Tiptap peers, auto-installed" },
  { value: 4, label: "output formats" },
  { value: 3, label: "toolbars, two self-mounting" },
];

const FEATURES = [
  {
    icon: SquareSlash,
    title: "Slash commands",
    body: "Type / for headings, lists, quotes, code, tables, images and emoji — without leaving the keyboard.",
  },
  {
    icon: FileCode2,
    title: "Markdown in, markdown out",
    body: "Feed it markdown, get markdown back. Or HTML, or a Tiptap JSON doc — pick per prop. Pasted markdown converts on the way in.",
  },
  {
    icon: Sparkles,
    title: "AI Assist, LLM-agnostic",
    body: "Improve, continue, summarise, translate, change tone. You supply one streaming callback; the library owns the prompt and the UI.",
  },
  {
    icon: Table,
    title: "Real tables",
    body: "Column and row controls, drag-to-reorder, and cell navigation that behaves the way people expect.",
  },
  {
    icon: GripVertical,
    title: "Drag to reorder",
    body: "A handle on every block, plus Mod-Shift-↑/↓ to move and Mod-Shift-D to duplicate.",
  },
  {
    icon: Image,
    title: "Images your way",
    body: "Drop, paste, or pick. Upload is a callback that returns a URL — S3, Cloudinary, your own endpoint, or nothing at all.",
  },
  {
    icon: Smile,
    title: "Emoji picker",
    body: "Type : to search. Same keyboard-driven menu as the slash commands.",
  },
  {
    icon: Braces,
    title: "Table of contents",
    body: "Headings stream out through onTocItemsChange; drop them into the shipped <ToC /> with scroll tracking.",
  },
  {
    icon: Zap,
    title: "Three toolbars",
    body: "A fixed bar, a floating selection bar on desktop, and a docked bar under 480px. Two of them mount themselves.",
  },
];

const FITS = [
  {
    icon: ShieldCheck,
    title: "It can't touch your CSS",
    body: "Every rule is nested under .kinkin-editor at build time — :root tokens included — and the stylesheet ships with no preflight. Your .text-sm and its .text-sm can hold different values and neither budges.",
  },
  {
    icon: Plug,
    title: "No backend assumptions",
    body: "Image upload and AI are plain callbacks you pass in. Leave them out and those features simply turn off. There is no provider to mount and no config file.",
  },
  {
    icon: Palette,
    title: "Themed with CSS variables",
    body: "Override design tokens on the scope class and everything inside follows — accent, text, borders, fonts, and a separate --tt-core-* namespace for editor content.",
  },
];

const BUILT_IN = [
  "Paragraph",
  "Heading 1–4",
  "Bullet list",
  "Numbered list",
  "Task list",
  "Quote",
  "Code block",
  "Emoji",
  "Table",
  "Image",
  "Horizontal line",
  "Links",
  "Highlights",
  "Typography substitutions",
];

/**
 * The hero demo has to be *unmounted* on phones, not just hidden: the editor
 * portals its MobileToolbar into document.body, so a `display: none` parent
 * still leaves a toolbar pinned to the bottom of the marketing page.
 */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
}) {
  return (
    <BlurFade inView className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <div className="mb-3 text-xs font-semibold tracking-widest text-blue-700 uppercase">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-0 mb-0 text-3xl font-semibold tracking-tight text-gray-800 sm:text-4xl">
        {title}
      </h2>
      {body && <p className="mt-4 mb-0 text-base text-gray-600">{body}</p>}
    </BlurFade>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm whitespace-nowrap text-gray-700 shadow-sm transition hover:border-blue-400 hover:text-gray-800">
      {label}
    </span>
  );
}

export function HomePage() {
  const showLiveDemo = useMediaQuery("(min-width: 640px)");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-300/70 bg-white">
        <DotPattern
          width={22}
          height={22}
          cr={1}
          className="text-gray-300 [mask-image:radial-gradient(500px_circle_at_center_top,white,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_80%_at_50%_-10%,rgba(28,133,245,0.16),transparent_70%)]"
        />

        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <BlurFade delay={0.05}>
              <a
                href="https://tiptap.dev"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-4 py-1.5 no-underline shadow-sm transition hover:border-gray-400"
              >
                <span className="size-1.5 rounded-full bg-blue-600" />
                <AnimatedShinyText className="text-xs font-medium text-gray-700/75">
                  Built on Tiptap and ProseMirror
                </AnimatedShinyText>
                <ArrowRight className="size-3 text-gray-400 transition group-hover:translate-x-0.5" />
              </a>
            </BlurFade>

            <BlurFade delay={0.12}>
              <h1 className="mx-auto mt-6 mb-0 max-w-4xl text-4xl font-semibold tracking-tight text-balance text-gray-800 sm:text-6xl">
                A rich text editor you{" "}
                <AuroraText
                  colors={["#1c85f5", "#215db0", "#52a4fb", "#7c3aed"]}
                >
                  drop into
                </AuroraText>{" "}
                the app you already have
              </h1>
            </BlurFade>

            <BlurFade delay={0.2}>
              <p className="mx-auto mt-6 mb-0 max-w-xl text-lg text-gray-600">
                Markdown in, markdown out. Slash commands, tables, images,
                emoji, drag-to-reorder blocks and a streaming AI panel — in one
                React component, with no global CSS reset and nothing to
                configure.
              </p>
            </BlurFade>

            <BlurFade delay={0.28}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to={ROUTES.docs} className="no-underline">
                  <ShimmerButton
                    background="#242424"
                    borderRadius="12px"
                    className="px-5 py-2.5 text-sm font-medium shadow-lg"
                  >
                    Get started
                    <ArrowRight className="ml-2 size-4" />
                  </ShimmerButton>
                </Link>
                <Link
                  to={ROUTES.playground}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 no-underline transition hover:border-gray-400 hover:text-gray-800"
                >
                  Open the playground
                </Link>
              </div>
            </BlurFade>

            <BlurFade delay={0.36}>
              <CommandLine
                command={`npm install ${PACKAGE_NAME}`}
                className="mx-auto mt-8 max-w-md"
              />
            </BlurFade>
          </div>

          {/* Stats */}
          <BlurFade delay={0.44} inView>
            <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-300 bg-gray-300 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white px-4 py-5 text-center"
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="m-0">
                    <NumberTicker
                      value={stat.value}
                      className="text-3xl font-semibold tracking-tight text-gray-800"
                    />
                    <div className="mt-1 text-xs leading-snug text-gray-500">
                      {stat.label}
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </BlurFade>
        </div>
      </section>

      {/* Live demo */}
      <section className="border-b border-gray-300/70 bg-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <BlurFade inView>
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-[0_20px_60px_-30px_rgba(16,41,89,0.35)]">
              <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-200/60 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-gray-300" />
                <span className="size-2.5 rounded-full bg-gray-300" />
                <span className="size-2.5 rounded-full bg-gray-300" />
                <span className="ml-2 text-xs text-gray-500">
                  {showLiveDemo
                    ? "the real component — not a screenshot"
                    : "a preview — the live editor is on the playground"}
                </span>
              </div>
              {showLiveDemo ? (
                // No fixed height: the demo grows with its content instead of
                // scrolling inside a box.
                <div className="hero-demo">
                  <RichTextEditor
                    initialContent={HERO_CONTENT}
                    contentType="markdown"
                    outputContentType="markdown"
                    aiMode="assist"
                    placeholder="Type / for commands…"
                    imageUploadHandler={demoImageUploadHandler}
                    streamCompletion={demoStreamCompletion}
                    toolbar={<FixedToolbar showAiAssist />}
                  />
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <h3 className="mt-0 mb-0 text-xl font-semibold text-gray-800">
                    This editor is the product
                  </h3>
                  <p className="mt-3 mb-0 text-sm leading-relaxed text-gray-600">
                    Slash commands, tables, images, emoji, drag-to-reorder
                    blocks and a streaming AI panel — all in one component.
                  </p>
                  <Link
                    to={ROUTES.playground}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-800 px-5 py-2.5 text-sm font-medium text-white no-underline"
                  >
                    Try it in the playground
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
              <BorderBeam
                duration={8}
                size={340}
                borderWidth={2}
                colorFrom="#1c85f5"
                colorTo="#7c3aed"
              />
              <BorderBeam
                duration={8}
                delay={4}
                size={340}
                borderWidth={2}
                colorFrom="#7c3aed"
                colorTo="#1c85f5"
              />
            </div>
          </BlurFade>

          <p className="mt-4 mb-0 text-center text-sm text-gray-500">
            Want the toggles, the markdown output pane and read-only mode?{" "}
            <Link
              to={ROUTES.playground}
              className="font-medium text-blue-700 underline-offset-2"
            >
              Head to the playground
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-gray-300/70 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="What you get"
            title="Everything a writing surface needs"
            body="The pieces people end up building by hand around a bare Tiptap install, already assembled and wired together."
          />

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-gray-300 bg-gray-300 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <BlurFade
                key={feature.title}
                inView
                delay={0.05 * (i % 3)}
                className="group bg-white p-6 transition-colors hover:bg-gray-100"
              >
                <feature.icon className="size-5 text-blue-600 transition-transform group-hover:scale-110" />
                <h3 className="mt-4 mb-0 text-base font-semibold text-gray-800">
                  {feature.title}
                </h3>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-gray-600">
                  {feature.body}
                </p>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Fits your app */}
      <section className="border-b border-gray-300/70 bg-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Designed to be embedded"
            title="It fits into an app you already shipped"
            body="Most editor libraries want your stylesheet, your bundler config and a backend. This one asks for a height."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FITS.map((item, i) => (
              <BlurFade key={item.title} inView delay={0.08 * i}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-gray-300 bg-white p-6">
                  <span className="grid size-9 place-items-center rounded-xl bg-blue-200 text-blue-700">
                    <item.icon className="size-4.5" />
                  </span>
                  <h3 className="mt-4 mb-0 text-base font-semibold text-gray-800">
                    {item.title}
                  </h3>
                  <p className="mt-2 mb-0 text-sm leading-relaxed text-gray-600">
                    {item.body}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section className="border-b border-gray-300/70 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <BlurFade inView direction="right">
            <div className="mb-3 text-xs font-semibold tracking-widest text-blue-700 uppercase">
              Quick start
            </div>
            <h2 className="mt-0 mb-0 text-3xl font-semibold tracking-tight text-gray-800">
              One import, one component
            </h2>
            <p className="mt-4 mb-0 text-base text-gray-600">
              No provider, no extension array to assemble, no schema to declare.
              Two things catch people out, and both are one line:
            </p>
            <ul className="mt-6 mb-0 space-y-4 pl-0">
              <li className="flex gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                  1
                </span>
                <span className="text-sm text-gray-600">
                  <strong className="font-semibold text-gray-800">
                    Import the stylesheet.
                  </strong>{" "}
                  Once, anywhere in your app. Without it the editor renders
                  unstyled.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                  2
                </span>
                <span className="text-sm text-gray-600">
                  <strong className="font-semibold text-gray-800">
                    Give it a height.
                  </strong>{" "}
                  It fills its container. In a container with no height it
                  collapses to nothing.
                </span>
              </li>
            </ul>
            <div className="mt-8">
              <Link
                to={ROUTES.docs}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-5 py-2.5 text-sm font-medium text-white no-underline shadow-sm transition hover:bg-gray-900"
              >
                Read the setup guide
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </BlurFade>

          <BlurFade inView direction="left" delay={0.1}>
            <div className="relative overflow-hidden rounded-xl">
              <CodeBlock code={QUICK_START} lang="tsx" filename="editor.tsx" />
              <BorderBeam
                duration={10}
                size={200}
                colorFrom="#52a4fb"
                colorTo="transparent"
              />
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Built in */}
      <section className="overflow-hidden bg-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            title="Batteries already in the box"
            body="No extension shopping list. This is what the slash menu and the toolbars reach for out of the box."
          />
        </div>

        <div className="relative pb-16">
          <Marquee pauseOnHover className="[--duration:38s]">
            {BUILT_IN.map((item) => (
              <Pill key={item} label={item} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:44s]">
            {BUILT_IN.map((item) => (
              <Pill key={item} label={item} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-100" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-100" />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <BlurFade inView>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-[#102959] px-6 py-12 text-center sm:px-12">
              <DotPattern
                width={26}
                height={26}
                className={cn(
                  "text-white/25",
                  "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
                )}
              />
              <div className="relative">
                <h2 className="mt-0 mb-0 text-3xl font-semibold tracking-tight text-white">
                  Put it in your app
                </h2>
                <p className="mx-auto mt-4 mb-0 max-w-lg text-base text-slate-300">
                  One command. npm and pnpm read the peer dependencies for you,
                  so React and all 21 Tiptap packages come along.
                </p>
                <CommandLine
                  command={`npm install ${PACKAGE_NAME}`}
                  className="mx-auto mt-8 max-w-md ring-white/20"
                />
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link to={ROUTES.docs} className="no-underline">
                    <ShimmerButton
                      background="#ffffff"
                      shimmerColor="#1c85f5"
                      borderRadius="12px"
                      className="border-transparent px-5 py-2.5 text-sm font-medium text-gray-800"
                    >
                      Setup and usage
                      <ArrowRight className="ml-2 size-4" />
                    </ShimmerButton>
                  </Link>
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-white/10"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>
    </>
  );
}
