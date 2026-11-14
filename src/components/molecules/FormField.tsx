import type { ReactNode } from "react";

import { Input, type InputProps } from "@/components/atoms";

// Figma component "Input": label above the field, optional content below it.
export interface FormFieldProps extends InputProps {
  id: string;
  label: string;
  /** Shown under the field, e.g. a "Forgot Password?" link or helper text. */
  below?: ReactNode;
}

export function FormField({ id, label, below, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-col gap-1">
        <label htmlFor={id} className="type-paragraph-sm font-medium text-grey-900">
          {label}
        </label>
        <Input id={id} {...inputProps} />
      </div>
      {below}
    </div>
  );
}
