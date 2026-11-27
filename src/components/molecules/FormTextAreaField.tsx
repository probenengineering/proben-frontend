"use client";

import { type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";

import { FormFieldShell } from "./FormFieldShell";

// Figma "Textarea" (103:18319): the field shell with a 104px box (grey-300 border, 12px radius,
// 14 × 12 padding), Inter 14/20 slate-900, grey-400 placeholder. Focus and error as text fields.
export interface FormTextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: ReactNode;
}

export function FormTextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
}: FormTextAreaFieldProps) {
  const id = useId();
  return (
    <FormFieldShell label={label} htmlFor={id} required={required} error={error}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error || undefined}
        aria-required={required || undefined}
        className={cn(
          "h-26 w-full resize-none rounded-[12px] border bg-white px-3.5 py-3 type-ui-14 text-slate-900 outline-none placeholder:text-grey-400",
          error
            ? "border-danger-300"
            : "border-grey-300 focus:border-[1.5px] focus:border-green-500 focus:shadow-field-focus",
        )}
      />
    </FormFieldShell>
  );
}
