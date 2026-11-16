// Centred empty state with a small drawn "card" illustration, a title and a grey line, e.g.
// "No group homes found" (Figma 51:11543). The illustration is plain shapes in Figma, so it's
// built here rather than exported: a white-500 shadow card behind a black-10 frame holding a
// white card with two line-grey bars.
export interface EmptyNoticeProps {
  title: string;
  description?: string;
}

export function EmptyNotice({ title, description }: EmptyNoticeProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-5 text-center">
      <div aria-hidden className="relative h-10.75 w-44">
        <div className="absolute top-4.5 left-3 h-6.25 w-38 rounded-[8px] bg-white-500" />
        <div className="absolute top-0 left-0 rounded-[14px] border border-black-20 bg-black-10 p-0.5">
          <div className="flex w-42.5 items-center justify-between rounded-[12px] border border-black-20 bg-white p-2">
            <span className="h-2.25 w-13.5 rounded-[8px] bg-line" />
            <span className="h-2.25 w-6.75 rounded-[8px] bg-line" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="type-heading-sm font-medium text-black">{title}</p>
        {description && <p className="type-title-md text-black-60">{description}</p>}
      </div>
    </div>
  );
}
