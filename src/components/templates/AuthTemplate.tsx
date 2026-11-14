import type { ReactNode } from "react";

import { Logo } from "@/components/atoms";

// Layout for auth screens: logo near the top, content centred on the page.
// Figma frames: mobile 409 wide (24px side margins, 361px column), desktop 1440x960 (398px column).
// py-36 keeps the content clear of the logo on short phones; it doesn't move anything at Figma sizes.
export interface AuthTemplateProps {
  children: ReactNode;
}

export function AuthTemplate({ children }: AuthTemplateProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-white px-6 py-36">
      <Logo className="absolute top-25.75 left-1/2 -translate-x-1/2" />
      <main className="w-full max-w-99.5">{children}</main>
    </div>
  );
}
