import type { TaskAnswers, TaskField } from "@/types/task-table";

// Shared rules for task form fields: when a field counts as filled, how many required fields are
// done (drawer progress card, Figma 60:12375) and the message under a missing one (60:12502).

export function isFilled(field: TaskField, value: TaskAnswers[string] | undefined) {
  if (field.type === "boolean") return value === true;
  return value !== undefined && value !== null && value !== "";
}

export function requiredProgress(fields: TaskField[], answers: TaskAnswers) {
  const required = fields.filter((f) => f.required);
  return {
    done: required.filter((f) => isFilled(f, answers[f.key])).length,
    total: required.length,
  };
}

/** "Add an alternative phone number to submit." */
export function missingMessage(field: TaskField) {
  if (field.type === "boolean") return "Tick this box to submit.";
  if (field.type === "file") return "Add a file to submit.";
  const label = field.label.toLowerCase();
  return `Add ${/^[aeiou]/.test(label) ? "an" : "a"} ${label} to submit.`;
}
