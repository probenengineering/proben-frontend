import { InitialsAvatar } from "@/components/atoms";
import { STAFF_TINT_CLASSES, type StaffTint } from "@/lib/staff";

// Overlapping people (Figma "Avatar stack" 103:20897): 32px initials avatars (or photos) with a
// 2px white edge, each 8px over the next, then "2 staff" (Inter 13/18 grey-700), 10px apart.
// At most four faces; the label always counts everyone (`count`, else the people given).
export interface AvatarStackProps {
  people: { id?: string; name: string; tint: StaffTint; photoSrc?: string }[];
  count?: number;
}

const MAX_FACES = 4;

export function AvatarStack({ people, count = people.length }: AvatarStackProps) {
  const faces = people.slice(0, MAX_FACES);
  return (
    <span className="flex items-center gap-2.5" aria-label={people.map((p) => p.name).join(", ")}>
      {faces.length > 0 && (
        <span className="flex">
          {faces.map((p, i) => {
            const overlap = i < faces.length - 1 ? "-mr-2" : undefined;
            return (
              <InitialsAvatar
                key={p.id ?? p.name}
                name={p.name}
                size={32}
                ring
                tintClassName={STAFF_TINT_CLASSES[p.tint]}
                photoSrc={p.photoSrc}
                className={overlap}
              />
            );
          })}
        </span>
      )}
      <span className="type-ui-13 whitespace-nowrap text-grey-700">{count} staff</span>
    </span>
  );
}
