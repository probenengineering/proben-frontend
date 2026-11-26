import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Home marker (Figma "Marker / …" 60:13422; selected 60:13900): a round pin with a 3px white
// ring and a drop shadow, then a label pill 4px below (8px radius, Inter Semi Bold 12/16).
// Normal: 36px green-500 pin, white label with slate-900 text. Selected: 44px green-ink pin with a
// green glow, slate-900 label with white text. `count` shows a number instead of the house.
export interface MapPinProps {
  label: string;
  selected?: boolean;
  count?: number;
}

export function MapPin({ label, selected, count }: MapPinProps) {
  return (
    <span className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "flex items-center justify-center rounded-full border-3 border-white",
          selected
            ? "size-11 bg-green-ink shadow-[0_4px_10px_rgb(15_23_41/0.25),0_0_0_8px_rgb(133_196_64/0.3)]"
            : "size-9 bg-green-500 shadow-[0_4px_10px_rgb(15_23_41/0.25)]",
        )}
      >
        {count ? (
          <span className="type-ui-15-20 font-bold text-white">{count}</span>
        ) : (
          <Icon name="pin-home-18" size={selected ? 22 : 18} />
        )}
      </span>
      <span
        className={cn(
          "rounded-[8px] px-2 py-0.75 type-ui-12-16 font-semibold whitespace-nowrap shadow-[0_2px_6px_rgb(15_23_41/0.15)]",
          selected ? "bg-slate-900 text-white" : "bg-white text-slate-900",
        )}
      >
        {label}
      </span>
    </span>
  );
}
