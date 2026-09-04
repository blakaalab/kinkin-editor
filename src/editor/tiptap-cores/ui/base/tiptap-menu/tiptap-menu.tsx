import {
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import * as Ariakit from "@ariakit/react";

import { useComposedRef } from "@/editor/tiptap-cores/hooks/use-composed-ref";
import { useOnClickOutside } from "@/editor/tiptap-cores/hooks/use-on-click-outside";
import { cn } from "@/editor/tiptap-cores/lib/tiptap-utils";
import {
  TiptapComboboxItem,
  TiptapComboboxProvider,
} from "@/editor/tiptap-cores/ui/base/tiptap-combobox";

import {
  TiptapMenuContext,
  TiptapSearchableContext,
  useTiptapMenuContext,
  useTiptapSearchableContext,
} from "./menu-context";
import {
  useTiptapKeyboardNavigation,
  useTiptapMenuItemClick,
  useTiptapMenuPlacement,
} from "./menu-hooks";

interface TiptapMenuItemProps extends Omit<Ariakit.ComboboxItemProps, "store"> {
  group?: string;
  name?: string;
  parentGroup?: string;
  preventClose?: boolean;
}

interface TiptapMenuProps extends Ariakit.MenuProviderProps {
  trigger?: ReactNode;
  value?: string;
  onOpenChange?: Ariakit.MenuProviderProps["setOpen"];
  onValueChange?: Ariakit.ComboboxProviderProps["setValue"];
  onValuesChange?: Ariakit.MenuProviderProps["setValues"];
  defaultActiveId?: Ariakit.MenuProviderProps["defaultActiveId"];
}

interface TiptapMenuContentProps extends ComponentProps<typeof Ariakit.Menu> {
  onClickOutside?: (event: MouseEvent | TouchEvent | FocusEvent) => void;
}

export const TiptapMenu = ({
  children,
  trigger,
  value,
  onOpenChange,
  onValueChange,
  onValuesChange,
  defaultActiveId,
  ...props
}: TiptapMenuProps) => {
  const isRootMenu = !Ariakit.useMenuContext();
  const [open, setOpen] = useState(false);
  const searchable = !!onValuesChange || isRootMenu;

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (props.open === undefined) {
        setOpen(v);
      }
      onOpenChange?.(v);
    },
    [props.open, onOpenChange],
  );

  const menuContextValue = useMemo(
    () => ({
      isRootMenu,
      open: props.open ?? open,
    }),
    [isRootMenu, props.open, open],
  );

  const menuProvider = (
    <Ariakit.MenuProvider
      open={open}
      setOpen={handleOpenChange}
      setValues={onValuesChange}
      showTimeout={100}
      defaultActiveId={defaultActiveId}
      {...props}
    >
      {trigger}
      <TiptapMenuContext.Provider value={menuContextValue}>
        <TiptapSearchableContext.Provider value={searchable}>
          <div
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleOpenChange(false);
              }
            }}
          >
            {children}
          </div>
        </TiptapSearchableContext.Provider>
      </TiptapMenuContext.Provider>
    </Ariakit.MenuProvider>
  );

  if (searchable) {
    return (
      <TiptapComboboxProvider value={value} setValue={onValueChange}>
        {menuProvider}
      </TiptapComboboxProvider>
    );
  }

  return menuProvider;
};

export const TiptapMenuContent = ({
  children,
  className,
  ref,
  onClickOutside,
  style,
  ...props
}: TiptapMenuContentProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { open } = useTiptapMenuContext();
  const side = useTiptapMenuPlacement();
  const { isKeyboardActive, handlers } = useTiptapKeyboardNavigation();

  useOnClickOutside(menuRef, onClickOutside || (() => {}));

  return (
    <Ariakit.Menu
      ref={useComposedRef(menuRef, ref)}
      className={cn(
        "group/keyboard z-50 flex flex-col h-full outline-none",
        "data-[state=closed]:hidden",
        "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-0.5 data-[state=open]:duration-100 data-[state=open]:ease-out",
        className,
      )}
      style={{
        ...style,
      }}
      data-side={side}
      data-state={open ? "open" : "closed"}
      data-keyboard-active={isKeyboardActive || undefined}
      gutter={12}
      flip
      unmountOnHide
      onKeyDown={handlers.onKeyDown}
      onMouseMove={handlers.onMouseMove}
      {...props}
    >
      {children}
    </Ariakit.Menu>
  );
};

export const TiptapMenuButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Ariakit.MenuButton>
>(({ className, ...props }, ref) => (
  <Ariakit.MenuButton ref={ref} className={className} {...props} />
));

export const TiptapMenuGroup = forwardRef<
  ComponentRef<typeof Ariakit.MenuGroup>,
  ComponentPropsWithoutRef<typeof Ariakit.MenuGroup>
>(({ className, ...props }, ref) => (
  <Ariakit.MenuGroup
    ref={ref}
    {...props}
    className={cn(
      "hidden has-[[role=menuitem]]:block has-[[role=option]]:block",
      className,
    )}
  />
));

const TiptapMenuItemRadio = forwardRef<
  ComponentRef<typeof Ariakit.MenuItemRadio>,
  ComponentPropsWithoutRef<typeof Ariakit.MenuItemRadio>
>(({ className, ...props }, ref) => (
  <Ariakit.MenuItemRadio ref={ref} className={className} {...props} />
));

export const TiptapMenuItem = ({
  name,
  value,
  preventClose,
  className,
  ...props
}: TiptapMenuItemProps) => {
  const menu = Ariakit.useMenuContext();
  const searchable = useTiptapSearchableContext();

  const hideOnClick = useTiptapMenuItemClick(menu, preventClose);

  const itemProps: TiptapMenuItemProps = {
    blurOnHoverEnd: false,
    focusOnHover: true,
    className: cn("w-full", className),
    ...props,
  };

  if (!searchable) {
    if (name && value) {
      return (
        <TiptapMenuItemRadio
          {...itemProps}
          hideOnClick={true}
          name={name}
          value={value}
        />
      );
    }

    return <Ariakit.MenuItem {...itemProps} />;
  }

  return <TiptapComboboxItem {...itemProps} hideOnClick={hideOnClick} />;
};
