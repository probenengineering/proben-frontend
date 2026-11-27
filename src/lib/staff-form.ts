import type { ApiEmploymentType } from "@/lib/staff-api/types";

// Add staff form (Figma 103:18646): option shapes, empty values, validation and the role scope
// rule. Options come from the API (lib/staff-api/staff-form-options); safe on server and client.

export interface FormOption {
  id: string;
  /** Unique within its list (a repeated name gets its code added). */
  label: string;
}

export interface RoleFormOption extends FormOption {
  /** "homes": give it once per selected home (Home and Regional managers). */
  recommendedScope?: "provider" | "homes";
  /** Whether you may give it provider-wide, and for which homes (GET /roles). */
  providerWide: boolean;
  homeIds: string[];
}

export interface StaffFormOptions {
  roles: RoleFormOption[];
  homes: FormOption[];
  /** Null when departments couldn't load: the field is shown disabled. */
  departments: FormOption[] | null;
  employmentTypes: { id: ApiEmploymentType; label: string }[];
}

/** Preset first tasks (Figma 103:18701), assigned right after the person is created. */
export const INITIAL_TASKS = [
  {
    title: "Complete onboarding checklist",
    description: "Work through the new starter checklist before your first shift.",
  },
  {
    title: "Read safeguarding policy",
    description: "Read the safeguarding policy and confirm you understand it.",
  },
];

/** Opens Assign task for the new person instead of assigning a preset. */
export const NEW_TASK = "Create a new task";

export const TASK_OPTIONS = [...INITIAL_TASKS.map((t) => t.title), NEW_TASK];

export interface StaffFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Option labels, as the select fields hold them. */
  employmentType: string[];
  department: string[];
  /** YYYY-MM-DD. */
  startDate: string;
  role: string[];
  homes: string[];
  task: string[];
  invite: boolean;
}

export type StaffFormField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "employmentType"
  | "department"
  | "startDate"
  | "role"
  | "homes";

/** "scope": the role can't be given for the chosen homes. `server`: the backend's own message. */
export type StaffFieldError = "required" | "invalid" | "duplicate" | "scope" | { server: string };
export type StaffFormErrors = Partial<Record<StaffFormField, StaffFieldError>>;

export function emptyStaffForm(): StaffFormValues {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employmentType: [],
    department: [],
    startDate: "",
    role: [],
    homes: [],
    task: [],
    invite: true,
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Client checks; a duplicate email is only known once the backend answers (409). */
export function validateStaffForm(values: StaffFormValues): StaffFormErrors {
  const errors: StaffFormErrors = {};
  if (!values.firstName.trim()) errors.firstName = "required";
  if (!values.lastName.trim()) errors.lastName = "required";
  const email = values.email.trim();
  if (!email) errors.email = "required";
  else if (!EMAIL.test(email)) errors.email = "invalid";
  if (values.role.length === 0) errors.role = "required";
  return errors;
}

/**
 * The role assignments to send. A home role (recommendedScope "homes", e.g. Home manager) is given
 * once per chosen home you may assign it in, and never silently widened to the whole organisation
 * when no home is chosen (same rule as Assign role). Other roles are provider-wide when you may
 * do that, else per chosen home. Null: none of these is possible.
 */
export function roleAssignments(role: RoleFormOption, homeIds: string[]) {
  const allowed = homeIds.filter((id) => role.homeIds.includes(id));
  const perHome =
    allowed.length > 0 ? allowed.map((homeId) => ({ roleId: role.id, homeId })) : null;
  if (role.recommendedScope === "homes") return perHome;
  return role.providerWide ? [{ roleId: role.id }] : perHome;
}

// 400 VALIDATION_FAILED `details.fields` paths (dotted, e.g. "homes.0.homeId") → form fields.
const SERVER_FIELDS: [RegExp, StaffFormField][] = [
  [/^firstName$/, "firstName"],
  [/^lastName$/, "lastName"],
  [/^email$/, "email"],
  [/^phone$/, "phone"],
  [/^employmentType$/, "employmentType"],
  [/^departmentId$/, "department"],
  [/^startDate$/, "startDate"],
  [/^roles(\.|$)/, "role"],
  [/^homes(\.|$)/, "homes"],
];

const sentence = (text: string) => {
  const t = text.trim();
  return `${t[0]?.toUpperCase() ?? ""}${t.slice(1)}${/[.!?]$/.test(t) ? "" : "."}`;
};

/** The backend's field messages on the matching fields; the rest go in the page banner. */
export function serverFieldErrors(fields: Record<string, string[]> | undefined) {
  const errors: StaffFormErrors = {};
  const other: string[] = [];
  for (const [path, messages] of Object.entries(fields ?? {})) {
    const text = Array.isArray(messages) ? messages[0] : undefined;
    if (!text) continue;
    const field = SERVER_FIELDS.find(([pattern]) => pattern.test(path))?.[1];
    if (!field) other.push(sentence(text));
    else errors[field] ??= field === "email" ? "invalid" : { server: sentence(text) };
  }
  return { errors, other };
}

/** Labels that stay unique when two items share a name ("Oak House (OAK-2)"). */
export function uniqueLabels<T>(
  items: T[],
  name: (item: T) => string,
  extra: (item: T) => string | null | undefined,
) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(name(item), (counts.get(name(item)) ?? 0) + 1);
  const seen = new Map<string, number>();
  return items.map((item) => {
    const base = name(item);
    if ((counts.get(base) ?? 0) < 2) return base;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return `${base} (${extra(item) || n})`;
  });
}
