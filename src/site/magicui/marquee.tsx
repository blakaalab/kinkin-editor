/*
 * Vendored from MagicUI (https://magicui.design/docs/components/marquee).
 * Copy-in component, MIT licensed. Changes from upstream:
 *   - dropped the "use client" directive (this is a Vite app, not Next.js)
 *   - suppressed the array-index key lint (the copies are identical)
 *   - animate-marquee -> animate-[marquee_var(--duration)_...]; see the note in
 *     styles/global.css for why the theme-variable form cannot work here
 */

import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: identical copies, never reordered.
            key={i}
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "animate-[marquee_var(--duration)_infinite_linear] flex-row":
                !vertical,
              "animate-[marquee-vertical_var(--duration)_linear_infinite] flex-col":
                vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
