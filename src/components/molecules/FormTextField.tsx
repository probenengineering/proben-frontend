"use client";

import { type ComponentProps, type ReactNode, useId } from "react";

import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

import { fieldBox, FormFieldShell } from "./FormFieldShell";

// Text field on the Add staff form (Figma "Field", type Text: 103:17943 / 103:17957 / 103:17964):
// the shell plus a borderless input (Inter 14/20 slate-900, grey-400 placeholder). With an error,
// a 16px red info icon sits at the right.
export interface FormTextFieldProps extends Omit<
  ComponentProps<"input">,
  "onChange" | "value" | "className"
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  helper?: ReactNode;
  error?: ReactNode;
}

export function FormTextField({
  label,
  value,
  onChange,
  required,
  helper,
  error,
  disabled,
  ...props
}: FormTextFieldProps) {
  const id = useId();
  return (
    <FormFieldShell label={label} htmlFor={id} required={required} helper={helper} error={error}>
      <div className={fieldBox({ error: !!error, disabled })}>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-required={required || undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent outline-none placeholder:text-grey-400 disabled:text-grey-400",
            // An empty date shows its mm/dd/yyyy hint in the placeholder grey.
            value ? "text-slate-900" : "text-grey-400",
          )}
          {...props}
        />
        {error && <Icon name="info-red-16" size={16} />}
      </div>
    </FormFieldShell>
  );
}
