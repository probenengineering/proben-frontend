import { EmptyPanel } from "@/components/molecules";
import { getTaskTable } from "@/lib/command-center/task-table";

import { TaskTable } from "./TaskTable";

// My tasks body: loads GET /tasks and renders the table. Reads the session, so render it inside
// <Suspense>. A load error shows above the (empty) table.
export async function MyTasks() {
  const { error, tasks, loadedAt } = await getTaskTable();
  return (
    <>
      {error && (
        <div className="px-5 pb-5">
          <EmptyPanel message={error} />
        </div>
      )}
      <TaskTable tasks={tasks} loadedAt={loadedAt} />
    </>
  );
}
