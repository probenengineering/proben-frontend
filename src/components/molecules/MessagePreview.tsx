import { Avatar } from "@/components/atoms";
import type { ChatMessageData } from "@/lib/chat-types";

import { ReactionChip } from "./ReactionChip";

// Grey card showing the message being deleted or forwarded (white-200 fill, 12px radius).
// Figma fixes it at 84px tall, which clips the reaction; we let it grow to fit.
export type MessagePreviewProps = Pick<
  ChatMessageData,
  "author" | "avatar" | "time" | "text" | "attachment" | "reactions"
>;

export function MessagePreview({
  author,
  avatar,
  time,
  text,
  attachment,
  reactions,
}: MessagePreviewProps) {
  return (
    <div className="flex w-full items-start gap-2.5 overflow-clip rounded-[12px] bg-white-200 px-5 py-3">
      <Avatar {...avatar} />
      <div className="flex min-w-0 flex-1 flex-col items-start text-left">
        <div className="flex w-full items-center gap-2.5">
          <p className="type-paragraph-sm font-medium whitespace-nowrap text-grey-900">{author}</p>
          <p className="flex-1 type-caption-sm font-sans! tracking-[0.04em]! text-black/50 capitalize">
            {time}
          </p>
        </div>
        <p className="type-paragraph-sm text-grey-700">{text ?? attachment?.name}</p>
        {reactions && reactions.length > 0 && (
          <div className="flex gap-1">
            {reactions.map((r) => (
              <ReactionChip key={r.emoji} {...r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
