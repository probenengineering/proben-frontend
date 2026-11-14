"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

// shadcn Sonner, trimmed: the app has no dark mode, so next-themes was removed.
// Toasts are drawn by our own Toast molecule (via toast.custom), so Sonner's default styles aren't used.
const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner theme="light" className="toaster group" {...props} />;
};

export { Toaster };
