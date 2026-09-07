import type { SVGProps } from "react";

/**
 * The Kinkin mark: two rounded chevrons forming a K.
 *
 * Traced from the supplied artwork - a white-on-transparent PNG whose mark
 * occupies 1084x892 of a 1478x1064 canvas - by following the alpha mask's row
 * spans and simplifying with Ramer-Douglas-Peucker at a 2px tolerance. So it
 * stays crisp at any size and takes its colour from `currentColor` rather than
 * shipping a raster.
 */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1084 892"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M463 0L481 3L504 12L518 21L540 46L548 62L554 86L553 109L545 134L526 162L256 425L250 440L252 453L259 464L530 735L548 764L554 789L552 813L543 837L528 858L505 877L489 885L459 892L427 892L391 882L360 861L36 537L19 514L9 494L1 464L0 439L4 414L12 392L37 356L363 31L382 17L416 3L463 0Z" />
      <path d="M1001 0L1020 3L1040 11L1056 22L1072 41L1079 55L1084 76L1082 103L1073 126L1048 157L766 430L755 436L739 435L686 389L642 369L537 367L881 26L909 10L934 2L1001 0Z" />
      <path d="M598 382L646 393L687 418L1019 750L1035 782L1037 812L1025 846L1004 870L981 884L949 892L887 891L862 884L838 870L614 646L461 498L452 482L454 462L471 437L494 414L520 397L542 388L566 383L598 382Z" />
    </svg>
  );
}
