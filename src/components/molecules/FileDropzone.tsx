"use client";

import { useRef, useState } from "react";

import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Task form file drop area (Figma "Dropzone" 60:11909): green-tint, 1.5px dashed green-500
// border (6/4 dashes), 12px radius, 18px vertical padding, 6px gaps. 24px upload icon, "Drag a
// file here or browse" Inter Semi Bold 14/20 green-ink, then the accepted types (12/18 slate-500).
export interface FileDropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
  hint?: string;
  disabled?: boolean;
}

export function FileDropzone({
  onFile,
  accept = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
  hint = "PDF, JPG or PNG · max 10 MB",
  disabled,
}: FileDropzoneProps) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      className={cn(
        "flex w-full flex-col items-center gap-1.5 rounded-[12px] bg-green-tint py-4.5 disabled:opacity-60",
        over && "bg-green-50",
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%2384C441' stroke-width='3' stroke-dasharray='6%2c 4'/%3e%3c/svg%3e\")",
      }}
    >
      <Icon name="upload-24" size={24} />
      <span className="type-ui-14 font-semibold text-green-ink">Drag a file here or browse</span>
      <span className="type-ui-12 text-slate-500">{hint}</span>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </button>
  );
}
