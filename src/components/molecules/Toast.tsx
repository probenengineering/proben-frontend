import { Icon, type IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Figma component "Toast" (Property 1 = Failed / Success). The icon is a status icon, not a close button.
const variants = {
  error: { className: "bg-error", icon: "close-circle" },
  success: { className: "bg-success-toast", icon: "tick-circle" },
} satisfies Record<string, { className: string; icon: IconName }>;

export interface ToastProps {
  variant: keyof typeof variants;
  message: string;
  className?: string;
}

export function Toast({ variant, message, className }: ToastProps) {
  return (
    <div
      className={cn(
        // Figma radius is 12px; there is no radius token for it yet.
        "flex w-full items-center gap-2.5 overflow-clip rounded-[12px] p-2.5 text-white",
        variants[variant].className,
        className,
      )}
    >
      <p className="min-w-0 flex-1 type-paragraph-sm">{message}</p>
      <Icon name={variants[variant].icon} size={24} />
    </div>
  );
}
