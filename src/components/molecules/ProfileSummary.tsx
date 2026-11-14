import Image from "next/image";

// Top of the profile panel: 120px rounded photo (initials while there's none), name, role,
// local time and branch. Rows without a value are left out.
export interface ProfileSummaryProps {
  name: string;
  role?: string;
  localTime?: string;
  branch?: string;
  photoSrc?: string;
  /** Shown when there's no photo, e.g. "JS". */
  initials?: string;
}

export function ProfileSummary({
  name,
  role,
  localTime,
  branch,
  photoSrc,
  initials,
}: ProfileSummaryProps) {
  return (
    <div className="flex w-full gap-5 px-6">
      {/* Figma radius 20px; no radius token yet. */}
      <div className="relative flex size-30 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-line">
        {photoSrc ? (
          <Image src={photoSrc} alt={name} fill sizes="120px" className="object-cover" />
        ) : (
          <span className="type-title-lg font-medium text-grey-900">{initials}</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="type-title-lg font-medium text-black">{name}</p>
        {role && <p className="truncate type-paragraph-sm text-grey-700">{role}</p>}
        {(localTime || branch) && (
          <div className="flex flex-col gap-2 type-paragraph-sm text-grey-700">
            {localTime && <p className="truncate">{localTime}</p>}
            {branch && <p className="truncate">{branch}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
