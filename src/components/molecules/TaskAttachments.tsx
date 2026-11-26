import type { FileInfo } from "@/lib/command-center/task-actions";

import { AttachmentItem, formatBytes } from "./AttachmentItem";

// "Attachments" section of the task drawer (Figma 60:11810): heading Inter Semi Bold 14/20
// slate-900, then one file row each (10px gaps). A file whose details failed to load shows as
// unavailable with Retry (60:12284). id="task-attachments" is the "View attachments" target.
export interface TaskAttachmentsProps {
  files: FileInfo[];
  onRetry: (id: string) => void;
}

export function TaskAttachments({ files, onRetry }: TaskAttachmentsProps) {
  return (
    <section id="task-attachments" className="flex flex-col gap-2.5">
      <h3 className="type-ui-14 font-semibold text-slate-900">Attachments</h3>
      {files.map((f) => (
        <AttachmentItem
          key={f.id}
          name={f.name}
          note={f.unavailable ? "Unavailable — we couldn’t load this file." : formatBytes(f.size)}
          variant={f.unavailable ? "unavailable" : "download"}
          href={`/api/files/${encodeURIComponent(f.id)}?name=${encodeURIComponent(f.name)}`}
          onRetry={() => onRetry(f.id)}
        />
      ))}
    </section>
  );
}
