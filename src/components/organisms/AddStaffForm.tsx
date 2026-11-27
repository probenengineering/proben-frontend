"use client";

import Link from "next/link";

import { Button } from "@/components/atoms";
import { Breadcrumb, NoticeBanner, StickyActionBar } from "@/components/molecules";
import { useAddStaffForm } from "@/hooks/useAddStaffForm";
import type { StaffFormOptions } from "@/lib/staff-form";

import { StaffCreatedDialog } from "./StaffCreatedDialog";
import {
  StaffAssignmentSection,
  StaffEmploymentSection,
  StaffPersonalSection,
} from "./StaffFormSections";

// Add staff (Figma 103:18646; errors 103:18725; created 103:18807): breadcrumb, the error banner
// after a failed Create, the three sections (20px padding, 16px gaps), then the action bar pinned
// to the bottom. Create staff saves the person (POST /staff) and opens the success modal; Create &
// assign saves them, then opens Assign task for them. There are no drafts in the backend, so Save
// draft isn't offered. Without staff.manage, or if roles and homes can't load, a notice shows
// instead of the form.
export interface AddStaffFormProps {
  options?: StaffFormOptions;
  canManage: boolean;
  loadError?: string;
}

export function AddStaffForm({ options, canManage, loadError }: AddStaffFormProps) {
  if (canManage && options) return <AddStaffFormBody options={options} />;
  return (
    <div className="flex flex-col gap-4 p-5">
      <Breadcrumb parent={{ label: "All staff", href: "/staff" }} current="Add staff" />
      {canManage ? (
        <NoticeBanner message={`We couldn’t load roles and homes. ${loadError ?? ""}`.trim()} />
      ) : (
        <NoticeBanner
          tone="info"
          message="You don’t have permission to add staff. Ask an administrator to add them."
        />
      )}
    </div>
  );
}

function AddStaffFormBody({ options }: { options: StaffFormOptions }) {
  const form = useAddStaffForm(options);
  const n = form.errorCount;

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        void form.create();
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <Breadcrumb parent={{ label: "All staff", href: "/staff" }} current="Add staff" />
        {n > 0 && (
          <NoticeBanner
            message={`Fix ${n} ${n === 1 ? "field" : "fields"} to create this staff member. Your other entries are kept.`}
          />
        )}
        {form.failure && <NoticeBanner message={form.failure} />}
        <StaffPersonalSection form={form} />
        <StaffEmploymentSection form={form} />
        <StaffAssignmentSection form={form} />
      </div>
      <StickyActionBar note="Fields marked * are required.">
        <Button variant="ghost" size="pill-lg" render={<Link href="/staff" />} nativeButton={false}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          size="pill-lg"
          disabled={form.saving}
          onClick={() => void form.create("assign")}
        >
          Create &amp; assign
        </Button>
        <Button type="submit" variant="green" size="pill-lg" disabled={form.saving}>
          {form.saving ? "Creating…" : "Create staff"}
        </Button>
      </StickyActionBar>
      <StaffCreatedDialog
        staff={form.created}
        task={form.task}
        onRetryTask={form.retryTask}
        onOpenChange={(open) => !open && form.closeCreated()}
      />
    </form>
  );
}
