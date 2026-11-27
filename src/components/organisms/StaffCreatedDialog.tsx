"use client";

import Link from "next/link";

import { Button, Icon, RoleTag, StatePill } from "@/components/atoms";
import { NoticeBanner, StaffSummaryRow } from "@/components/molecules";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";
import type { CreatedStaff, InitialTaskState } from "@/hooks/useAddStaffForm";

// "Staff member created" (Figma "Modal" 103:18887): 480px, 24px radius, modal shadow, 28px padding
// (24px bottom), 20px gaps, over a slate-900/40 scrim. 48px success badge; title Inter Semi Bold
// 20/28 slate-900 over the message (14/20 slate-500); slate-50 summary (14px radius, 16 × 4
// padding) with the real staff ID; then Back to all staff (plain), Assign homes (outline, opens
// the profile's Assign homes drawer) and View profile (green). Without an invitation (no Figma
// frame) the account shows "Not invited" and the message leaves out the email. A preset first
// task adds an "Initial task" row (no Figma frame); if it couldn't be assigned, an error banner
// offers Try again, which retries only the task.
export interface StaffCreatedDialogProps {
  staff: CreatedStaff | null;
  task?: InitialTaskState | null;
  onRetryTask?: () => void;
  onOpenChange: (open: boolean) => void;
}

export function StaffCreatedDialog({
  staff,
  task,
  onRetryTask,
  onOpenChange,
}: StaffCreatedDialogProps) {
  const profile = staff ? `/staff/${encodeURIComponent(staff.id)}` : "/staff";
  return (
    <Dialog open={!!staff} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-900/40 supports-backdrop-filter:backdrop-blur-none"
        className="flex w-120 max-w-[calc(100%-2rem)] flex-col gap-5 rounded-[24px] bg-white px-7 pt-7 pb-6 shadow-modal ring-0 sm:max-w-120"
      >
        {staff && (
          <>
            <Icon name="success-48" size={48} />
            <div className="flex flex-col gap-1.5">
              <DialogTitle className="type-ui-20 font-semibold text-slate-900">
                Staff member created
              </DialogTitle>
              <DialogDescription className="type-ui-14 text-slate-500">
                {staff.invited
                  ? `${staff.name} has been added. An invitation was sent to ${staff.email}.`
                  : `${staff.name} has been added.`}
              </DialogDescription>
            </div>
            <dl className="flex flex-col rounded-[14px] bg-slate-50 px-4 py-1">
              <StaffSummaryRow label="Staff ID" divider>
                {staff.staffId}
              </StaffSummaryRow>
              <StaffSummaryRow label="Role" divider>
                <RoleTag>{staff.role}</RoleTag>
              </StaffSummaryRow>
              <StaffSummaryRow label="Assigned homes" divider>
                {staff.homes.length ? staff.homes.join(", ") : "None yet"}
              </StaffSummaryRow>
              {task && (
                <StaffSummaryRow label="Initial task" divider>
                  {task.status === "saving" ? "Assigning…" : task.title}
                </StaffSummaryRow>
              )}
              <StaffSummaryRow label="Account">
                <StatePill tone={staff.invited ? "warning" : "neutral"}>
                  {staff.invited ? "Pending invitation" : "Not invited"}
                </StatePill>
              </StaffSummaryRow>
            </dl>
            {task?.status === "failed" && (
              <NoticeBanner
                message={`The task wasn’t assigned. ${task.error ?? ""}`.trim()}
                action={
                  <button type="button" onClick={onRetryTask} className="hover:underline">
                    Try again
                  </button>
                }
              />
            )}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="ghost"
                size="pill-lg"
                render={<Link href="/staff" />}
                nativeButton={false}
              >
                Back to all staff
              </Button>
              <span className="flex-1" />
              <Button
                variant="outline"
                size="pill-lg"
                render={<Link href={`${profile}?assign=homes`} />}
                nativeButton={false}
              >
                Assign homes
              </Button>
              <Button
                variant="green"
                size="pill-lg"
                render={<Link href={profile} />}
                nativeButton={false}
              >
                View profile
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
