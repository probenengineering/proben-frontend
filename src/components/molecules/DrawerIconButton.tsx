import { Icon } from "@/components/atoms";

// Round 36px slate-50 button in the task drawer header (Figma "Close" 60:11772, "Back"
// 60:11894) with an 18px icon.
export interface DrawerIconButtonProps {
  icon: "close-18" | "back-18";
  label: string;
  onClick: () => void;
}

export function DrawerIconButton({ icon, label, onClick }: DrawerIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 outline-none hover:bg-slate-100 focus-visible:bg-slate-100"
    >
      <Icon name={icon} size={18} />
    </button>
  );
}
