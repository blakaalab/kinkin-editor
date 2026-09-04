import { type ComponentProps, type ComponentRef, forwardRef } from "react";

import * as Ariakit from "@ariakit/react";

import { cn } from "@/editor/tiptap-cores/lib/tiptap-utils";

export const TiptapComboboxProvider = ({
  ...props
}: Ariakit.ComboboxProviderProps) => (
  <Ariakit.ComboboxProvider
    includesBaseElement={false}
    resetValueOnHide
    {...props}
  />
);

export const TiptapComboboxList = forwardRef<
  ComponentRef<typeof Ariakit.ComboboxList>,
  ComponentProps<typeof Ariakit.ComboboxList>
>(({ className, style, ...props }, ref) => (
  <Ariakit.ComboboxList
    ref={ref}
    className={cn(
      "h-full rounded-xl border p-1.5 outline-none",
      "border-gray-200 bg-white text-gray-600",
      "shadow-xl",
      "max-w-64 overflow-y-auto",
      "empty:hidden",
      className,
    )}
    style={{
      maxHeight: "var(--popover-available-height)",
      ...style,
    }}
    {...props}
  />
));

export const TiptapCombobox = forwardRef<
  ComponentRef<typeof Ariakit.Combobox>,
  ComponentProps<typeof Ariakit.Combobox>
>(({ className, autoSelect = true, ...props }, ref) => (
  <Ariakit.Combobox
    ref={ref}
    autoSelect={autoSelect}
    className={className}
    {...props}
  />
));

export const TiptapComboboxItem = forwardRef<
  ComponentRef<typeof Ariakit.ComboboxItem>,
  ComponentProps<typeof Ariakit.ComboboxItem>
>(({ className, ...props }, ref) => (
  <Ariakit.ComboboxItem ref={ref} className={className} {...props} />
));

export const TiptapComboboxPopover = forwardRef<
  ComponentRef<typeof Ariakit.ComboboxPopover>,
  ComponentProps<typeof Ariakit.ComboboxPopover>
>((props, ref) => <Ariakit.ComboboxPopover ref={ref} {...props} />);
