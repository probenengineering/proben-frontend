"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { createTaskAction } from "@/lib/staff-api/actions";
import { addStaffAction } from "@/lib/staff-api/add-staff-actions";
import {
  emptyStaffForm,
  INITIAL_TASKS,
  NEW_TASK,
  roleAssignments,
  serverFieldErrors,
  type StaffFormErrors,
  type StaffFormOptions,
  type StaffFormValues,
  validateStaffForm,
} from "@/lib/staff-form";
import { showToast } from "@/lib/toast";

import { useStaffPhoto } from "./useStaffPhoto";

export interface CreatedStaff {
  id: string;
  name: string;
  email: string;
  staffId: string;
  role: string;
  homes: string[];
  /** The invitation was sent ("Pending invitation"); false = "Not invited". */
  invited: boolean;
}

/** The preset first task, assigned after the person is created; it can be retried alone. */
export interface InitialTaskState {
  title: string;
  status: "saving" | "done" | "failed";
  error?: string;
}

// Add staff form state (Figma 103:18646). Errors appear after the first Create (103:18725) and then
// update as fields are fixed; the backend's own field errors (400) and a duplicate email (409)
// show on their fields until edited. A created person opens the success modal (103:18807), or
// Assign task for them (Create & assign, or "Create a new task"). The person is created once:
// a failed first task is retried on its own, and closing the modal clears the form.
export function useAddStaffForm(options: StaffFormOptions) {
  const router = useRouter();
  const photo = useStaffPhoto();
  const [values, setValues] = useState<StaffFormValues>(emptyStaffForm);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<StaffFormErrors>({});
  const [failure, setFailure] = useState<string>();
  const [duplicateOf, setDuplicateOf] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<CreatedStaff | null>(null);
  const [task, setTask] = useState<InitialTaskState | null>(null);
  const taskInput = useRef<Parameters<typeof createTaskAction>[0] | null>(null);

  const role = options.roles.find((r) => r.label === values.role[0]);
  const homeIds = values.homes.flatMap((label) => {
    const home = options.homes.find((h) => h.label === label);
    return home ? [home.id] : [];
  });
  const roles = role ? roleAssignments(role, homeIds) : null;

  const check = (): StaffFormErrors => {
    const errors = validateStaffForm(values);
    if (role && !roles) errors.role = "scope";
    return errors;
  };
  const errors: StaffFormErrors = submitted ? { ...serverErrors, ...check() } : {};
  const errorCount = Object.keys(errors).length;

  const set =
    <K extends keyof StaffFormValues>(key: K) =>
    (value: StaffFormValues[K]) => {
      setValues((v) => ({ ...v, [key]: value }));
      // A backend error stays on its field until that field changes.
      setServerErrors((current) => {
        if (!(key in current)) return current;
        const next = { ...current };
        delete next[key as keyof StaffFormErrors];
        return next;
      });
    };

  /** Assigns the preset first task; returns its error, if any. */
  const assignTask = async () => {
    const input = taskInput.current;
    if (!input) return undefined;
    setTask({ title: input.title, status: "saving" });
    const result = await createTaskAction(input);
    setTask(
      result.ok
        ? { title: input.title, status: "done" }
        : { title: input.title, status: "failed", error: result.error },
    );
    return result.ok ? undefined : result.error;
  };

  const create = async (then: "summary" | "assign" = "summary") => {
    if (saving || created) return false;
    setSubmitted(true);
    setServerErrors({});
    setFailure(undefined);
    setDuplicateOf(undefined);
    if (Object.keys(check()).length > 0 || !roles) return false;
    if (photo.busy) {
      showToast("error", "Wait for the photo to finish uploading.");
      return false;
    }

    setSaving(true);
    const department = options.departments?.find((d) => d.label === values.department[0]);
    const employment = options.employmentTypes.find((e) => e.label === values.employmentType[0]);
    const result = await addStaffAction({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      employmentType: employment?.id,
      startDate: values.startDate || undefined,
      departmentId: department?.id,
      avatarFileId: photo.fileId,
      homes: homeIds.map((homeId, i) => ({ homeId, isPrimary: i === 0 })),
      roles,
      sendInvite: values.invite,
    });

    if (!result.ok) {
      setSaving(false);
      const mapped = serverFieldErrors(result.fields);
      if (result.code === "STAFF_EMAIL_EXISTS") {
        mapped.errors.email = "duplicate";
        setDuplicateOf(result.staffId);
      }
      setServerErrors(mapped.errors);
      const fieldErrors = Object.keys(mapped.errors).length > 0;
      if (mapped.other.length > 0) setFailure(mapped.other.join(" "));
      else if (!fieldErrors) setFailure(result.error);
      return false;
    }

    const person = result.data;
    const preset = INITIAL_TASKS.find((t) => t.title === values.task[0]);
    let taskError: string | undefined;
    if (preset) {
      const due = new Date();
      due.setDate(due.getDate() + 7);
      due.setHours(17, 0, 0, 0);
      taskInput.current = {
        staffId: person.id,
        homeId: homeIds[0],
        title: preset.title,
        description: preset.description,
        priority: "medium",
        dueAt: due.toISOString(),
      };
      taskError = await assignTask();
    }
    setSaving(false);

    if (then === "assign" || values.task[0] === NEW_TASK) {
      showToast("success", `${person.name} was added.`);
      if (taskError) showToast("error", `“${preset!.title}” wasn’t assigned. ${taskError}`);
      router.push(`/staff/tasks/new?staff=${encodeURIComponent(person.id)}`);
      return true;
    }
    setCreated({
      id: person.id,
      name: person.name,
      email: person.email,
      staffId: person.staffId,
      role: role!.label,
      homes: person.homes.length > 0 ? person.homes : values.homes,
      invited: !person.notInvited,
    });
    return true;
  };

  /** Closing the modal starts a fresh form, so the same person can't be created twice. */
  const closeCreated = () => {
    setCreated(null);
    setTask(null);
    taskInput.current = null;
    setValues(emptyStaffForm());
    setSubmitted(false);
    setServerErrors({});
    photo.reset();
  };

  return {
    options,
    values,
    set,
    errors,
    errorCount,
    duplicateOf,
    failure,
    saving,
    photo,
    create,
    created,
    task,
    retryTask: () => void assignTask(),
    closeCreated,
  };
}

export type AddStaffFormState = ReturnType<typeof useAddStaffForm>;
