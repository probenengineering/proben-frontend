# Command Center — backend handover

**Updated 2026-11-26 (third pass).** This lists only what the backend still needs to do or has only
partly done. Items that have shipped are removed. API base: `https://api.probenapp.com`. Swagger:
`/api/commandcenter/docs`, `/api/identity/docs`, `/api/messaging/docs`, `/api/notifications/docs`,
`/api/files/docs`.

Checked against the live Swagger on 2026-11-26 after the latest backend deploy. Shipped and removed
in this pass, with the frontend now using them:

- **R14:** task statuses. `submitted` now shows as In progress (in review) and `needs_attention`
  as To do, with the reviewer's `feedback`.
- **R16:** `handoverCompleted` is a boolean.
- **R19:** confirmed there's no timesheet submit step.
- **R23:** `details.distanceMeters` on `LOCATION_OUTSIDE_HOME` is now shown.
- **R25:** `role` is required on shifts.
- **R27:** confirmed staff can't reschedule, and `canReschedule` is false for them.
- **R29:** answered. Admins use `POST /admin/tasks`.
- **R33:** submitting without a draft is valid for tasks with no fields.
- **R40c:** updates carry `createdBy`.
- **R40d:** contact fields are documented.
- **R41:** `contentPath` is documented.

Also wired: `pending_approval` attendance with `POST /attendance/manual-requests` ("Request manual
clock-in"), `GET /homes/{id}/schedule` `coverage`, team `isMe`, task field types `date` and `phone`
with per-field file limits, the typed notification `destination.type`, and the slim `GET /search`
items.

| #   | Feature                | Backend still needed or partly done |
| --- | ---------------------- | ----------------------------------- |
| 1   | Time clock             | R44                                 |
| 2   | My Tasks               | R10, R45                            |
| 3   | Search                 | R46                                 |
| 4   | Messages and directory | R47, R48                            |
| 5   | Testing                | R15, R1                             |

Conventions: times on the wire are ISO 8601 UTC. The server clock is the source of truth. Errors use
the shared shape (`statusCode`, `code`, `message`, `details`).

## Summary, most important first

**P1: blocking real testing**

- **R15** Demo accounts can't sign in: every login needs an emailed code. Unblocks **R1** (seed
  data). The test account has no homes, shifts or tasks, so most screens were only checked with
  sample data.

**P2: not done**

- **R44** Manual clock-in rejection feedback. **R45** File scan status after upload. **R46** Sender
  on search messages. **R47** Directory schemas.

**P3: needs a live check or a small answer**

- **R10** `counts` casing on `GET /tasks`. **R48** `types` query format on `GET /conversations`.

---

## P1: blocking

- [ ] **R15. Sign-in for the `@demo.proben.test` accounts.** Not done: identity has no change for
      these accounts. Every login needs an emailed code, and those inboxes don't exist. Please add
      a fixed code (e.g. `000000`) for `@demo.proben.test` in non-production, or send the codes
      somewhere the team can read.
- [ ] **R1. Seed data for a test staff account.** Can't be checked until R15 is done. Please seed
      one staff account with:
  - 2 assigned homes (one `active`, one `upcoming`), each with `details.timezone`, address,
    coordinates, manager, usual shift and contacts, one with `requireLocation: true`;
  - a shift today covering the current time, one tomorrow, and 2 open shifts this week;
  - 6+ tasks across every status (one overdue, one `submitted`, one `needs_attention` with
    `feedback`, one `priority: high`), some with form `fields` including `file`, `date` and
    `phone`, some with checklists and instructions;
  - 2 events this week (different categories, one with a checklist), 3+ home updates (one
    `requiresAck`, one pinned), 2+ home resources (one PDF, one restricted);
  - 5+ notifications across destination types, some read and some unread;
  - other staff on the same homes, so the Team tab, coverage and search have people;
  - a second account with provider-wide `org.manage`, to test "Add task" and manual clock-in
    review.

## P2: not done

- [ ] **R44. Rejected manual clock-in.** After "Request manual clock-in" the card shows "Awaiting
      approval" while `GET /attendance` returns `pending_approval`. Please confirm what the status
      becomes after a rejection: back to `not_clocked_in`, with `manualClockInRequest.status:
      "rejected"` and `feedback`? The UI would then show the feedback and offer Try again.
- [ ] **R45. File scan status.** `POST /api/files` returns `status: "pending_scan"`, and submit
      needs clean files. The UI doesn't poll yet. Please say how long scans usually take, and
      whether `POST /tasks/{id}/submit` returns a specific `code` while a file is still being
      scanned, so the UI can show "Checking your file…" instead of a generic error.
- [ ] **R46. Search message sender.** `GET /search` `messages.data.items` has only `id`,
      `conversationId`, `body` and `sentAt`. Rows are titled with the conversation's name when it's
      also a result, else "Message". Please add `senderId` and `senderName`, and the conversation
      `name` or `type`.
- [ ] **R47. Directory schemas.** `POST /api/identity/directory/lookup` (request and response) and
      `GET /api/identity/directory/staff/{id}` (response) are `object {}` in Swagger. The UI reads
      names and profiles from them defensively. Please document both.

## P3: needs a live check

- [ ] **R10. `GET /tasks` `counts` casing.** Swagger lists snake_case (`in_progress`,
      `needs_attention`). An earlier response used camelCase. Please confirm the live response
      matches Swagger. This can be checked once R1 is done.
- [ ] **R48. `GET /api/messaging/conversations` `types`.** Swagger declares an array. The UI
      sends one comma-separated value (`types=direct,group`). Please confirm that's accepted, or say
      to send `types=direct&types=group`.

## Frontend, not started yet (needs Figma)

- **Add task form:** `POST /admin/tasks` (TaskDto) exists. The "Add task" button shows only for
  provider-wide `org.manage`, but there's no Figma frame for the create form yet.
- **Provider choice at sign-in:** `/auth/login` and `/auth/password/recovery` accept
  `providerSlug`. No screen for it yet.
- **Other new endpoints with no screen yet:** `POST /events/{id}/reopen`,
  `PATCH /events|tasks/{id}/checklist/{itemId}`, `POST /attendance/{id}/overtime-requests` and
  `/time-off`.

## Not backend: open for product and design

- **Open-shift pick-up:** there's no confirm step in Figma. Pick-up books straight away.
- **Open shifts label:** the backend says the list isn't filtered by distance and should read
  "Open shifts at your homes", not "Open shifts near you this week". The Figma copy needs updating.
- **Mute a home:** the switch subtitle says "Mute notifications for this conversation"; muting
  covers the whole home, so the copy may want "this home".
- **Map:** the homes map uses MapLibre with OpenFreeMap tiles (free, no key). Confirm that's fine
  for production, or choose a paid provider.
- **Task submitted copy:** the submitted view says "moved to Finished", but submitted tasks now
  sit under In progress until they're reviewed.
- **No Figma frames yet:** "Awaiting approval" clock state, "Changes requested" banner in the task
  drawer, and date and phone task fields.
