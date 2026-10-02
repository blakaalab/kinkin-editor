import {
  type ComponentType,
  type SVGProps,
  useEffect,
  useRef,
  useState,
} from "react";

import { AlertCircle, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmbedLinkFieldProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  placeholder: string;
  /** The input's accessible name. */
  label: string;
  /** Returns the error to show, or `null` once the link is taken. */
  onSubmit: (src: string) => string | null;
  onLeave: () => void;
  onRemove: () => void;
  onUpload?: (file: File) => void;
  /** No upload button unless this and `onUpload` are both given. */
  acceptedTypes?: string[] | null;
  autoFocus: boolean;
}

/**
 * The field an embed shows while it waits for its link: Enter embeds, Escape
 * leaves it selected, Backspace on an empty field removes it.
 */
export const EmbedLinkField = ({
  icon: Icon,
  placeholder,
  label,
  onSubmit,
  onLeave,
  onRemove,
  onUpload,
  acceptedTypes,
  autoFocus,
}: EmbedLinkFieldProps) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    // The slash menu closes as the embed goes in and hands focus back to the
    // editor — in an animation frame, since the selection is not a text
    // selection. Taken now, the focus would be taken straight back. Two frames
    // rather than one: this effect can run before the menu queues its frame,
    // and a frame queued inside a frame always runs after it.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => inputRef.current?.focus());
    });
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  return (
    <form
      className={cn(
        "flex flex-col gap-2 rounded-md border border-dashed bg-background p-3",
        error ? "border-red-300" : "border-gray-500",
      )}
      onSubmit={(e) => {
        e.preventDefault();
        setError(onSubmit(value));
      }}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-5 shrink-0 text-placeholder" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="url"
          value={value}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={!!error}
          className="flex-1 min-w-0 bg-transparent text-sm text-control outline-none placeholder:text-placeholder"
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onLeave();
            } else if (e.key === "Backspace" && !value) {
              e.preventDefault();
              onRemove();
            }
          }}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="shrink-0 rounded px-2.5 py-1 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:pointer-events-none disabled:opacity-50"
        >
          Embed
        </button>
        {onUpload && acceptedTypes && (
          <>
            <span className="h-4 w-px shrink-0 bg-gray-300" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1 text-sm font-medium text-control transition-colors hover:bg-accent"
            >
              <Upload className="size-3.5" />
              Upload file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";

                if (file) {
                  onUpload(file);
                }
              }}
            />
          </>
        )}
      </div>
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-red-500">
          <AlertCircle className="mt-px size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
};
