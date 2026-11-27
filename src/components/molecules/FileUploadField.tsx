"use client";

import { useRef, useState } from "react";

import { Icon } from "@/components/atoms";
import { formatBytes } from "@/lib/format-bytes";
import { showToast } from "@/lib/toast";

// Task attachments (Figma "Attachments" 103:20458): slate-50, dashed grey-300 border, 12px radius,
// 16 × 14 padding, 12px gap; 20px upload icon, "Upload files" (Semi Bold 14/20 green-ink) over
// "PDF, JPG, or PNG, up to 10 MB each." (12/17 slate-500). Picked files are listed underneath
// (no Figma frame); other types or larger files are refused with a toast. UI only: not uploaded.
export interface FileUploadFieldProps {
  files: File[];
  onChange: (files: File[]) => void;
}

const TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX = 10 * 1024 * 1024;

export function FileUploadField({ files, onChange }: FileUploadFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const add = (list: FileList | null) => {
    const picked = [...(list ?? [])];
    const ok = picked.filter((f) => TYPES.includes(f.type) && f.size <= MAX);
    if (ok.length < picked.length) showToast("error", "Only PDF, JPG, or PNG files up to 10 MB.");
    if (ok.length) onChange([...files, ...ok]);
  };
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        className={`flex w-full items-center gap-3 rounded-[12px] border border-dashed px-4 py-3.5 text-left ${over ? "border-green-500 bg-green-500/7" : "border-grey-300 bg-slate-50"}`}
      >
        <Icon name="upload-photo-20" />
        <span className="flex flex-col">
          <span className="type-ui-14 font-semibold text-green-ink">Upload files</span>
          <span className="type-ui-12-17 text-slate-500">PDF, JPG, or PNG, up to 10 MB each.</span>
        </span>
      </button>
      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex animate-in items-center gap-2 type-ui-13 text-grey-700 duration-200 fade-in-0 slide-in-from-top-1 motion-reduce:animate-none"
            >
              <Icon name="activity-task-16" size={16} />
              <span className="min-w-0 flex-1 truncate">
                {f.name}
                <span className="text-slate-500">{`  ·  ${formatBytes(f.size)}`}</span>
              </span>
              <button
                type="button"
                className="font-semibold text-danger-600 hover:underline"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept=".pdf,image/jpeg,image/png"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
