import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { AlertCircle, Trash2, Video } from "lucide-react";

import type { VideoUploadNodeAttributes } from "./video-node-schema";

export const VideoUploadNodeView = ({ node, deleteNode }: NodeViewProps) => {
  const { fileName, uploadProgress, uploadError } =
    node.attrs as VideoUploadNodeAttributes;

  if (uploadError) {
    return (
      <NodeViewWrapper data-type="videoUpload">
        <div className="flex items-center gap-3 rounded-md border border-dashed border-red-300 bg-red-50 p-4">
          <AlertCircle className="size-5 shrink-0 text-red-500" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-red-700">
              Video upload failed
            </div>
            <div className="truncate text-xs text-red-500">{uploadError}</div>
          </div>
          <button
            type="button"
            aria-label="Remove"
            onClick={deleteNode}
            className="rounded p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper data-type="videoUpload">
      <div className="flex items-center gap-3 rounded-md border border-dashed border-gray-300 bg-background p-4">
        <Video className="size-5 shrink-0 text-placeholder" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-control">
            Uploading {fileName ?? "video"}…
          </div>
          <div
            role="progressbar"
            aria-label="Upload progress"
            aria-valuenow={uploadProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent"
          >
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${Math.max(uploadProgress, 5)}%` }}
            />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
