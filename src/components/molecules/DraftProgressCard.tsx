// Saved-draft progress in the task drawer (Figma "Progress" 60:12375): progress-50, 12px radius,
// 16 × 14 padding, 8px gaps. "3 of 4 required fields complete" + "75%" (Inter Semi Bold 14/20
// progress-700), an 8px white track with a progress-500 bar, then "Draft saved Oct 24, 4:12 PM"
// (12/18 progress-700).
export interface DraftProgressCardProps {
  done: number;
  total: number;
  /** "Oct 24, 4:12 PM". */
  savedAt?: string;
}

export function DraftProgressCard({ done, total, savedAt }: DraftProgressCardProps) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-2 rounded-[12px] bg-progress-50 px-4 py-3.5 text-progress-700">
      <div className="flex items-center justify-between gap-3 type-ui-14 font-semibold">
        <span>
          {done} of {total} required fields complete
        </span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Required fields complete"
        className="h-2 overflow-hidden rounded-full bg-white"
      >
        <div className="h-full rounded-full bg-progress-500" style={{ width: `${percent}%` }} />
      </div>
      {savedAt && <p className="type-ui-12">Draft saved {savedAt}</p>}
    </div>
  );
}
