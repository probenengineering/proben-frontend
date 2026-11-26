import { Icon } from "@/components/atoms";
import { formatBytes } from "@/lib/format-bytes";
import { cn } from "@/lib/utils";

export { formatBytes };

// File row in the task drawer (Figma "File / …" 60:11812, "Uploaded file" 60:11914): white,
// slate-200 border, 12px radius, 12 × 10 padding, 12px gaps. 20px file icon, name Inter Medium
// 14/20 slate-900 over a 12/18 note. "download": a download icon link (slate-500 note).
// "uploaded": green note ("1.2 MB · Uploaded"), green tick and a remove button. "unavailable"
// (Figma 60:12284): danger-50 / danger-200 box, red note and a "Retry" (Semi Bold 13/18 danger-700).
export interface AttachmentItemProps {
  name: string;
  /** "240 KB" / "1.2 MB · Uploaded" / "Uploading…". */
  note?: string;
  href?: string;
  variant?: "download" | "uploaded" | "uploading" | "unavailable";
  onRemove?: () => void;
  onRetry?: () => void;
}

export function AttachmentItem({
  name,
  note,
  href,
  variant = "download",
  onRemove,
  onRetry,
}: AttachmentItemProps) {
  const unavailable = variant === "unavailable";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[12px] border px-3 py-2.5",
        unavailable ? "border-danger-200 bg-danger-50" : "border-slate-200 bg-white",
      )}
    >
      <Icon name="file-pdf-20" size={20} />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate type-ui-14 font-medium text-slate-900">{name}</p>
        {note && (
          <p
            className={cn(
              "type-ui-12",
              variant === "uploaded"
                ? "text-verified-700"
                : unavailable
                  ? "text-danger-700"
                  : "text-slate-500",
            )}
          >
            {note}
          </p>
        )}
      </div>
      {variant === "download" && href && (
        <a href={href} aria-label={`Download ${name}`} className="shrink-0">
          <Icon name="download-20" size={20} />
        </a>
      )}
      {variant === "uploaded" && <Icon name="uploaded-ok-18" size={18} />}
      {unavailable && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 type-ui-13 font-semibold text-danger-700 hover:underline"
        >
          Retry
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-slate-100"
        >
          <Icon name="remove-16" size={16} />
        </button>
      )}
    </div>
  );
}
