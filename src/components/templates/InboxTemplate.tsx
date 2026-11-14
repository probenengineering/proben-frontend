import type { ReactNode } from "react";

import { EmptyState } from "@/components/molecules";
import { cn } from "@/lib/utils";

// Inbox layout inside the app card: header on top, chat list on the left, the open chat
// ("No messages selected" when none) and an optional side panel (profile) on the right.
// Phones (<768px): one panel at a time: the list, or (when a chat is open) only the chat.
// Tablets (768–1023px): list (320px) and chat side by side; the profile covers the card.
// Desktop (1024px+): as Figma: 384px list, chat, 384px profile beside it.
export interface InboxTemplateProps {
  header: ReactNode;
  list: ReactNode;
  /** The open conversation. Leave out for the empty state. */
  detail?: ReactNode;
  /** Panel to the right of the conversation, e.g. the profile. */
  aside?: ReactNode;
}

export function InboxTemplate({ header, list, detail, aside }: InboxTemplateProps) {
  return (
    <div className="relative flex h-full w-full flex-col">
      <div className={cn("shrink-0", detail && "hidden md:block")}>{header}</div>
      <div className="flex min-h-0 flex-1">
        <div className={cn("h-full w-full shrink-0 md:w-80 lg:w-96", detail && "hidden md:block")}>
          {list}
        </div>
        <div
          className={cn(
            "min-w-0 flex-1",
            // Empty state: Figma leaves a 24px gap after the list and centres the message.
            detail ? "flex" : "ml-6 hidden items-center justify-center md:flex",
          )}
        >
          {detail ?? <EmptyState icon="direct-normal" message="No messages selected" />}
        </div>
        {aside && (
          <div className="absolute inset-0 z-10 bg-white lg:static lg:z-auto lg:h-full lg:shrink-0">
            {aside}
          </div>
        )}
      </div>
    </div>
  );
}
