"use client";

import { Button } from "@/components/atoms";
import { EmptyNotice } from "@/components/molecules";

// Something on an app page failed while rendering: the sidebar stays and the content area offers
// a retry instead of a blank or broken screen. No Figma frame (built from EmptyNotice + Button).
export default function AppError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20">
      <EmptyNotice
        title="Something went wrong"
        description="This page didn't load properly. Try again, or come back in a moment."
      />
      <Button variant="green" size="pill" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
