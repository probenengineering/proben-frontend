import { redirect } from "next/navigation";

// The old My Tasks list view; My tasks is now a single table at /tasks.
export default function TasksListPage() {
  redirect("/tasks");
}
