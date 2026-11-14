import { Avatar as BaseAvatar, AvatarImage } from "@/components/ui";
import { cn } from "@/lib/utils";

// Figma component "Avatars": round photo (or initials) with a 1.5px white ring, colour behind it,
// and an optional status dot: green when online, grey when offline.
const sizes = { sm: "size-6", md: "size-10" }; // 24px, 40px
const colors = { peach: "bg-avatar-peach", pink: "bg-avatar-pink", orange: "bg-avatar-orange" };

// Dot positions differ slightly between Figma's online, offline and initials avatars.
function dotClass(status: "online" | "offline", initials?: string) {
  if (status === "online")
    return "top-[70%] right-0 bottom-[5%] left-3/4 rounded-[10px] bg-success-600";
  if (initials) return "top-[70%] -right-[5%] bottom-[5%] left-[80%] rounded-[8px] bg-grey-300";
  return "top-3/4 right-0 bottom-0 left-3/4 rounded-[8px] bg-grey-300";
}

export interface AvatarProps {
  /** Photo URL. Leave out to show initials or just the colour. */
  src?: string;
  alt?: string;
  /** Shown when there's no photo, e.g. "OM". */
  initials?: string;
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
  status?: "online" | "offline";
  /** White 1.5px ring. Some Figma avatars (offline ones) have none. */
  ring?: boolean;
  className?: string;
}

export function Avatar({
  src,
  alt = "",
  initials,
  size = "md",
  color = "pink",
  status,
  ring = true,
  className,
}: AvatarProps) {
  return (
    <BaseAvatar
      className={cn(
        sizes[size],
        colors[color],
        // shadcn draws its ring with ::after; Figma's is 1.5px white (or none).
        ring ? "after:border-[1.5px] after:border-white after:mix-blend-normal" : "after:hidden",
        className,
      )}
    >
      {src && <AvatarImage src={src} alt={alt} />}
      {!src && initials && (
        // Figma "Paragraph/Medium/Semibold" is Inter; the paragraph-md token is Inter Tight.
        // 24px avatars (no Figma frame with initials at this size) use 12px text so two letters fit.
        <span
          className={cn(
            "flex size-full items-center justify-center font-inter! font-semibold text-grey-900",
            size === "sm" ? "type-paragraph-xs" : "type-paragraph-md",
          )}
        >
          {initials}
        </span>
      )}
      {status && (
        <span className={cn("absolute border border-white", dotClass(status, initials))} />
      )}
    </BaseAvatar>
  );
}
