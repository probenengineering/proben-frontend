import { EmptyPanel } from "@/components/molecules";
import { getScheduleList } from "@/lib/command-center/schedule";

import { ScheduleList } from "./ScheduleList";

// Schedule list body: your events and tasks from today to Saturday, plus overdue ones. Reads the
// session, so render it inside <Suspense>. A load error shows above the (empty) list.
export async function MySchedule() {
  const { error, ...list } = await getScheduleList();
  return (
    <>
      {error && (
        <div className="px-5">
          <EmptyPanel message={error} />
        </div>
      )}
      <ScheduleList {...list} />
    </>
  );
}
