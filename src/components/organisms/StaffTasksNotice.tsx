import { NoticeBanner, type NoticeBannerProps } from "@/components/molecules";

// Staff tasks or Assign task when the list can't be shown: no task access (info) or a failed
// load (error). The page's 20px side padding, then the banner (Figma "Error summary" 103:18750 /
// "Scope note" 103:19639 styles).
export type StaffTasksNoticeProps = Pick<NoticeBannerProps, "message" | "tone">;

export function StaffTasksNotice(props: StaffTasksNoticeProps) {
  return (
    <div className="px-5">
      <NoticeBanner {...props} />
    </div>
  );
}
