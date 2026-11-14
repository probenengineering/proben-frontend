import type { CSSProperties } from "react";

import { Toaster as BaseToaster } from "@/components/ui";

// Where toasts appear: bottom centre. Mount once in the root layout; show toasts with showToast().
// 435px wide (Figma). Below 600px Sonner makes it full width; mobileOffset keeps 24px side margins.
export function Toaster() {
  return (
    <BaseToaster
      position="bottom-center"
      offset={24}
      mobileOffset={24}
      style={{ "--width": "435px" } as CSSProperties}
      // Sonner only sizes its own styled toasts; ours (toast.custom) would shrink to the text and
      // sit at the left edge. Fill the 435px toaster so the toast is centred.
      toastOptions={{ className: "w-full" }}
    />
  );
}
