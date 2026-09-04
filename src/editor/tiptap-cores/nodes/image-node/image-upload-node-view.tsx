import { useCallback, useRef, useState } from "react";

import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { AlertCircle, ImageIcon, Trash2, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  ImageUploadNodeAttributes,
  ImageUploadStorage,
} from "./image-upload-node-extension";

const ACCEPTED_IMAGE_TYPES =
  "image/png,image/jpeg,image/gif,image/webp,image/svg+xml";

const UploadArea = ({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      e.target.value = "";
    },
    [onFileSelect],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload an image"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-8 cursor-pointer transition-colors",
        isDragging
          ? "border-blue-500 bg-blue-100"
          : "border-gray-500 bg-white hover:border-blue-500 hover:bg-blue-50",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        onChange={handleInputChange}
        className="hidden"
      />
      {isDragging ? (
        <>
          <Upload className="size-6 text-blue-500" strokeWidth={1.5} />
          <span className="text-sm text-blue-700 font-medium">
            Drop your image here
          </span>
        </>
      ) : (
        <>
          <ImageIcon className="size-6 text-gray-400" strokeWidth={1.5} />
          <span className="text-sm text-gray-600">
            Drop your image here or{" "}
            <span className="text-blue-600 font-medium">Choose file</span>
          </span>
          <span className="text-xs text-gray-400">
            PNG, JPG, GIF, WebP, SVG
          </span>
        </>
      )}
    </div>
  );
};

const UploadProgress = ({ progress }: { progress: number }) => (
  <div className="flex items-center gap-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-4">
    <div className="relative">
      <ImageIcon className="size-5 text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm text-gray-600">Uploading image...</div>
      <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${Math.max(progress, 5)}%` }}
        />
      </div>
    </div>
  </div>
);

const UploadError = ({
  error,
  onDelete,
}: {
  error: string;
  onDelete: () => void;
}) => (
  <div className="flex items-center gap-3 rounded-md border border-dashed border-red-300 bg-red-50 p-4">
    <AlertCircle className="size-5 text-red-500 shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-red-700">Upload failed</div>
      <div className="text-xs text-red-500 truncate">{error}</div>
    </div>
    <button
      type="button"
      onClick={onDelete}
      className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
    >
      <Trash2 className="size-4" />
    </button>
  </div>
);

export const ImageUploadNodeView = ({
  node,
  editor,
  getPos,
  deleteNode,
}: NodeViewProps) => {
  const attrs = node.attrs as ImageUploadNodeAttributes;
  const { uploadId, uploadProgress, uploadError } = attrs;

  const isPlaceholder = !uploadId && !uploadError;
  const isUploading = !!uploadId && !uploadError;
  const hasError = !!uploadError;

  const handleFileSelect = useCallback(
    (file: File) => {
      const pos = getPos();
      if (pos === undefined) return;
      const storage = (
        editor.storage as unknown as Record<string, ImageUploadStorage>
      ).imageUpload;
      storage.startUploadForNode?.(file, pos);
    },
    [editor, getPos],
  );

  return (
    <NodeViewWrapper data-type="imageUpload">
      <div className="my-2">
        {hasError ? (
          <UploadError error={uploadError} onDelete={deleteNode} />
        ) : isUploading ? (
          <UploadProgress progress={uploadProgress} />
        ) : isPlaceholder ? (
          <UploadArea onFileSelect={handleFileSelect} />
        ) : null}
      </div>
    </NodeViewWrapper>
  );
};
