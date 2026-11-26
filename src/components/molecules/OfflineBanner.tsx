import { Button } from "@/components/atoms";

// "You're offline" banner above the My tasks toolbar (Figma "Offline banner" 60:11662):
// caution-50 fill, caution-200 border, 12px radius, 16 × 12 padding, 12px gaps. Wifi-off icon,
// title Inter Semi Bold 14/20 + message Inter 13/18, both caution-700, then a white Retry pill.
export interface OfflineBannerProps {
  /** "10:42 AM": when the tasks on screen were loaded. */
  savedAt?: string;
  onRetry: () => void;
}

export function OfflineBanner({ savedAt, onRetry }: OfflineBannerProps) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-[12px] border border-caution-200 bg-caution-50 px-4 py-3"
    >
      {/* Inline (same paths as public/icons/offline.svg): an <img> can't load once offline. */}
      <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
        <path
          d="M2.5 7.49989C4.53628 5.60197 7.21638 4.54663 10 4.54663C12.7836 4.54663 15.4637 5.60197 17.5 7.49989M5.2 10.3999C6.49874 9.17637 8.2157 8.49499 10 8.49499C11.7843 8.49499 13.5013 9.17637 14.8 10.3999M8 13.1999C8.55002 12.7079 9.26207 12.436 10 12.436C10.7379 12.436 11.45 12.7079 12 13.1999M3 3L17 17"
          className="stroke-caution-700"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex min-w-0 flex-1 flex-col text-caution-700">
        <p className="type-ui-14 font-semibold">You’re offline</p>
        <p className="type-ui-13">
          {savedAt ? `Showing tasks saved at ${savedAt}. ` : ""}You can view details, but
          submissions are paused until you reconnect.
        </p>
      </div>
      <Button variant="outline" size="pill-md" className="shrink-0 px-4 py-[9px]" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
