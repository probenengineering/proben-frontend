import { Icon } from "@/components/atoms";

// Dark toast with an action (Figma "Toast" 60:11351): slate-900, 14px radius, 10/12/10/16
// padding, 12px gaps, toast shadow. Green check, Inter Medium 14/20 white message, then the
// action in Inter Semi Bold 14/20 green-500 (8px side padding).
export interface ActionToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ActionToast({ message, actionLabel, onAction }: ActionToastProps) {
  return (
    <div
      role="status"
      className="flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-[14px] bg-slate-900 py-2.5 pr-3 pl-4 shadow-toast"
    >
      <Icon name="toast-ok" size={20} />
      <p className="min-w-0 flex-1 truncate type-ui-14 font-medium text-white">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 px-2 type-ui-14 font-semibold text-green-500 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
