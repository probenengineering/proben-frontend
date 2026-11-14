import type { ReactNode } from "react";

import { Logo } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Layout with the logo inside the centred column, 48px above the content (sign-up, welcome).
// raiseOnMobile: sits 23px above centre on phones/tablets, like the Figma sign-up mobile frame.
// preview: desktop (lg+) splits the page; form centred in the left half (+5px, as in Figma), panel flush right.
export interface LogoColumnTemplateProps {
  children: ReactNode;
  /** Panel shown on the right half on desktop only. */
  preview?: ReactNode;
  raiseOnMobile?: boolean;
}

export function LogoColumnTemplate({ children, preview, raiseOnMobile }: LogoColumnTemplateProps) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white">
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center px-6 py-12",
          raiseOnMobile && "pb-23.5 lg:pb-12",
          preview && "lg:w-1/2 lg:pl-8.5",
        )}
      >
        <main className="flex w-full max-w-99.5 flex-col items-center gap-12">
          <Logo />
          {children}
        </main>
      </div>
      {preview && (
        <div className="absolute top-1/2 left-1/2 ml-2.5 hidden -translate-y-1/2 lg:block">
          {preview}
        </div>
      )}
    </div>
  );
}
