import { Button, Icon, InitialsAvatar } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { HomeUpdateItem } from "@/types/home";

// A home update (Figma "Update / …" 60:14309): white, 14px radius, 18 × 16 padding, 10px gaps;
// caution-200 border while it needs your acknowledgement, slate-200 otherwise. Author row (36px
// avatar, name Semi Bold 14/20 over "role · 2h ago" 12/18 slate-500), title (Semi Bold 16/24),
// body (14/22 grey-700). Then a 10px-radius bar: caution-50 "Please read and acknowledge" (Medium
// 13/18 caution-700) with a green Acknowledge, or verified-50 "You acknowledged this update ·
// Oct 25, 10:58 AM" (verified-700) with an 18px tick (60:14463).
export interface UpdateCardProps {
  update: HomeUpdateItem;
  onAcknowledge: () => void;
  pending?: boolean;
}

export function UpdateCard({ update: u, onAcknowledge, pending }: UpdateCardProps) {
  const needsAck = u.requiresAck && !u.acknowledged;
  return (
    <li
      className={cn(
        "flex flex-col gap-2.5 rounded-[14px] border bg-white px-4.5 py-4",
        needsAck ? "border-caution-200" : "border-slate-200",
      )}
    >
      <div className="flex items-center gap-2.5">
        <InitialsAvatar name={u.author} size={36} />
        <div className="flex min-w-0 flex-col">
          <p className="truncate type-ui-14 font-semibold text-slate-900">{u.author}</p>
          <p className="type-ui-12 text-slate-500">
            {[u.authorRole, u.when].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <h3 className="type-ui-16-24 font-semibold text-slate-900">{u.title}</h3>
      <p className="type-ui-14 leading-5.5 whitespace-pre-line text-grey-700">{u.body}</p>
      {needsAck && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-[10px] bg-caution-50 px-3 py-2.5">
          <span className="flex-1 type-ui-13 font-medium text-caution-700">
            Please read and acknowledge
          </span>
          <Button
            variant="green"
            size="pill-sm"
            className="h-8 px-3 type-ui-13-20"
            disabled={pending}
            onClick={onAcknowledge}
          >
            Acknowledge
          </Button>
        </div>
      )}
      {u.acknowledged && (
        <div className="flex items-center gap-2.5 rounded-[10px] bg-verified-50 px-3 py-2.5">
          <Icon name="uploaded-ok-18" size={18} />
          <span className="type-ui-13 font-medium text-verified-700">
            You acknowledged this update · {u.acknowledged}
          </span>
        </div>
      )}
    </li>
  );
}
