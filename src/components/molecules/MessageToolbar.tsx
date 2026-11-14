import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

import { EmojiButton } from "./EmojiButton";
import { type MessageAction, MessageActionsMenu } from "./MessageActionsMenu";

// Figma "Pointers": quick reactions (✅ 👍 🙌), add reaction, reply in thread, forward, more (⋮).
// Shown on message hover. Reactions go to onReact; reply/forward/⋮ actions go to onAction.
export interface MessageToolbarProps {
  className?: string;
  onAction?: (action: MessageAction) => void;
  onReact?: (emoji: string) => void;
  /** Actions to leave out of the ⋮ menu. */
  hide?: MessageAction[];
}

const QUICK_REACTIONS = ["✅", "👍", "🙌"];

export function MessageToolbar({ className, onAction, onReact, hide }: MessageToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 overflow-clip rounded-[12px] border border-white-400 bg-white px-3 py-2",
        className,
      )}
    >
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`React with ${emoji}`}
          onClick={() => onReact?.(emoji)}
          className="type-caption-sm font-sans! tracking-[0.04em]!"
        >
          {emoji}
        </button>
      ))}
      <EmojiButton
        icon="happyemoji-sm"
        size={14}
        label="Add reaction"
        onPick={(emoji) => onReact?.(emoji)}
      />
      <button type="button" aria-label="Reply" className="flex" onClick={() => onAction?.("reply")}>
        <Icon name="message-text" size={14} />
      </button>
      <button
        type="button"
        aria-label="Forward"
        className="flex"
        onClick={() => onAction?.("forward")}
      >
        <Icon name="send-2" size={14} />
      </button>
      <MessageActionsMenu onAction={onAction} onReact={onReact} hide={hide} />
    </div>
  );
}
