import type { ComponentProps, ReactNode } from "react";

import { Button as BaseButton } from "@/components/ui";
import { cn } from "@/lib/utils";

// Figma components "Button / primary", "Button / greys" (outline and plain), "Button / destructive".
// Hover and press states are not in Figma yet, so shadcn's defaults are kept.
const variants = {
  // Figma has no border here. Disabled = Figma's grey "Button / primary" (#D0D5DD), full opacity.
  primary: {
    base: "default",
    className: "border-0 px-4 text-white disabled:bg-grey-300 disabled:opacity-100",
  },
  outline: { base: "outline", className: "border-grey-300 bg-white px-3 text-grey-700" },
  ghost: { base: "ghost", className: "bg-white px-4 text-grey-700" }, // "greys" with no border (Cancel)
  destructive: {
    base: "default",
    className: "border-0 bg-error-500 px-4 text-white hover:bg-error-500/90",
  },
} as const;

export interface ButtonProps extends Omit<ComponentProps<typeof BaseButton>, "variant" | "size"> {
  variant?: keyof typeof variants;
  /** Icon shown before the label, e.g. <Icon name="google" /> */
  icon?: ReactNode;
}

export function Button({ variant = "primary", icon, className, children, ...props }: ButtonProps) {
  return (
    <BaseButton
      variant={variants[variant].base}
      className={cn(
        "h-9 gap-2 rounded-md py-2 type-paragraph-sm font-semibold",
        variants[variant].className,
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </BaseButton>
  );
}
