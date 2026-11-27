"use client";

import {
  ActivityItem,
  AssignedHomeRow,
  ProfileCard,
  ProfileTaskRow,
  TaskCountStrip,
} from "@/components/molecules";
import type { StaffProfile } from "@/lib/staff-profile";

// Staff profile tab bodies (left column). Overview (Figma "Main column" 103:18957): the Tasks
// card (counts, the next five tasks by due date, "View all tasks") and the Assigned homes card
// (16px apart). The Tasks card is left out when the tasks can't load. Activity (103:19084):
// administrative changes, newest first. Links that lead to undesigned screens call `onSoon`;
// actions the signed-in person can't take aren't passed and aren't shown.
export interface StaffProfileTabProps {
  profile: StaffProfile;
  onSoon: () => void;
  /** Opens the Assign homes drawer, optionally with one home (id) already marked for removal. */
  onAssignHomes?: (remove?: string) => void;
  onAssignTask?: () => void;
}

export function StaffProfileOverview({
  profile,
  onSoon,
  onAssignHomes,
  onAssignTask,
}: StaffProfileTabProps) {
  const homes = profile.homes.length;
  return (
    <div className="flex w-full flex-col gap-4">
      {profile.taskCounts && (
        <ProfileCard
          title="Tasks"
          action={onAssignTask && { label: "Assign task", onClick: onAssignTask }}
        >
          <TaskCountStrip counts={profile.taskCounts} />
          {profile.tasks.map((task) => (
            <ProfileTaskRow key={task.id} task={task} />
          ))}
          {profile.tasks.length === 0 ? (
            <p className="type-ui-13 text-grey-400">No tasks assigned yet.</p>
          ) : (
            <button
              type="button"
              onClick={onSoon}
              className="self-start type-ui-13 font-semibold text-green-ink hover:underline"
            >
              View all tasks
            </button>
          )}
        </ProfileCard>
      )}
      <ProfileCard
        title="Assigned homes"
        meta={`${homes} ${homes === 1 ? "home" : "homes"}`}
        action={onAssignHomes && { label: "Assign homes", onClick: () => onAssignHomes() }}
      >
        {homes ? (
          profile.homes.map((home) => (
            <AssignedHomeRow
              key={home.id}
              home={home}
              onRemove={onAssignHomes && (() => onAssignHomes(home.id))}
            />
          ))
        ) : (
          <p className="type-ui-13 text-grey-400">No homes assigned yet.</p>
        )}
      </ProfileCard>
    </div>
  );
}

export function StaffProfileActivity({ profile }: StaffProfileTabProps) {
  return (
    <ProfileCard title="Activity" note="Administrative changes only" className="gap-1 pb-2">
      {!profile.activity ? (
        <p className="pb-2 type-ui-13 text-slate-500">
          We couldn’t load the activity. Refresh the page to try again.
        </p>
      ) : profile.activity.length === 0 ? (
        <p className="pb-2 type-ui-13 text-grey-400">No activity yet.</p>
      ) : (
        <ul className="flex flex-col">
          {profile.activity.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </ProfileCard>
  );
}
