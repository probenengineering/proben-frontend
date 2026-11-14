import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Figma "Folder display": folder icon, file name and size on a card with an 8px radius.
// "message": a sent file (white-500 fill, #D9D9D9 line border); with href, clicking downloads it.
// "draft": a file waiting in the message box (white-200 fill, white-400 border) with a red ✕
// badge on its top-right corner to remove it (Figma 13:43327).
export interface FileAttachmentProps {
  name: string;
  size: string;
  variant?: "message" | "draft";
  /** Shows the ✕ badge (draft files). */
  onRemove?: () => void;
  /** Download link for a sent file. */
  href?: string;
}

export function FileAttachment({
  name,
  size,
  variant = "message",
  onRemove,
  href,
}: FileAttachmentProps) {
  const className = cn(
    "relative flex max-w-full items-center gap-4 rounded-md border px-4.25 py-2.25",
    variant === "draft" ? "border-white-400 bg-white-200" : "border-line bg-white-500",
  );
  const content = (
    <>
      <Icon name="folder" size={40} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate type-paragraph-sm text-grey-700">{name}</p>
        <p className="type-caption-sm font-sans! tracking-[0.04em]! text-black/50 capitalize">
          {size}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} download={name} aria-label={`Download ${name}`} className={className}>
        {content}
      </a>
    );
  }
  return (
    <div className={className}>
      {content}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          // Figma: 12px circle, 5px past the right edge and 7px above the top. Figma's red is
          // #BA1A1A, which isn't a token; error-700 (#B91C1C) is the nearest.
          className="absolute -top-1.75 -right-1.25 flex size-3 items-center justify-center rounded-full bg-error-700"
        >
          <Icon name="close-xs" size={10} />
        </button>
      )}
    </div>
  );
}
