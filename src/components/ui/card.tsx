import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const CardContext = React.createContext<VariantProps<typeof cardVariants>>({
  variant: "default",
});

const cardVariants = cva(
  "flex flex-col rounded-md focus-visible:outline-dashed focus-visible:outline focus-visible:outline-black",
  {
    variants: {
      variant: {
        default: "bg-white text-foreground border shadow-xs py-6 gap-6",
        secondary: "bg-gray-200 text-foreground py-4 gap-2",
        rich: "bg-linear-to-b from-[#2269B5] to-[#004085] text-white py-10 gap-9",
        plain: "bg-white text-foreground border shadow-xs gap-6",
        gray: "bg-purple-50 text-gray-500 w-full p-3 pb-2 sm:p-6 sm:pb-4",
        green: "bg-green-100 text-green-800 w-full p-3 pb-2 sm:p-6 sm:pb-4",
        yellow: "bg-amber-100 text-amber-800 w-full p-3 pb-2 sm:p-6 sm:pb-4",
        blue: "bg-pale-blue text-blue-700 w-full p-3 pb-2 sm:p-6 sm:pb-4",
        red: "bg-red-100 text-red-800 w-full p-3 pb-2 sm:p-6 sm:pb-4",
        outline: "text-gray-600 border shadow-none py-6 gap-6",
      },
      interactive: {
        true: "cursor-pointer hover:border-primary-700 active:bg-active",
        false: null,
      },
    },
  },
);
function Card({
  className,
  variant = "default",
  onClick,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    asChild?: boolean;
  }) {
  const interactive = onClick !== undefined || asChild;
  const Comp = asChild ? Slot : "div";

  return (
    <CardContext.Provider value={{ variant }}>
      <Comp
        data-slot="card"
        className={cn(cardVariants({ variant, interactive, className }))}
        {...props}
        onClick={onClick}
        tabIndex={interactive ? 0 : undefined}
        onKeyUp={(e) => {
          if (interactive && e.key === "Enter") {
            onClick?.({} as React.MouseEvent<HTMLDivElement, MouseEvent>);
          }
        }}
      />
    </CardContext.Provider>
  );
}

const cardHeaderVariants = cva(
  "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
  {
    variants: {
      variant: {
        default: "px-6 [.border-b]:pb-6",
        rich: "justify-center px-4 md:px-10 [.border-b]:pb-10",
        secondary: "px-4 [.border-b]:pb-2",
        plain: "px-4 [.border-b]:pb-2",
        gray: "",
        green: "",
        yellow: "",
        blue: "",
        red: "",
        outline: "px-6",
      },
    },
  },
);

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { variant } = React.useContext(CardContext);
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ variant, className }))}
      {...props}
    />
  );
}

const cardTitleVariants = cva("leading-none", {
  variants: {
    variant: {
      default: "font-semibold",
      rich: "font-[Guyot_Headline] font-light text-4xl",
      secondary: "font-semibold",
      plain: "font-semibold",
      gray: "font-normal text-base",
      green: "font-normal text-base",
      yellow: "font-normal text-base",
      blue: "font-normal text-base",
      red: "font-normal text-base",
      outline: "font-semibold",
    },
  },
});

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { variant } = React.useContext(CardContext);
  return (
    <div
      data-slot="card-title"
      className={cn(cardTitleVariants({ variant, className }))}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-gray-400", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

const cardContentVariants = cva("", {
  variants: {
    variant: {
      default: "px-6",
      rich: "px-4 md:px-10",
      secondary: "px-4",
      plain: "",
      gray: "text-4xl/snug font-semibold",
      green: "text-4xl/snug font-semibold",
      yellow: "text-4xl/snug font-semibold",
      blue: "text-4xl/snug font-semibold",
      red: "text-4xl/snug font-semibold",
      outline: "px-6",
    },
  },
});
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  const { variant } = React.useContext(CardContext);
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ variant, className }))}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
