"use client";

import { useEffect, useRef, useState } from "react";

import {
  createTaskAction,
  searchStaffAction,
  type StaffOption,
  type TaskInput,
} from "@/lib/staff-api/actions";
import type { ApiAdminTask, ApiStaffHome } from "@/lib/staff-api/types";
import { uploadTaskReference } from "@/lib/staff-api/upload-reference";

// Assign task form state (Figma 103:20399). Required: title, description, due date, assignee, and
// the related home when you can only assign tasks in some homes. Errors show after the first
// Assign and clear as fields are fixed; the backend's field errors (400) show on their fields.
// Assign uploads the reference files (once each), then POST /admin/tasks.
export const PRIORITIES = ["Low", "Medium", "High"];

/** 30-minute slots, "12:00 AM" … "11:30 PM". */
export const DUE_TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${i % 2 ? "30" : "00"} ${h < 12 ? "AM" : "PM"}`;
});

/** "Daniel Mensah · Caregiver" (no-break spaces keep Figma's double spacing). */
export const assigneeLabel = (s: { name: string; role: string }) => `${s.name}  ·  ${s.role}`;

export interface AssignTaskValues {
  title: string;
  description: string;
  instructions: string;
  priority: string[];
  dueDate: string;
  dueTime: string[];
  home: string[];
  files: File[];
  link: string;
}

export type AssignTaskField =
  "title" | "description" | "instructions" | "priority" | "dueDate" | "assignee" | "home" | "link";

export interface AssignTaskSetup {
  options: StaffOption[];
  preset?: StaffOption;
  /** "all" = provider-wide (home optional); else the homes you can assign tasks in. */
  homeScope: "all" | string[];
}

const REQUIRED = "This field is required.";
const SEARCH_MS = 300;

/** Backend field (dotted path) → form field. */
const FROM_API: Record<string, AssignTaskField> = {
  title: "title",
  description: "description",
  instructions: "instructions",
  priority: "priority",
  dueAt: "dueDate",
  staffId: "assignee",
  homeId: "home",
  referenceUrl: "link",
};

/** "5:00 PM" on 2026-12-04 (local) → ISO instant. */
function dueAt(date: string, slot = "5:00 PM") {
  const [clock, meridiem] = slot.split(" ");
  const [h, m] = clock.split(":").map(Number);
  const hour = (h % 12) + (meridiem === "PM" ? 12 : 0);
  const [y, mo, d] = date.split("-").map(Number);
  return new Date(y, mo - 1, d, hour, m).toISOString();
}

const isLink = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/** Home names to pick from; a repeated name gets its code. */
function homeChoices(homes: ApiStaffHome[]) {
  const named = homes.filter((h): h is ApiStaffHome & { id: string; name: string } =>
    Boolean(h.id && h.name),
  );
  return named.map((h) => ({
    id: h.id,
    label:
      named.filter((o) => o.name === h.name).length > 1 && h.code
        ? `${h.name} (${h.code})`
        : h.name,
  }));
}

export function useAssignTaskForm({ options: initialOptions, preset, homeScope }: AssignTaskSetup) {
  const [values, setValues] = useState<AssignTaskValues>({
    title: "",
    description: "",
    instructions: "",
    priority: ["Medium"],
    dueDate: "",
    dueTime: ["5:00 PM"],
    home: [],
    files: [],
    link: "",
  });
  const [staff, setStaff] = useState<StaffOption | null>(preset ?? null);
  const [options, setOptions] = useState(
    preset && !initialOptions.some((o) => o.id === preset.id)
      ? [preset, ...initialOptions]
      : initialOptions,
  );
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Partial<Record<AssignTaskField, string>>>({});
  const [busy, setBusy] = useState<"uploading" | "assigning" | null>(null);
  const uploaded = useRef(new Map<File, string>());
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const clearServer = (field: AssignTaskField) =>
    setServerErrors((e) => {
      if (!(field in e)) return e;
      const rest = { ...e };
      delete rest[field];
      return rest;
    });

  const set =
    <K extends keyof AssignTaskValues>(key: K) =>
    (value: AssignTaskValues[K]) => {
      setValues((v) => ({ ...v, [key]: value }));
      clearServer((key === "dueTime" ? "dueDate" : key) as AssignTaskField);
    };

  const allHomes = homeChoices(staff?.homeOptions ?? []);
  const homes = homeScope === "all" ? allHomes : allHomes.filter((h) => homeScope.includes(h.id));
  const homeRequired = homeScope !== "all" && allHomes.length > 0;
  const homeId = homes.find((h) => h.label === values.home[0])?.id;

  const pickStaff = (id: string) => {
    const next = options.find((o) => o.id === id) ?? null;
    setStaff(next);
    clearServer("assignee");
    clearServer("home");
    // Keep the home only if the new person works there too.
    const keep = homeChoices(next?.homeOptions ?? []).some((h) => h.label === values.home[0]);
    if (!keep) setValues((v) => ({ ...v, home: [] }));
  };

  const search = (q: string) => {
    setQuery(q);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const call = ++latest.current;
      setSearching(true);
      const result = await searchStaffAction(q.trim());
      if (call !== latest.current) return;
      setSearching(false);
      if (result.ok) setOptions(result.data);
    }, SEARCH_MS);
  };

  const missing = new Map<AssignTaskField, string>();
  if (!values.title.trim()) missing.set("title", REQUIRED);
  if (!values.description.trim()) missing.set("description", REQUIRED);
  if (!values.dueDate) missing.set("dueDate", REQUIRED);
  if (!staff) missing.set("assignee", REQUIRED);
  if (homeRequired && !homeId) missing.set("home", REQUIRED);
  if (values.link.trim() && !isLink(values.link.trim())) {
    missing.set("link", "Enter a link that starts with http:// or https://.");
  }
  const errors = new Map<AssignTaskField, string>([
    ...(submitted ? missing : new Map<AssignTaskField, string>()),
    ...(Object.entries(serverErrors) as [AssignTaskField, string][]),
  ]);

  /** Assigns the task; returns it, or null after showing what went wrong (`error` for a toast). */
  const assign = async (): Promise<{ task?: ApiAdminTask; error?: string }> => {
    setSubmitted(true);
    if (missing.size > 0 || !staff) return {};
    let referenceFileIds: string[] = [];
    if (values.files.length) {
      setBusy("uploading");
      try {
        referenceFileIds = await Promise.all(
          values.files.map(async (file) => {
            const known = uploaded.current.get(file);
            if (known) return known;
            const id = await uploadTaskReference(file);
            uploaded.current.set(file, id);
            return id;
          }),
        );
      } catch (error) {
        setBusy(null);
        return { error: error instanceof Error ? error.message : "We couldn't upload the files." };
      }
    }
    setBusy("assigning");
    const input: TaskInput = {
      staffId: staff.id,
      homeId,
      title: values.title.trim(),
      description: values.description.trim(),
      instructions: values.instructions
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      priority: (values.priority[0] ?? "Medium").toLowerCase() as TaskInput["priority"],
      dueAt: dueAt(values.dueDate, values.dueTime[0]),
      referenceUrl: values.link.trim() || undefined,
      referenceFileIds: referenceFileIds.length ? referenceFileIds : undefined,
    };
    const result = await createTaskAction(input);
    // On success the button stays on "Assigning…" (disabled) until the page moves on, so a
    // second click can't assign the task twice.
    if (result.ok) return { task: result.data };
    setBusy(null);

    if (result.code === "STAFF_HOME_MISMATCH") {
      const first = staff.name.split(" ")[0];
      setServerErrors({ home: `${first} isn’t a member of this home. Pick one of their homes.` });
      return {};
    }
    const fieldErrors: Partial<Record<AssignTaskField, string>> = {};
    for (const [path, messages] of Object.entries(result.fields ?? {})) {
      const field = FROM_API[path.split(".")[0]];
      if (field && messages[0] && !fieldErrors[field]) fieldErrors[field] = messages[0];
    }
    if (Object.keys(fieldErrors).length) {
      setServerErrors(fieldErrors);
      return {};
    }
    return {
      error:
        result.status === 404
          ? "That staff member or home isn’t available any more. Refresh and try again."
          : result.error,
    };
  };

  return {
    values,
    set,
    errors,
    staff,
    pickStaff,
    options,
    query,
    search,
    searching,
    homes,
    homeRequired,
    busy,
    assign,
  };
}

export type AssignTaskForm = ReturnType<typeof useAssignTaskForm>;
