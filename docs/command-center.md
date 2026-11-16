# Command Center — backend handover

Running handover from the frontend to the backend team. Each section is one feature the UI
already has, what it currently fakes, and the API it needs. The frontend keeps this file
up to date as screens are built; backend wires the endpoints in later.

| #   | Feature                                           | Frontend status                                                                        | Backend status |
| --- | ------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------- |
| 1   | Time clock ("My time" card, Home `/`)             | Built, runs on `localStorage`                                                          | Not started    |
| 2   | Home overview data (shift, schedule, open shifts) | Built; sample data when signed in, empty when not (the clock's shift is always sample) | Not started    |
| 3   | My Tasks (calendar `/tasks`, list `/tasks/list`)  | Built; sample data                                                                     | Not started    |
| 4   | My Homes (`/homes`, List / Section toggle)        | Built; sample data when signed in, empty when not                                      | Not started    |
| 5   | Notifications (`/notifications`)                  | Built; sample data when signed in, empty when not; read state local only               | Not started    |

Conventions used below (proposals, change freely, then tell us):

- Times on the wire are ISO 8601 UTC strings (`2026-11-14T08:00:00Z`). The UI converts to the user's local time.
- The server clock is the source of truth. The client never sends its own timestamps for clock events.
- Errors use the existing API error shape already used by auth/messaging (`src/lib/auth/api.ts`).

---

## 1. Time clock

**Figma:** Home dashboard, "My time" card. Frames `51:9269` (clocked in), `51:9961` (break ended), `51:9441` (work resumed). Not-clocked-in is the default Home frame.
**Frontend code:** `src/lib/shift-clock/` (types, maths, temporary store), `src/hooks/useShiftClock.ts`, `src/components/organisms/ClockCard.tsx`.
**Swap point:** `src/lib/shift-clock/store.ts`. Each exported action (`clockIn`, `startBreak`, `endBreak`, `clockOut`) maps to one endpoint below. Only that file changes when the API lands. The shift itself is sample data today (`SHIFT` in `src/lib/sample-dashboard.ts`).

### 1.1 Behaviour the UI implements

States: `not_clocked_in` → `clocked_in` ⇄ `on_break` → (clock out) → `not_clocked_in`.

| State          | Ring shows                                                    | Ring button                                                                                        | Status pill                                              | Stats                                                  |
| -------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| not_clocked_in | `00 : 00`, empty                                              | **Clock in**                                                                                       | Not clocked in                                           | Clock-in time `00 : 00`, Scheduled shift, Break time   |
| clocked_in     | worked time `HH : MM`; ring = worked ÷ scheduled shift length | **Take break** while break allowance remains and the shift isn't complete; otherwise **Clock out** | Clocked in                                               | Clock-in time, Scheduled shift, Break time (allowance) |
| on_break       | total break used `HH : MM`; ring = break used ÷ allowance     | **Resume work**                                                                                    | On break → **Break ended** once the allowance is used up | Clock-in time, Work Duration, Break ends in            |

Rules:

- **Multiple breaks per shift are allowed.** They share one allowance per shift (Figma: 30 min). Ending a break early keeps the rest for later.
- A break can run past the allowance. The UI just shows "Break ended" with "Break ends in 0h 0m" until the user taps Resume work. The overage is still counted as break time, not work.
- Worked time = (now − clock-in) − all break time. Breaks never count as work.
- The timer is `HH : MM` (agreed). The UI ticks every second but only minutes are shown.

### 1.2 Data the UI needs

```ts
// GET /time-clock/current response
{
  "serverTime": "2026-11-14T11:10:00Z",       // lets the UI correct for a skewed device clock
  "shift": {
    "id": "shf_123",
    "start": "2026-11-14T08:00:00Z",           // UI shows "8:00 AM – 4:00 PM"
    "end": "2026-11-14T16:00:00Z",
    "breakAllowanceMinutes": 30,
    "home": { "id": "home_1", "name": "Oakridge Group Home" }
  },                                            // null if no shift today
  "clock": {
    "status": "clocked_in",                     // "not_clocked_in" | "clocked_in" | "on_break"
    "clockedInAt": "2026-11-14T08:00:00Z",      // null when not clocked in
    "breaks": [
      { "startedAt": "2026-11-14T10:00:00Z", "endedAt": "2026-11-14T10:20:00Z" },
      { "startedAt": "2026-11-14T11:00:00Z", "endedAt": null }   // running break
    ]
  }
}
```

The frontend type is `ShiftClock` in `src/lib/shift-clock/types.ts` (same fields, epoch ms). Totals (worked, break used, break left) are derived client-side from this record in `src/lib/shift-clock/derive.ts`. Please also compute them server-side for timesheets and payroll, using the same rules as 1.1.

### 1.3 Endpoints

All of them return the same body as `GET /time-clock/current`, so the UI can replace its state in one go.

| Action      | Method & path                   | Body                       | Allowed from   | Error if not allowed                      |
| ----------- | ------------------------------- | -------------------------- | -------------- | ----------------------------------------- |
| Load        | `GET /time-clock/current`       | —                          | any            | —                                         |
| Clock in    | `POST /time-clock/clock-in`     | `{ "shiftId": "shf_123" }` | not_clocked_in | 409 `already_clocked_in`                  |
| Take break  | `POST /time-clock/breaks/start` | —                          | clocked_in     | 409 `not_clocked_in` / `already_on_break` |
| Resume work | `POST /time-clock/breaks/end`   | —                          | on_break       | 409 `not_on_break`                        |
| Clock out   | `POST /time-clock/clock-out`    | —                          | clocked_in     | 409 `on_break` (end the break first)      |

Server-side requirements:

- Timestamps for every event are taken from the server clock.
- Requests must be idempotent or safe to retry. A double tap on "Clock in" must not create two records. Return the current state with 200 when it's already in the requested state, or 409, whichever you prefer. Just tell us which.
- One open clock record per user at a time.
- The clock state must persist across devices. The UI will load it on page load.

### 1.4 Open questions for backend / product

1. **Clocking out before the allowance is used.** Figma only shows one action button in the ring. Right now "Clock out" appears only once the break allowance is used or worked time reaches the scheduled length. That means someone who never takes a break can't clock out early. Needs a design decision (e.g. a separate clock-out control), plus an API that allows it any time.
2. **Clocked-out state.** There's no Figma frame for it. The UI returns to "Not clocked in". Should a second clock-in the same day be allowed?
3. **Breaks after the allowance is used.** Should `breaks/start` be rejected once the allowance is gone? The UI currently hides the button, but the API should enforce the rule.
4. **Overtime.** The frame `51:9961` is named "overtime". Is there an overtime rule (working past the scheduled end) the API should flag?
5. **No shift today.** What should `shift` be, and can the user clock in without a scheduled shift?
6. **Location / geofence.** Does clock-in need to verify the user is at the home? If so, the UI needs to send coordinates.
7. **Which shift.** Figma lists two shifts with the same 8:00 AM – 4:00 PM time ("Oakridge" and "Becharbum"). Which one does clock-in attach to?

### 1.5 Changelog

- 2026-11-14 — Section created. UI built against `localStorage`; endpoints proposed.

---

## 2. Home overview data

**Figma:** Home "Overview" tab. With data: `51:9269`. Empty state: `51:10133` ("Dashboard-Overview without data").
**Frontend code:** `src/lib/dashboard.ts` (`getDashboardOverview`, server-only) → `src/components/organisms/HomeOverview.tsx`.
**Swap point:** `getDashboardOverview()`. Today it returns the Figma sample data when the user is signed in and the empty state when not, except `shift`, which is always the sample shift so the clock (local-only until §1 lands) stays usable signed out. When the API exists, `shift: null` (no shift today) shows the greyed, non-clickable clock. Replace its body with one API call. The UI already handles every field being empty.

### 2.1 What the UI shows

- **My time:** needs today's shift (see §1.2 `shift`). With no shift, the card shows `00 : 00` everywhere, "Work Duration" and "Break ends in" greyed out, and a "Clock in" pill that can't be clicked.
- **Today's schedule:** today's shifts (start, end, home name, role, address or "video" for remote, and which one is current). Empty → "No schedule today".
- **Open Shifts:** a short preview list plus the total available count for the orange "N available" pill (hidden at 0). Empty → "No open shift today".

### 2.2 Proposed endpoint

`GET /dashboard/overview`

```json
{
  "shift": { "id": "shf_123", "start": "…Z", "end": "…Z", "breakAllowanceMinutes": 30 },
  "schedule": [
    {
      "id": "shf_123",
      "start": "2026-11-14T08:00:00Z",
      "end": "2026-11-14T16:00:00Z",
      "home": {
        "id": "home_1",
        "name": "Oakridge Group Home",
        "address": "123 Oakridge Ave, Madison, WI"
      },
      "role": "Direct Support Professional",
      "remote": false,
      "current": true
    }
  ],
  "openShifts": {
    "total": 3,
    "items": [
      {
        "id": "open_9",
        "start": "2026-04-30T07:00:00Z",
        "end": "2026-04-30T15:00:00Z",
        "home": {
          "id": "home_1",
          "name": "Oakridge Group Home",
          "address": "123 Oakridge Ave, Madison, WI"
        }
      }
    ]
  }
}
```

`shift` can be `null`, and `schedule` and `openShifts.items` can be `[]`. (Field names are suggestions. `shift` is the same object as §1.2, so it can be dropped from here if the clock endpoint is always called too.)

### 2.3 Open questions

1. How many open shifts should the Home preview show (Figma shows 1)?
2. Is "current" in the schedule the shift you're clocked into, or the one happening now?

### 2.4 Changelog

- 2026-11-14 — Section created; empty state built.
- 2026-11-14 — Clock always gets the sample shift (works when signed out).

---

## 3. My Tasks

**Figma:** calendar `51:10575` (with tasks) and `51:10265` (no tasks); list `51:10883`; status filter open `51:11193`; overdue view `51:11043`.
**Frontend code:** `src/lib/sample-tasks.ts` (sample data), `src/app/tasks/page.tsx`, `src/app/tasks/list/page.tsx`, organisms `WeekCalendar` and `TaskGroup`.
**Frontend logic:** `src/lib/tasks.ts` (`bucketOf`, `groupTasks`), with the UI in `TaskListBoard` (client) and `TaskStatusFilter`.
**Swap point:** replace `CALENDAR_DAYS` / `CALENDAR_EVENTS` / `TASK_RECORDS` (and `SAMPLE_TODAY`) with a server loader (same pattern as §2). The filter currently runs client-side over all tasks. With real volumes it should become query params on `GET /tasks`.

### 3.1 What the UI shows

- **Calendar (week):** for each task, the day, start time, duration, title, colour (blue / green / purple / amber), and whether it's a video call. Overlapping tasks sit side by side. With no tasks, the grid is empty.
- **List:** tasks grouped by day ("Today", "Tomorrow", then dates), each group with an "N available" count. Each row has the task name, a one-line description (cut off with "…"), due time, a status of **Pending**, **In progress** or **Completed**, and a › link to the task.
- **"Due soon" filter** (checkbox menu, multi-select): To do, Due later, Over due, In Progress, Completed. Rules the UI uses today:
  - Completed = status completed.
  - Over due = not completed and due before today.
  - In Progress = status in progress (and not overdue).
  - Due later = pending, due after tomorrow.
  - To do = pending, due today or tomorrow.
  - Nothing ticked = "Due soon": every task due today or tomorrow, in any status (the default list).
- Overdue tasks are listed first in one "Over due" group, newest first. The third column becomes **Due date** ("Nov 3, 2026") and the pill reads "Over due".
- The "Month" view picker on the calendar is static for now.

### 3.2 Proposed endpoints

`GET /tasks?from=2026-10-21&to=2026-10-27` (calendar week; also used for the list)

```json
{
  "tasks": [
    {
      "id": "tsk_1",
      "name": "Check Resident's Vital Signs",
      "description": "Measure and record the resident's vital signs…",
      "dueAt": "2026-10-28T08:00:00Z",
      "durationMinutes": 60,
      "status": "pending",
      "category": "care",
      "isVideo": false,
      "home": { "id": "home_1", "name": "Oakridge Group Home" }
    }
  ]
}
```

- `status`: `pending` | `in_progress` | `completed`.
- Calendar colours come from `category`. We need the list of categories and which colour each one maps to.
- The list's "N available" per day: is that the count of tasks that aren't completed? Please confirm, or return it per day.

### 3.3 Open questions

1. What does "available" mean on a task day (not completed? unassigned?). The UI currently shows the number of tasks in the group.
2. Please confirm the filter rules in 3.1, especially whether an in-progress task past its due date counts as "Over due" (it does today), and whether "Due soon" is a filter or a sort.
3. Suggested query: `GET /tasks?status=overdue,in_progress&from=…&to=…`, returning `overdue` as a computed status.
4. The › opens a task detail page. Is a design coming for it?

### 3.4 Changelog

- 2026-11-14 — Section created; list redesigned to the table layout.
- 2026-11-14 — Status filter and overdue view added (client-side rules above).

---

## 4. My Homes

**Figma:** empty `51:11543`, list `51:12496`, list with profile panel `51:12782`, section (cards) `51:12625`.
**Frontend code:** `src/lib/homes.ts` (`getAssignedHomes`, server-only), `src/types/home.ts` (`AssignedHome`), `src/lib/sample-homes.ts`, and the organism `AssignedHomes` (with `HomesTable`, `HomeCard` and `HomeProfilePanel`).
**Swap point:** `getAssignedHomes()`. Today it returns the sample homes when signed in and `[]` when not ("No group homes found").

### 4.1 What the UI shows

- **List:** home name, one-line address, residents count, open tasks count and ›. Clicking a row opens the **Profile** panel (`?home=<id>` in the URL).
- **Section (cards):** name, address, residents, open tasks, **next schedule** (day and time) and "View home details →", which opens the same panel.
- **Profile panel:** name, address, **map**, "N Residents", "N open tasks", contact email and phone (each with a copy button), and a Notifications switch.
  - The map is a placeholder image until the backend sends coordinates.
  - The Notifications switch only changes locally for now.

### 4.2 Proposed endpoints

`GET /homes/assigned`

```json
{
  "homes": [
    {
      "id": "home_1",
      "name": "Maryland Homes",
      "address": "12, Maryland Avenue, maryland, Lagos 100213.",
      "coordinates": { "lat": 6.5726, "lng": 3.3655 },
      "residents": 12,
      "openTasks": 3,
      "nextSchedule": { "start": "2026-11-14T10:00:00Z" },
      "contact": { "email": "ozenua@gmail.com", "phone": "+234 800 000 0000" },
      "notificationsMuted": false
    }
  ]
}
```

- `nextSchedule` is the caller's next shift at that home (or `null`). The UI formats it as "Today / Tomorrow / Nov 5, 2026" plus the time.
- `coordinates` drives the map pin. We still need to choose a map provider (Google Maps, Mapbox or OpenStreetMap) and whether a key is needed.
- `PATCH /homes/{id}/notifications` with `{ "muted": true }` for the switch.

### 4.3 Open questions

1. What does the Notifications switch control for a home (all notifications from that home? chat only?). The Figma copy says "for this conversation".
2. What do "Residents" and "Tasks" in the list count: all residents, and the caller's open tasks or all open tasks at the home?
3. Is a full home details page coming, or is the panel the details view?
4. Which map provider should we use (see 4.2)?

### 4.4 Changelog

- 2026-11-14 — Section created; list, cards, profile panel and empty state built.
- 2026-11-14 — Section view moved onto `/homes` (in-page toggle); `/homes/section` removed.

---

## 5. Notifications

**Figma:** empty `51:11583`, all `51:11625`, one expanded `51:12260`, unread filter `51:12383`.
**Frontend code:** `src/lib/notifications.ts` (`getNotifications`, server-only), `src/types/notification.ts` (`AppNotification`), `src/lib/sample-notifications.ts`, `NotificationList` (client) and `NotificationItem`.
**Swap point:** `getNotifications()`, plus the two mark-as-read handlers in `NotificationList` (currently local state only).

### 5.1 What the UI shows

- **All / Unread** filter, and **Mark all as read**.
- **Each notification:** a type icon (schedule, task or home), title, a green dot while unread, the message (one line until expanded), and "10 min ago · Schedule".
- **✓** marks it read. **›** expands it to show the full message and a link ("View schedule", "View task" or "View home").
- **Header bell and sidebar:** both link to `/notifications`. Neither shows an unread count yet.

### 5.2 Proposed endpoints

`GET /notifications?filter=all|unread&cursor=…`

```json
{
  "notifications": [
    {
      "id": "ntf_1",
      "type": "schedule",
      "title": "Shift schedule updated",
      "message": "Your scheduled shift at Maryland Home has been changed from 8:00 AM – 4:00 PM to 9:00 AM – 5:00 PM. …",
      "createdAt": "2026-11-14T13:02:00Z",
      "readAt": null,
      "target": { "kind": "shift", "id": "shf_123" }
    }
  ],
  "unreadCount": 3,
  "nextCursor": null
}
```

- `type`: `schedule` | `task` | `home` (more types? tell us and we'll add icons).
- `target` tells the UI where "View …" should go.
- The UI formats `createdAt` as "10 min ago" / "Yesterday".
- `POST /notifications/{id}/read` and `POST /notifications/read-all`.
- Real-time: a socket event like the messaging one (`notification.created`) would let the list and a bell badge update live.

### 5.3 Open questions

1. Should the bell or sidebar show an unread count? (Not in Figma.)
2. Can a read notification be marked unread again?
3. Paging: how many per page?

### 5.4 Changelog

- 2026-11-14 — Section created; page built with local read state.
