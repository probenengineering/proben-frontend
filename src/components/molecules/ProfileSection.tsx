import type { ReactNode } from "react";

// A block in the profile panel ("Assigned Homes", "Shared files", ...), 24px side padding.
export interface ProfileSectionProps {
  title?: string;
  children: ReactNode;
}

export function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <section className="flex w-full flex-col gap-5 px-6">
      {title && (
        <h3 className="flex h-5.25 items-center type-paragraph-sm font-medium text-black">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}
