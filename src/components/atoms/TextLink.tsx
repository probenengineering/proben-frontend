import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// Text links. They inherit the font of the surrounding text.
// Exported so a <button> (e.g. "Resend Code", "Sign out") can look like a text link.
export const textLinkVariants = {
  brand: "text-green-link", // "Sign up"
  plain: "text-black", // "Forgot Password?"
  underline: "text-black underline decoration-from-font [text-underline-position:from-font]", // Terms, Privacy
} as const;

export interface TextLinkProps extends ComponentProps<typeof Link> {
  variant?: keyof typeof textLinkVariants;
}

export function TextLink({ variant = "plain", className, ...props }: TextLinkProps) {
  return <Link className={cn(textLinkVariants[variant], className)} {...props} />;
}
