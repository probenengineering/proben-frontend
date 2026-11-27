// Figma "Role Tag" (All staff 103:18400): slate-100 box, 6px radius (no radius token yet), 8 × 2
// padding, Inter Medium 12/17 grey-700, e.g. "Caregiver".
// size "md" (8 × 4): permission chips on the staff profile (103:19030).
export interface RoleTagProps {
  children: string;
  size?: "sm" | "md";
}

// Long role names ("Information governance lead") end in an ellipsis, with the full name on hover.
export function RoleTag({ children, size = "sm" }: RoleTagProps) {
  return (
    <span
      title={children}
      className={`inline-block max-w-full min-w-0 truncate rounded-[6px] bg-slate-100 px-2 align-middle type-ui-12-17 font-medium whitespace-nowrap text-grey-700 ${size === "md" ? "py-1" : "py-0.5"}`}
    >
      {children}
    </span>
  );
}
