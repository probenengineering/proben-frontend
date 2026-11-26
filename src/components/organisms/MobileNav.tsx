import { MenuIcon } from "lucide-react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

import { AppSidebar } from "./AppSidebar";

// Phones (below 768px; tablets get the icons-only sidebar): a ☰ button that opens the app sidebar as a drawer from the left.
// Not in Figma (agreed): the ☰ icon is lucide's, as Figma has no menu icon.
export interface MobileNavProps {
  className?: string;
  /** Sidebar item to highlight, like the desktop sidebar. */
  activeItem?: "home" | "notifications";
}

export function MobileNav({ className, activeItem }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger aria-label="Open menu" className={cn("flex", className)}>
        <MenuIcon className="size-5 text-icon" strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="gap-0 overflow-y-auto bg-surface p-0 data-[side=left]:w-68 data-[side=left]:max-w-[85vw] data-[side=left]:border-r-0"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <AppSidebar activeItem={activeItem} />
      </SheetContent>
    </Sheet>
  );
}
