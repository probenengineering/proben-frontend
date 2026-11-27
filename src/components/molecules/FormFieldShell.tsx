import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Figma "Field" (Add staff 103:17943): label row (Inter Medium 14/20 grey-700, red "*" when
// required, 2px apart), the control, then a helper (Inter 13/18 slate-500) or an error (13/18
// danger-600); 6px gaps. `fieldBox` styles the 44px control: 12px radius (no radius token yet),
// 14px left / 12px right padding, grey-300 border; focus green-500 1.5px + 4px green glow;
// disabled slate-50; error danger-300.
export interface FormFieldShellProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  helper?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function fieldBox({ error, disabled }: { error?: boolean; disabled?: boolean }) {
  return cn(
    "flex h-11 w-full items-center gap-2 rounded-[12px] border pr-3 pl-3.5 type-ui-14 transition-[border-color,box-shadow]",
    disabled
      ? "border-grey-300 bg-slate-50"
      : error
        ? "border-danger-300 bg-white"
        : "border-grey-300 bg-white focus-within:border-[1.5px] focus-within:border-green-500 focus-within:shadow-field-focus",
  );
}

export function FormFieldShell({
  label,
  htmlFor,
  required,
  helper,
  error,
  children,
  className,
}: FormFieldShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex gap-0.5 type-ui-14 font-medium">
        <span className="text-grey-700">{label}</span>
        {required && (
          <span aria-hidden className="text-danger-600">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p role="alert" className="type-ui-13 text-danger-600">
          {error}
        </p>
      ) : (
        helper && <p className="type-ui-13 text-slate-500">{helper}</p>
      )}
    </div>
  );
}
