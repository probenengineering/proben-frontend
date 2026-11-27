import { Button } from "@/components/atoms";

// Table footer with paging (Figma "Pagination" 103:18406): white, 16 × 10 padding, 8px gaps. The
// summary in Inter 13/18 slate-500 ("Showing 1–6 of 10 staff" or "Loading staff…"), then outline
// pills (grey-300 border, 14 × 7 padding, Inter Semi Bold 14/20 grey-700) on the right.
export interface TablePaginationProps {
  summary: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function TablePagination({
  summary,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: TablePaginationProps) {
  const pill = "h-auto rounded-full px-3.5 py-[7px] type-ui-14 font-semibold";
  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2.5">
      <p className="min-w-0 flex-1 truncate type-ui-13 text-slate-500">{summary}</p>
      <Button variant="outline" className={pill} disabled={!hasPrevious} onClick={onPrevious}>
        Previous
      </Button>
      <Button variant="outline" className={pill} disabled={!hasNext} onClick={onNext}>
        Next
      </Button>
    </div>
  );
}
