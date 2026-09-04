import { forwardRef, type KeyboardEvent, useEffect, useRef } from "react";

import { CornerDownLeft, ExternalLink, Link2, Trash2 } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/editor/tiptap-cores/hooks/use-mobile";
import { isValidUrl } from "@/editor/tiptap-cores/lib/tiptap-utils";
import type { TiptapButtonProps } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";

import { type UseLinkHandlerConfig, useLinkHandler } from "./use-link-handler";

interface LinkPopoverContentProps extends UseLinkHandlerConfig {
  onClose?: () => void;
}

export function LinkPopoverContent({
  editor,
  onClose,
}: LinkPopoverContentProps) {
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  const { url, setUrl, setLink, removeLink, openLink, isActive } =
    useLinkHandler({ editor });

  const hasInput = url.length > 0;
  const isValid = isValidUrl(url);
  const showError = hasInput && !isValid;
  const canApply = isValid || isActive;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleSetLink = () => {
    setLink();
    onClose?.();
  };

  const handleRemoveLink = () => {
    removeLink();
    onClose?.();
  };

  const handleOpenLink = () => {
    openLink();
    onClose?.();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && canApply) {
      event.preventDefault();
      handleSetLink();
    }
  };

  return (
    <div
      style={{
        ...(isMobile ? { boxShadow: "none", border: 0 } : {}),
      }}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-row items-center gap-1">
          <div className="relative flex flex-wrap items-stretch">
            <input
              ref={inputRef}
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className="block w-full h-8 text-sm font-normal leading-normal py-1.5 px-2 rounded-md bg-transparent appearance-none outline-none placeholder:text-gray-400"
            />
          </div>

          <TiptapButton
            type="button"
            onClick={handleSetLink}
            title="Apply link"
            disabled={!canApply}
          >
            <CornerDownLeft className="size-4" />
          </TiptapButton>

          <Separator orientation="vertical" className="h-6!" />

          <div className="gap-0 flex items-center">
            <TiptapButton
              type="button"
              onClick={handleOpenLink}
              title="Open in new window"
              disabled={!canApply}
            >
              <ExternalLink className="size-4" />
            </TiptapButton>

            <TiptapButton
              type="button"
              onClick={handleRemoveLink}
              title="Remove link"
              disabled={!isActive}
            >
              <Trash2 className="size-4" />
            </TiptapButton>
          </div>
        </div>

        {showError && (
          <span className="text-xs text-red-500 px-2 pb-0.5">
            Please enter a valid URL (http:// or https://)
          </span>
        )}
      </div>
    </div>
  );
}

export const LinkButton = forwardRef<HTMLButtonElement, TiptapButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <TiptapButton
        type="button"
        className={className}
        role="button"
        tabIndex={-1}
        aria-label="Link"
        tooltip="Link"
        ref={ref}
        {...props}
      >
        {children || <Link2 className="size-4" />}
      </TiptapButton>
    );
  },
);
