# Command Center — backend handover

Running handover from the frontend to the backend team. Each section is one feature the UI
already has, what it currently fakes, and the API it needs. The frontend keeps this file
up to date as screens are built; backend wires the endpoints in later.

| #   | Feature                                            | Frontend status                                                                    | Backend status                                    |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------- |
| 1   | Time clock ("My time" card, Home `/`)              | Wired to `/api/commandcenter/attendance*` (2026-11-20)                             | Live                                              |
| 2   | Home overview data (shift, schedule, open shifts)  | Wired to `GET /overview` + `GET /shifts/open` (2026-11-20)                         | Live                                              |
| 3   | My Tasks (table `/tasks`, task drawer + form)      | Wired to `GET /tasks`, `/start`, `/draft`, `/submit`, files (2026-11-26)           | Live; form fields, uploads to confirm (R33–R38)   |
| 4   | My Homes (`/homes` list + map, `/homes/[id]` tabs) | Wired to `GET /homes`, `/team`, `/schedule`, `/updates`, `/resources` (2026-11-26) | Live; team/schedule shapes undocumented (R39–R41) |
| 5   | Notifications (`/notifications`)                   | Wired to `/api/notifications/inbox*` (2026-11-20)                                  | Live; `homes` category + destinations wired       |

Conventions used below (proposals, change freely, then tell us):

- Times on the wire are ISO 8601 UTC strings (`2026-11-14T08:00:00Z`). The UI converts to the user's local time.
- The server clock is the source of truth. The client never sends its own timestamps for clock events.
- Errors use the existing API error shape already used by auth/messaging (`src/lib/auth/api.ts`).

## Backend to-do: summary (updated 2026-11-26)

Everything still open, most important first. Details, Figma frames and what the UI does today are
in the numbered items further down (§0.2 – §0.2.2).

**P1: blocking real testing**

- **R15** Demo accounts can't sign in (emailed code). A fixed non-production code for
  `@demo.proben.test`, or a readable inbox. Unblocks **R1** (seed data: George has no homes,
  shifts or tasks, so most screens could only be checked with sample data).
- **R3** Attendance must stay `completed` (with `clockedOutAt`) for the rest of the day after
  clock-out, for the "Shift complete" card.
- **R2** Confirm `breakSeconds` on `GET /attendance` and the action responses.

**P2: undocumented responses the UI reads by guessing field names** (please document in Swagger)

- **R39a / R40a** `GET /homes/{id}/team`: names, roles, phone, on-shift status, "you" flag.
- **R40b** `GET /homes/{id}/schedule`: shifts with staff, required staff, "is mine", coverage.
- **R42** `GET /search` and `/search/recents` (global search, next to build).
- **R36** `POST /api/files` (`UploadDto` is empty): `source` value for task uploads, response
  shape; `GET /api/files/{id}` must return `name` and `size`.

**P2: buttons or rows the UI hides or fakes until data exists**

- Tasks: **R31** subtitle/progress, **R32** counts beyond 100, **R33** submit with no draft and
  `completedAt`, **R34** assigner name, required action, instructions, HR reference files, **R35**
  `date`/`phone` field types, hints, file limits, **R37 / R38** per-task wording, duration, "Next
  step", **R28** completing tasks from the list, **R14** status naming.
- Home dashboard: **R16** clock-out note + handover, **R17** manual clock-in request, **R18**
  overtime approval, **R19** timesheet, **R20** event category colours, **R21** event completion
  rule, **R22** confirm pick-up behaviour and errors (now called from the home's Schedule tab),
  **R23** distance on location failure, **R24** open shifts near you, **R25** role on the modal.
- Schedule: **R26** event/task detail fields, **R27** reschedule, **R29** "Add task", **R30**
  "Assigned by".
- Homes: **R39** home manager, usual shift, home status, full state name; **R40c** update type,
  pinned, acknowledge-by date, "12 of 18 staff", author name/role; **R40d** home contacts (manager,
  on-call nurse, emergency); **R40e** messaging user id to start a chat from a team card; **R41**
  resource category, description, restricted flag, PDF page count.

**P3: real-time and clean-up**

- **R9** Notifications socket events. **R10** `counts` casing in `GET /tasks`.

---

## 0. Live API integration (2026-11-20)

Swagger: `GET /api/commandcenter/docs` (JSON at `/api/commandcenter/docs-json`) (Command Center v0.1.0) and `GET /api/notifications/docs`.
Frontend client: `src/lib/command-center/` (`api.ts`, `types.ts`, `time.ts`, `tasks.ts`,
`attendance-actions.ts`), `src/lib/dashboard.ts`, `src/lib/dashboard-aside.ts`, `src/lib/homes.ts`,
`src/lib/notifications.ts` + `notifications-actions.ts`. The proposals in §1–§5 below are kept for
history; the live endpoints replace them.

### 0.1 Endpoint mapping

| UI                        | Endpoint(s)                                                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| My time clock             | `GET /attendance` (via `/overview`), `POST /attendance/clock-in` (`shiftId`, GPS when the home `requireLocation`), `/break`, `/resume`, `/clock-out` |
| Clock-in modal location   | Device GPS vs home `details.latitude/longitude` + `geofenceRadiusMeters` (client-side pre-check; the API still decides)                              |
| Today's schedule (v2)     | `GET /overview` (today's clock shift) + `GET /shifts` (week start → +14 days) + `GET /events` (this week) for the week strip and agenda              |
| Next shift note           | First `GET /shifts` item after now (within the two weeks above)                                                                                      |
| Open shifts (Home)        | `GET /shifts/open?from=now&to=now+14d` (first 3 shown, `total` in the pill)                                                                          |
| Needs Attention (Home)    | `GET /overview` → `needsAttention.items`                                                                                                             |
| Homes line (Home aside)   | `GET /homes`                                                                                                                                         |
| Task list                 | `GET /tasks?sort=due&limit=100`                                                                                                                      |
| Task calendar (this week) | `GET /shifts` (green), `GET /events` (blue), `GET /tasks` due times (amber)                                                                          |
| My Homes                  | `GET /homes?assignment=all`; open tasks counted from `/tasks` by `homeId`; next shift from `/shifts` (30 days)                                       |
| Notifications             | `GET /api/notifications/inbox?limit=100`, `POST /inbox/{id}/read`, `POST /inbox/read-all` `{}`                                                       |
| Home mute switch          | `PATCH /homes/{id}/notifications` `{ muted }` (profile panel; on = muted)                                                                            |
| Sidebar Messages badge    | `GET /api/messaging/unread-count` → `messages` (hidden at 0, "99+" above 99)                                                                         |

Timezone: "today" and calendar days use the first assigned home's `details.timezone`, falling back
to `Africa/Lagos` when the user has no homes.

### 0.2 Required from the backend

A checklist for the backend team. **P1** blocks a screen from working correctly, **P2** means the UI
shows a placeholder or a local-only control until it lands, and **P3** is clean-up or nice to have.
Tick the box and add a changelog line when one ships; the frontend will wire it up and update §0.1.

#### P1: blocking

- [ ] **R1. Seed data for a test staff account.** The test staff login has no homes, shifts,
      tasks, events or notifications, so clock-in, breaks, the calendar, task list and homes could
      only be checked with synthetic data. Please seed one staff account with:
  - 2 assigned homes (one `active`, one `upcoming`), each with `details.timezone`, address and coordinates, one with `requireLocation: true`
  - a shift today covering the current time (to test clock-in / break / resume / clock-out), one tomorrow, and 2 open shifts this week
  - 6+ tasks across every status (`upcoming`, `in_progress`, `submitted`, `completed`, `needs_attention`, one overdue) with `homeId` and `dueAt`, at least one with `priority: high`
  - 2 calendar events this week
  - 5+ notifications across categories, some read and some unread
- [ ] **R2. Confirm `breakSeconds` on `GET /attendance` (and the action responses).** The UI
      treats top-level `breakSeconds` as the **live total including a running break**, as of
      `serverTime`, and counts up from there while `status = on_break`. If it excludes the running
      break, the clock will under-count breaks and over-count worked time. Please confirm or change.
  - **Still open (2026-11-20):** Swagger still only says it "returns … breakSeconds".

- [x] **R3. A "shift done" rule for clock-in.** After clock-out, attendance is `completed` and the
      UI goes back to "Not clocked in" with **Clock in** on the same shift (no Figma frame for a
      finished shift). Please either reject a second clock-in on a completed shift with a clear
      `409` code (e.g. `ALREADY_COMPLETED`) **or** tell us re-clock-in is allowed. Either way, keep
      `completed` attendance for the shift in `GET /attendance` until the shift ends so the UI can
      tell "done" from "not started".
  - **Shipped (2026-11-20):** clock-in on a finished shift returns `409 ALREADY_COMPLETED`
    (or `details.reason: SHIFT_COMPLETED`); the UI shows "You've already clocked out of this
    shift." Still to confirm: does `GET /attendance` keep `status: completed` until the shift
    ends? Swagger says "a completed session is available in history", which suggests it resets
    to `not_clocked_in`, so the UI can't show a finished state without also reading
    `/attendance/history`.

#### P2: the UI shows a placeholder or a local-only control

- [x] **R4. Home fields missing from `GET /homes` and `GET /homes/{id}`.** The list, cards and
      profile panel show these; today residents shows "—" and contact rows are hidden.

  ```jsonc
  {
    "residentsCount": 12, // number of residents at the home
    "contact": { "email": "home@example.com", "phone": "+234 800 000 0000" }, // nullable fields
    "notificationsMuted": false, // this staff member's mute for the home
  }
  ```

  - **Shipped (2026-11-20):** every home has `residentsCount`, `contact {email, phone}` and
    `notificationsMuted` (top level; `details` has copies). Wired to the list, cards and profile
    panel.

- [x] **R5. Mute a home's notifications.** `PATCH /homes/{id}/notifications` with
      `{ "muted": true | false }`, returning the home (or `{ "muted": … }`). The switch in the
      home profile panel is local-only until this exists. Please also say what muting covers
      (all notifications from the home, or chat only; the Figma copy says "for this conversation").
  - **Shipped (2026-11-20):** returns `{ muted, notificationsMuted, scope: "home_push" }`. It
    mutes push for the home's records and home-tagged chats; inbox items still arrive. Wired to
    the profile panel switch (on = muted, reverts with a toast on error). The Figma subtitle
    "Mute notifications for this conversation" is unchanged; design may want "this home".

- [x] **R6. Light unread-message count for the sidebar badge.** Something like
      `GET /api/messaging/unread-count` → `{ "messages": 4, "conversations": 2 }`. The sidebar
      shows on every page; `/overview` has `messaging.data.unread.messages` but is too heavy to call
      everywhere. The badge (Figma shows "10") is hidden until this lands. A socket event when it
      changes would be ideal.
  - **Shipped (2026-11-20):** `GET /api/messaging/unread-count` → `{ messages, conversations }`.
    The sidebar Messages item shows `messages`. It loads with each page; live refresh after
    `message.new` / `receipts.updated` socket events isn't wired yet.

- [x] **R7. A notification category for home assignments.** Figma has "New home assignment"
      with a home icon, but the feed categories are `messages`, `announcements`, `schedule`,
      `tasks`, `attendance`, `hr_documents`. Please add `homes` (preferred) or confirm these come
      through as `announcements`.
  - **Shipped (2026-11-20):** `homes` is a feed and read-all category. Shown with the
    `home-linear` icon and a "View home" link (icon to be checked against Figma).

- [x] **R8. Where a notification's "View …" link goes.** The UI links by category (schedule →
      Home, tasks → task list, messages → inbox). `GET /inbox/{id}/destination` exists, but calling
      it per row is too many requests. Please include `destination` (`type`, `id`, `homeId`,
      `conversationId`) on each `GET /inbox` item so the link can open the exact task, shift or chat.
  - **Shipped (2026-11-20):** each inbox item has a `destination` (`type`, `id`, `homeId`,
    `conversationId`). The UI opens the chat when `conversationId` is set, the home profile for
    `homes` items, and otherwise the category page. **Still needed:** the list of `type` values
    (e.g. `task`, `shift`, `event`?) so links can open the exact task or shift.

- [ ] **R9. Real-time notifications.** A socket event (like messaging's) such as
      `notification.created` / `notification.updated` with the inbox item, so the list and any
      badge update live. Today the page only refreshes on load.
  - **Still open (2026-11-20):** messaging documents its socket events, but there's no
    notifications socket event in Swagger yet.

#### P3: clean-up and contract fixes

- [ ] **R10. `GET /tasks` `counts` casing.** The response uses camelCase (`inProgress`,
      `needsAttention`); Swagger says snake_case (`in_progress`, `needs_attention`), matching the
      `status` values. Please align the response with Swagger (preferred) or update Swagger.
  - **2026-11-20:** Swagger now lists the counts in snake_case as required. Not re-checked
    live (the test account has no tasks); the UI doesn't read `counts`.

- [x] **R11. `GET /shifts/open` requires `from`/`to`.** It returns 400 `VALIDATION_FAILED`
      without them, but Swagger marks them optional. Either default them (e.g. now → +14 days) or
      mark them required in Swagger. Please also document the 93-day range limit on every
      `from`/`to` endpoint.
- [x] **R12. Mark required response fields in Swagger.** Most response fields are optional in
      the spec (`id?`, `name?`, `status?`…), so generated types are all optional. Please mark the
      ones that are always present as `required`.
- [x] **R13. Document error codes per endpoint.** Seen so far: `COMMAND_CENTER_CONFLICT`
      ("You are not clocked in"), `COMMAND_CENTER_INVALID` (range), `NOT_FOUND` ("Assigned shift
      not found"), `VALIDATION_FAILED`. Please list the `code` values each clock action can
      return (e.g. outside the early window, location not verified, already on break) so the UI can
      show the right message.
  - **R11–R13 shipped (2026-11-20):** `from`/`to` are documented as required with the 93-day
    limit; response fields are marked `required`; clock errors carry `details.reason`
    (`NOT_CLOCKED_IN`, `ALREADY_CLOCKED_IN`, `SHIFT_COMPLETED`, `OUTSIDE_SHIFT_WINDOW`,
    `LOCATION_REQUIRED`, `LOCATION_INACCURATE`, `LOCATION_OUTSIDE_HOME`,
    `HOME_LOCATION_UNCONFIGURED`), and the UI shows a plain message for each.
    Repeated break/resume returns 200.

- [ ] **R14. Task status names for the UI.** The list has three states (To do / In progress /
      Completed). The UI maps `submitted` → Completed and `needs_attention` → To do, and hides
      tasks with no `dueAt`. Please confirm, or tell us how `submitted` and `needs_attention`
      should look.

### 0.2.1 Home dashboard v2 (Figma 60:9785 – 60:10864), 2026-11-26

The Home "My time" card, clock-in / clock-out modals, schedule card and open-shift cards were
redesigned. The UI is built against the current API; these are the gaps. API base is now
`https://api.probenapp.com`.

#### P1: blocking testing

- [ ] **R15. A way to sign in as the `@demo.proben.test` accounts.** Every login needs an emailed
      code, and those inboxes don't exist, so only George's account (no shifts, no homes) could be
      tested. Please add a fixed demo code (e.g. `000000`) for `@demo.proben.test` in non-production,
      or send their codes somewhere the team can read. This also unblocks **R1** (the demo staff
      have shifts).
- [ ] **R3 (still open) matters more now.** The v2 card has a "Shift complete" state (total worked,
      clock-out time, "View timesheet"). It needs `GET /attendance` (and `/overview`) to keep
      `status: completed` with `clockedOutAt` for the rest of the day. If it resets to
      `not_clocked_in`, the UI can't show it.

#### P2: buttons that show but do nothing yet

- [ ] **R16. Clock-out note and handover.** The clock-out modal has "Shift note (optional)" and
      "I've completed handover with the next caregiver". `POST /attendance/clock-out` takes no body,
      and the API rejects unknown fields, so neither is sent. Proposed body:
      `{ "note": "string, optional, max ~1000", "handoverCompleted": true }`. Please also say where
      the note shows up (the next caregiver's Home? the home's updates?) and whether handover is
      required to clock out.
- [ ] **R17. Request manual clock-in.** "Clock-in failed" (location not verified) offers
      "Request manual clock-in". Needs something like `POST /attendance/manual-requests`
      `{ shiftId, reason?, latitude?, longitude? }` → pending request a manager approves, plus how
      the card should look while it's pending.
- [ ] **R18. Request overtime approval.** The Overtime state ("Overtime · +25 min", "Was due 4:00 PM")
      offers "Request approval". `isOvertime` is informational only. Needs e.g.
      `POST /attendance/{id}/overtime-requests` `{ reason? }` and a status on the attendance record
      (`overtimeRequest: "pending" | "approved" | "rejected" | null`).
- [ ] **R19. Timesheet.** "View timesheet" (Shift complete). `GET /attendance/history` exists; please
      confirm each item has clock-in/out, `breakSeconds` and `workedSeconds`, and whether there's a
      submit/approve step ("submitting them to your timesheet" in the clock-out modal). No timesheet
      screen in Figma yet.
- [ ] **R20. Event category (agenda bar colour).** Agenda cards have a coloured bar (green shift,
      blue / purple / amber events in Figma). Events have no category, so every event is blue. Please
      add `category` (or `color`) to events.
- [ ] **R21. Event completion rule.** The agenda shows Completed / In progress / Upcoming /
      Overdue. The UI uses `completedAt` for Completed and marks an event that has ended without it
      as **Overdue**. Please confirm, or tell us if past events should count as done automatically
      (Figma shows past meetings as "Completed"). The header counts "N of M done" the same way.
- [ ] **R22. Open shift "Pick up".** The cards have a Pick up button. `POST /shifts/{id}/pickup`
      is now called from a home's Schedule tab ("Pick up shift"); the dashboard card isn't wired yet
      (no confirm flow in Figma). Please confirm it books the shift straight
      away (vs. a request), and what errors it returns (already taken, overlaps a shift).

#### P3: copy and accuracy

- [ ] **R23. Distance on location failures.** Figma: "Location not verified — you're 1.2 mi from
      Oakridge Group Home." The UI works this out from the device position and home coordinates when
      it has both. Please add `details.distanceMeters` (and `details.radiusMeters`) to
      `LOCATION_OUTSIDE_HOME` so the message always matches what the server measured.
- [ ] **R24. "Open shifts near you this week".** The no-shift note in Figma says "3 open shifts near
      you this week". The UI shows the `total` from `/shifts/open` for the next 14 days ("3 open shifts
      available."). Please say whether "near you" should filter by distance/home, and the window.
- [ ] **R25. Role on the clock-in modal.** The modal shows "Direct Support Professional · 8:00 AM –
      4:00 PM". The UI uses the shift's `home.assignmentRole`; please make sure it's set on shifts (it's
      hidden when empty).

### 0.2.2 Today's Schedule (Figma 60:6134 – 60:6829), 2026-11-26

`/schedule` (calendar, same data as My Tasks) and `/schedule/list` (list + detail panel). The
list shows your events (`GET /events`, 30 days back for Overdue) and tasks with a `dueAt`
(`GET /tasks`), grouped Overdue → today → Saturday.

- [ ] **R26. Event/task fields the list and panel show.** Today these are hidden:
  - **Type** (Meeting / Training / Webinar / 1:1 Session): same as R20. Events show a blue "Event",
    tasks an amber "Task".
  - **Subtitle** ("Product team · Google Meet"): the UI shows the home name. Please add `location`
    (and a team/organiser label if there is one).
  - **Location** row ("HR · Conference room B"): `location` on events.
  - **Assigned by** ("Grace Okafor, HR"): events and tasks have `createdById` only; please add
    `createdBy: { id, name, role }`.
  - **Checklist** ("Checklist · 1 of 3"): `checklist: [{ id, label, done }]` plus an endpoint to tick an
    item (e.g. `PATCH /events/{id}/checklist/{itemId}` `{ done }`).
- [ ] **R27. Reschedule.** The panel has "Reschedule". There's no endpoint (staff can't edit events);
      please say whether this should propose a new time (`POST /events/{id}/reschedule-requests`
      `{ startsAt, endsAt, reason? }`) or is admin-only.
- [ ] **R28. Completing tasks from the list.** Ticking a row / "Mark as complete" calls
      `POST /events/{id}/complete` for events. Tasks need `start` → `draft` → `submit` with a `version`
      and form answers, so they can't be ticked here; the checkbox is disabled for tasks. Please confirm,
      or add a one-step complete for tasks with no form fields. There's also no "un-complete" for
      events, so a tick can't be undone.

- [ ] **R29. "Add task" from the calendar day panel (Figma 60:7203).** Staff can't create tasks or
      events (`/admin/*` only). Please say whether staff may add personal tasks/reminders (e.g.
      `POST /tasks` with `{ title, dueAt, homeId? }`), or whether the button should be hidden for staff.
- [ ] **R30. "Assigned by" in the calendar quick peek (Figma 60:7539).** Same data as R26
      (`createdBy.name`); the row is hidden until it exists.
- [ ] **R31. My tasks subtitle (Figma 60:11012).** Each row shows a one-line subtitle ("Module 3 of 5
      · 60% complete · last opened yesterday", "Draft saved Oct 24 · 1 required field remaining").
      `GET /tasks` has only `description`, so the UI shows its first line. Please add a short
      `summary` (or progress fields) if the subtitle should be live progress.
- [ ] **R32. My tasks counts beyond 100 (Figma 60:11012).** The table loads `GET /tasks?limit=100`
      and filters, searches and counts in the browser ("Status: All tasks · 21"). Please return
      `total` per status (or confirm staff never have more than 100 open tasks) so counts stay right.
- [ ] **R33. "Mark as complete" for simple tasks (Figma 60:11280).** For a task with no required
      `fields`, the detail panel calls `POST /tasks/{id}/start` (if still upcoming) then
      `POST /tasks/{id}/submit` with `{ version }`, and shows "… moved to Finished". Please confirm
      submit is valid with no draft saved, and that a submitted task gets `completedAt` (or
      `submittedAt`) for the Completed column's date and "On time" / "N days late".
- [ ] **R34. Task drawer details (Figma 60:11701).** `GET /tasks` lacks, so the drawer hides:
      "by Grace Okafor, HR" (assigner name + team, e.g. `createdBy: { name, team }`), "Required
      action" (short text), "Instructions" (ordered list of steps), and reference attachments from
      HR (e.g. "Approved CPR providers.pdf": file ids + names + sizes, separate from the staff
      member's own `attachments`).
- [ ] **R35. Task form fields (Figma 60:11826).** Field `type` has no `date` ("Expiry date" is a
      text input for now). Please add `date` (and min/max, e.g. "Must be later than today"), a
      per-field `hint`, and for `file` fields the accepted types and max size (the UI assumes PDF,
      JPG or PNG up to 10 MB).
- [ ] **R36. Task file uploads.** The UI posts `file`, `clientUploadId` and `source: "task"` to
      `POST /api/files`, and stores the returned `id` as the field's answer plus in `attachments`
      on the draft. The files service docs leave `UploadDto` empty: please confirm the `source`
      value for task uploads, the response shape (`id`), and that `GET /api/files/{id}` returns
      `name` and `size` for the drawer's file list.
- [ ] **R37. After submitting (Figma 60:12071).** The success view shows "Next: HR verification"
      and "HR will verify your certificate within 2 business days." Please return what happens
      next (e.g. `reviewStep`, `reviewEta`) so it isn't hard-coded; the UI leaves it out for now.
- [ ] **R38. More task drawer data (Figma 60:12169, 60:12401, 60:12512).** (a) "Duration: About
      45 min · 3 modules" for courses (`estimatedMinutes`, `moduleCount`). (b) Per-task wording:
      the form title ("Emergency contact"), the success title ("Emergency contact updated",
      "Certification submitted") and message, and "Next: No further action". The UI uses generic
      text ("Submit required information", "Task submitted") until these exist. (c) A `phone`
      field type so the input can show the "+1 (_**) _**-****" pattern. (d) The drawer's "Draft
      saved Oct 24, 4:12 PM" uses the task's `updatedAt`; please confirm a draft save updates it.

- [ ] **R39. Home detail page (Figma 60:13792).** (a) `GET /homes/{id}/team` has no documented
      response. The UI reads an array (or `items`, `members` or `staff`) of people with `id`, a name
      (`name`, `displayName` or `firstName` + `lastName`) and a role (`role` or `jobTitle`). Please
      document the shape and include the total for "View all · 8". (b) "Home manager" and "Usual
      shift" ("8:00 AM – 4:00 PM") on Your assignment have no fields; they show "—". (c) "Home
      status" (the home's own status, separate from your assignment) isn't returned; the UI shows
      "Active". (d) "State" shows `details.region` as sent ("WI"); Figma shows "Wisconsin (WI)",
      so a full state name would help.

- [ ] **R40. Home team, schedule and updates tabs (Figma 60:13930, 60:14124, 60:14244).**
      (a) Team: per person `phone`, whether they're on shift now with `shiftEndsAt`, and
      `nextShiftStartsAt` (for "On shift · until 5:00 PM", "Starts 4:00 PM", "Off today · back
      Mon"); a flag for the signed-in person. (b) Schedule: `GET /homes/{id}/schedule` has no
      documented response; the UI reads `items` (or `shifts`) with `id`, `startsAt`, `endsAt`,
      `title`, the staff on it (`staff` / `assignees` with names), `requiredStaff`, `isMine`.
      Please document it, plus a day "coverage" count ("Coverage 7 of 8 staff"). (c) Updates: a
      `type` (Announcement / Care note / Maintenance) for the tag, filter and "This week" counts;
      `pinned`; an acknowledge-by date ("Please read and acknowledge by Mon, Oct 29"); how many
      staff have acknowledged ("12 of 18 staff"); and the author's name and role (only
      `createdById` today; the UI looks it up in the team list). (d) Home contacts: home
      manager, on-call nurse and emergency instructions (only the home's phone and email exist).
      (e) "Message" on a team card opens Messages; starting a chat with that person needs their
      messaging user id.

- [ ] **R41. Home resources (Figma 60:14528, 60:14744).** `GET /homes/{id}/resources` has
      `title`, `fileId`, `createdAt`. The UI also needs a `category` (Emergency / Policies / Forms /
      Care plans) for the tag and filter, a one-line `description`, and a `restricted` flag (with
      who can open it) for "Restricted to the home manager and nurse". File name and size come from
      `GET /api/files/{id}`; please confirm it returns `name` and `size`. The preview shows PDFs and
      images inline (our server streams the file with `Content-Disposition: inline`); a page count
      ("Page 1 of 4") would need `pageCount` from the files service.

- [ ] **R42. Global search (Figma 60:14989 – 60:15643, not built yet).** `GET /search?q=` (q ≥ 2
      characters) returns `tasks`, `events`, `homes`, `people`, `messages`, `conversations` and
      `scope`, but Swagger documents it as a free-form object. Please document each section's item
      fields. The design also has a **Files** scope and per-scope counts ("Messages 3", "Files 1");
      files aren't in the response. `GET/POST/DELETE /search/recents` exist (recent searches with
      "Clear"); please document the item shape and what `POST` expects (`SearchQuery`). The
      "Quick actions" (Clock in, View tasks that need attention, Pick up an open shift, New message)
      are built from existing endpoints.

### 0.3 Earlier open questions now answered by the live API

| Question                                    | Answer from the API                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| §1.4.4 Overtime rule?                       | `isOvertime` on attendance (informational, not payroll).                             |
| §1.4.6 Location / geofence?                 | Per home: `details.requireLocation` + `geofenceRadiusMeters`; UI sends GPS when set. |
| §1.4.7 Which shift does clock-in attach to? | Clock-in takes `shiftId`; the UI sends the shift being shown.                        |
| §1.4.3 Breaks after the allowance?          | Still unanswered: no `details.reason` for going over `breakAllowanceMinutes`.        |
| §4.2 Map coordinates                        | `details.latitude` / `longitude` (and `onMap`) on homes.                             |
| §5.3.2 Mark a notification unread?          | Yes: `POST /inbox/{id}/unread` (UI doesn't offer it yet; not in Figma).              |
| §5.3.3 Paging                               | `limit` (max 100) + `nextCursor`; the UI loads the newest 100.                       |

### 0.4 Still open for product / design (not backend)

1. ~~Clocking out early~~: answered by the v2 design (Clock out is always shown while clocked in,
   behind a confirmation modal).
2. ~~Finished-shift state~~: v2 has "Shift complete" (still depends on R3).
3. **Open-shift pick-up:** the v2 cards have a Pick up button but no confirm flow (R22).
4. **Task detail page** (§3.3.4): `GET /tasks/{id}`, `POST /tasks/{id}/start`, `PATCH …/draft` and
   `POST …/submit` exist; waiting on a design.
5. **Map provider** (§4.3.4): Google Maps, Mapbox or OpenStreetMap, and whether a key is needed.
6. **"Available" count on task days** (§3.3.1): the UI shows the number of tasks in the group.

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
