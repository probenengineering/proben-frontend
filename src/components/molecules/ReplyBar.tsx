import { Icon } from "@/components/atoms";

// "Replying to …" strip above the message box (not in Figma; built from existing styles, agreed).
export interface ReplyBarProps {
  author: string;
  text: string;
  onCancel: () => void;
}

export function ReplyBar({ author, text, onCancel }: ReplyBarProps) {
  return (
    <div className="flex w-full items-center gap-2.5 rounded-md bg-white-200 px-4 py-2">
      <Icon name="document-upload" size={14} />
      <p className="flex min-w-0 flex-1 gap-1 type-paragraph-sm">
        <span className="shrink-0 font-medium text-grey-900">Replying to {author}</span>
        <span className="truncate text-grey-700">{text}</span>
      </p>
      <button type="button" aria-label="Cancel reply" onClick={onCancel} className="flex">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
