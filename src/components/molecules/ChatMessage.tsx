import Image from "next/image";

import { Avatar } from "@/components/atoms";
import type { ChatMessageData } from "@/lib/chat-types";
import { cn } from "@/lib/utils";

import { FileAttachment } from "./FileAttachment";
import type { MessageAction } from "./MessageActionsMenu";
import { MessageEditBox } from "./MessageEditBox";
import { MessageToolbar } from "./MessageToolbar";
import { ReactionChip } from "./ReactionChip";

// One message in a conversation: avatar, name, time, text or file, reactions and reply quote.
// Hover (or an open ⋮ menu) greys the row and shows the toolbar 16px above its top-right.
export interface ChatMessageProps extends Omit<ChatMessageData, "id"> {
  /** Called for Reply, Edit, Copy, Forward or Delete from the hover toolbar. */
  onAction?: (action: MessageAction) => void;
  /** Called to toggle a reaction (toolbar, picker or clicking a reaction chip). */
  onReact?: (emoji: string) => void;
  /** Editing mode: the text becomes an inline editor; reaction and toolbar hide. */
  editing?: boolean;
  onEditSave?: (text: string) => void;
  onEditCancel?: () => void;
}

const captionClass =
  "type-caption-sm font-sans! tracking-[0.04em]! whitespace-nowrap text-black/50 capitalize";

export function ChatMessage({
  author,
  avatar,
  time,
  text,
  attachment,
  reactions,
  replyTo,
  mine,
  onAction,
  onReact,
  editing,
  onEditSave,
  onEditCancel,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "group relative w-full px-5 hover:bg-white-200 has-data-popup-open:bg-white-200",
        replyTo ? "pt-6.75" : "py-3",
        editing && "bg-white-200",
      )}
    >
      {replyTo && (
        <>
          {/* Figma: connector from the reply's avatar up to the quoted avatar. */}
          <Image
            src="/images/reply-connector.svg"
            alt=""
            width={33}
            height={26}
            className="absolute top-[9.33px] left-[39.5px] h-[25.67px] w-[33.17px]"
          />
          {/* Stops at the column's 20px right padding and cuts off with "…" in narrow chats. */}
          <div className="absolute top-0 right-5 left-17.5 flex items-center gap-2.5">
            <Avatar size="sm" {...replyTo.avatar} />
            <div className="flex min-w-0 items-center gap-2">
              <p className={captionClass}>{replyTo.author}</p>
              <p className="truncate type-paragraph-sm text-grey-700">{replyTo.text}</p>
            </div>
          </div>
        </>
      )}

      <div className={cn("flex w-full items-start gap-2.5", replyTo && "py-2")}>
        <Avatar {...avatar} />
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col items-start",
            attachment && "gap-4",
            editing && "gap-2",
          )}
        >
          <div className="flex w-full items-center gap-2.5">
            <p className="type-paragraph-sm font-medium whitespace-nowrap text-grey-900">
              {author}
            </p>
            <p className={cn(captionClass, "flex-1")}>{time}</p>
          </div>
          {editing ? (
            <MessageEditBox
              defaultValue={text ?? ""}
              onSave={(value) => onEditSave?.(value)}
              onCancel={() => onEditCancel?.()}
            />
          ) : (
            text && <p className="type-paragraph-sm text-grey-700">{text}</p>
          )}
          {attachment && <FileAttachment {...attachment} />}
          {reactions && reactions.length > 0 && !editing && (
            <div className="flex flex-wrap gap-1">
              {reactions.map((r) => (
                <ReactionChip key={r.emoji} {...r} onClick={() => onReact?.(r.emoji)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {!editing && (
        <MessageToolbar
          onAction={onAction}
          onReact={onReact}
          hide={mine ? [] : ["edit", "delete"]}
          className="absolute -top-4 right-3.5 hidden group-hover:flex group-has-data-popup-open:flex"
        />
      )}
    </div>
  );
}
