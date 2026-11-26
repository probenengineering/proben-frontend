import { getTaskList } from "@/lib/command-center/tasks";

import { TaskListBoard } from "./TaskListBoard";

// My Tasks list body with live tasks (GET /tasks). Reads the session, so render it inside
// <Suspense>.
export async function MyTaskList() {
  const { tasks, today, error } = await getTaskList();
  return <TaskListBoard tasks={tasks} today={today} error={error} />;
}
