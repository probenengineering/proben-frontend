import { InitialsAvatar } from "@/components/atoms";

// Person on the Home team card (Figma "Member / …" 60:13912): 32px round avatar with initials
// (Inter Semi Bold 12/16) in the person's tint (lib/avatar-tint), then the
// name (Inter Medium 14/20 slate-900) over the role (12/18 slate-500). 10px gap.
export interface TeamMemberProps {
  name: string;
  role?: string;
}

export function TeamMember({ name, role }: TeamMemberProps) {
  return (
    <li className="flex items-center gap-2.5">
      <InitialsAvatar name={name} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate type-ui-14 font-medium text-slate-900">{name}</span>
        {role && <span className="truncate type-ui-12 text-slate-500">{role}</span>}
      </span>
    </li>
  );
}
