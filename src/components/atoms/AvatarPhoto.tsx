"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

// A profile photo laid over an avatar's initials (see InitialsAvatar `photoSrc`): it fades in once
// loaded, so there's never a blank circle while it loads, and on error the initials simply stay.
// A white backing hides the initials behind transparent photos (PNG logos). Photos come through
// our file proxy (/api/files/<id>), which adds the session token.
export interface AvatarPhotoProps {
  src: string;
}

export function AvatarPhoto({ src }: AvatarPhotoProps) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  if (state === "failed") return null;
  return (
    // A proxied, authenticated file: not a static asset next/image can optimise.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      // Already loaded from cache before hydration: onLoad won't fire, so check on mount.
      ref={(img) => {
        if (img?.complete && img.naturalWidth > 0 && state === "loading") setState("loaded");
      }}
      onLoad={() => setState("loaded")}
      onError={() => setState("failed")}
      className={cn(
        "absolute inset-0 size-full rounded-full bg-white object-cover transition-opacity duration-200 ease-out motion-reduce:transition-none",
        state === "loaded" ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
