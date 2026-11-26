import type { ReactNode } from "react";

// Task drawer footer (Figma "Footer" 60:11821): slate-200 top border, 28px sides, 16px top /
// 20px bottom, 12px gaps between the buttons.
export interface DrawerFooterProps {
  children: ReactNode;
}

export function DrawerFooter({ children }: DrawerFooterProps) {
  return <div className="flex gap-3 border-t border-slate-200 px-7 pt-4 pb-5">{children}</div>;
}
