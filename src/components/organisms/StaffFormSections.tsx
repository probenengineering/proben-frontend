"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import {
  FormSection,
  FormSelectField,
  FormTextField,
  InfoNote,
  InvitationToggle,
  PhotoUpload,
} from "@/components/molecules";
import type { AddStaffFormState } from "@/hooks/useAddStaffForm";
import { type StaffFieldError, TASK_OPTIONS } from "@/lib/staff-form";

// The three sections of the Add staff form (Figma 103:18671, 103:18688, 103:18701). Rows are two
// or three equal columns 16px apart on desktop; one column on phones. Roles, homes and departments
// come from the API; if departments couldn't load, that field is disabled.
type Form = AddStaffFormState;

const ROW2 = "grid grid-cols-1 gap-4 sm:grid-cols-2";
const ROW3 = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3";

function message(error: StaffFieldError | undefined, duplicateOf?: string): ReactNode {
  if (!error) return undefined;
  if (typeof error === "object") return error.server;
  if (error === "required") return "This field is required.";
  if (error === "invalid") return "Enter a valid email address.";
  if (error === "scope") {
    return "This role is given per home. Choose a home you can assign it in, or pick another role.";
  }
  return (
    <>
      A staff record with this email already exists.
      {duplicateOf && (
        <>
          {" "}
          <Link
            href={`/staff/${encodeURIComponent(duplicateOf)}`}
            className="font-semibold text-green-ink hover:underline"
          >
            View existing record
          </Link>
        </>
      )}
    </>
  );
}

const labels = (items: { label: string }[]) => items.map((item) => item.label);

export function StaffPersonalSection({ form }: { form: Form }) {
  const { values, set, errors, duplicateOf, photo } = form;
  return (
    <FormSection
      title="Personal information"
      description="Basic details for the staff record."
      extra={<PhotoUpload status={photo.status} onChange={(file) => void photo.pick(file)} />}
    >
      <div className={ROW2}>
        <FormTextField
          label="First name"
          required
          placeholder="Enter first name"
          autoComplete="given-name"
          value={values.firstName}
          onChange={set("firstName")}
          error={message(errors.firstName)}
        />
        <FormTextField
          label="Last name"
          required
          placeholder="Enter last name"
          autoComplete="family-name"
          value={values.lastName}
          onChange={set("lastName")}
          error={message(errors.lastName)}
        />
      </div>
      <div className={ROW2}>
        <FormTextField
          label="Email address"
          required
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          helper="Used to send the account invitation."
          value={values.email}
          onChange={set("email")}
          error={message(errors.email, duplicateOf)}
        />
        <FormTextField
          label="Phone number"
          type="tel"
          placeholder="(608) 555-0100"
          autoComplete="tel"
          value={values.phone}
          onChange={set("phone")}
          error={message(errors.phone)}
        />
      </div>
    </FormSection>
  );
}

export function StaffEmploymentSection({ form }: { form: Form }) {
  const { values, set, errors, options } = form;
  return (
    <FormSection title="Employment information" description="Details about their position.">
      <div className={ROW3}>
        <FormTextField
          label="Staff ID"
          placeholder="Auto-generated"
          readOnly
          tabIndex={-1}
          value=""
          onChange={() => {}}
        />
        <FormSelectField
          label="Employment type"
          placeholder="Select type"
          options={labels(options.employmentTypes)}
          value={values.employmentType}
          onChange={set("employmentType")}
          error={message(errors.employmentType)}
        />
        <FormSelectField
          label="Department"
          placeholder={options.departments ? "Select department" : "Departments unavailable"}
          options={labels(options.departments ?? [])}
          value={values.department}
          onChange={set("department")}
          disabled={!options.departments?.length}
          error={message(errors.department)}
        />
      </div>
      <div className={ROW3}>
        <FormTextField
          label="Start date"
          type="date"
          value={values.startDate}
          onChange={set("startDate")}
          error={message(errors.startDate)}
        />
        <FormSelectField
          label="Employment status"
          placeholder={values.invite ? "Pending invitation" : "Not invited"}
          options={[]}
          value={[]}
          onChange={() => {}}
          disabled
        />
      </div>
    </FormSection>
  );
}

export function StaffAssignmentSection({ form }: { form: Form }) {
  const { values, set, errors, options } = form;
  return (
    <FormSection
      title="Initial assignment"
      description="Homes and tasks are optional. You can assign them later."
    >
      <div className={ROW3}>
        <FormSelectField
          label="Role"
          required
          placeholder="Select role"
          options={labels(options.roles)}
          value={values.role}
          onChange={set("role")}
          error={message(errors.role)}
        />
        <FormSelectField
          label="Assigned homes"
          placeholder="Select homes"
          multiple
          options={labels(options.homes)}
          value={values.homes}
          onChange={set("homes")}
          error={message(errors.homes)}
        />
        <FormSelectField
          label="Initial task"
          placeholder="Select a task or create one"
          options={TASK_OPTIONS}
          value={values.task}
          onChange={set("task")}
        />
      </div>
      <InvitationToggle checked={values.invite} onChange={set("invite")} />
      <InfoNote>
        A staff record isn’t a sign-in. Access starts when they accept the invitation.
      </InfoNote>
    </FormSection>
  );
}
