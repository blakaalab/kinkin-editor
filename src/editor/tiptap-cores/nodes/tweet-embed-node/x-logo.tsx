import type { SVGProps } from "react";

/**
 * The X wordmark, for the slash menu and the link field. Lucide's `Twitter`
 * is the retired bird. Filled, and inset a little so it sits at the same
 * visual weight as the stroked icons beside it.
 */
export const XLogo = ({
  strokeWidth: _strokeWidth,
  ...props
}: SVGProps<SVGSVGElement>) => (
  <svg viewBox="-2 -2 28 28" fill="currentColor" aria-hidden {...props}>
    <title>X</title>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);
