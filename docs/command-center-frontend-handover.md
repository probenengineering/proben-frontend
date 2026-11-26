# Command Center frontend handover response

Reviewed on 26 November 2026 against the seven-page “Command Center: backend handover” PDF, the current source and live API at `https://api.probenapp.com`.

Most items in the PDF were addressed by the earlier second-pass implementation. The remaining seed gap found in this review is colleague membership and assigned coverage in each user's personal fixture homes. That fix is implemented locally and must be deployed and rerun before those two checks will pass in production.

## Request-by-request outcome

| Request | Backend contract and frontend action | Verification |
| --- | --- | --- |
| R1: seed data | Each seeded end user has two personal fixture homes (active/upcoming), assigned/open shifts, seven tasks, two calendar events, home updates, restricted/PDF resources and read/unread notifications. The batch now also assigns another demo colleague to both fixture homes and creates non-overlapping colleague coverage. | Live personal data passed. Live Team/coverage failed before this fix; deploy the updated batch and rerun it. Local integration verifies both homes and repeat runs. |
| R23: GPS distance | Outside-home failures already include numeric `details.distanceMeters`, `details.radiusMeters`, and `details.accuracyMeters`. Read `details.reason === "LOCATION_OUTSIDE_HOME"`; the top-level `code` is `COMMAND_CENTER_INVALID` (HTTP 400). Swagger now states this distinction explicitly. | Local HTTP integration checks the code, reason, numeric distance and radius, and distance greater than radius for a deliberately distant location. This review did not create a new live attendance session. |
| R29: staff Add task | **Option B:** ordinary staff cannot create personal tasks. Hide the Add task action. Task creation is `POST /admin/tasks`, requiring provider-wide `org.manage`. | Current live Swagger has no `POST /tasks` operation. Existing access tests cover staff rejection of task administration. |
| R33: submit without draft | A task with no required form answers can be started and submitted using only `{ "version": CURRENT_VERSION }`. No prior draft is required. Use the version returned by start. Success is `submitted`, awaiting review. | Live Swagger documents optional drafts. Local API tests exercise no-draft submissions. |
| R14: status names | Show `needs_attention` as **Changes requested** with `feedback`. Group it under To do if using three groups. Show `submitted` as **Waiting for review**, under In progress; only `completed` belongs in Completed. Cancelled is a separate terminal state. | Live seeded task has `needs_attention` with feedback. Status wording is already in Swagger. |
| R19: timesheet | There is **no separate timesheet submit or approve endpoint**. Clock-out saves the record; query `GET /attendance/history?from=...&to=...`. Overtime approval and attendance corrections are separate workflows. Suggested clock-out text: “Save this shift to your timesheet”. | Confirmed in source, API tests and current live Swagger. |
| R25: shift role | Every returned shift has a non-empty `role`. Legacy empty values use the neutral label **Staff member**. The response schema marks role required. Assigned homes also expose `assignmentRole`. | Live assigned shifts all have non-empty roles. Database migration, response normalization and contract tests enforce the guarantee. |
| R27: staff reschedule | **Option B:** staff event responses have `canReschedule: false`; hide the staff Reschedule action. No proposal endpoint is implemented. Administrators use **PATCH** `/admin/events/{id}/reschedule`, not POST. | Every event in the selected staff account's live response had `canReschedule: false`. Local tests cover administrative rescheduling. |
| R40c: update author | Every home update includes `createdBy: { id, name, role, team }`. New updates capture author metadata. Old records without a snapshot may have null name/role/team; use a fallback label only for those historical values. | Live home updates include the author object. Swagger requires `createdBy`. |
| R40d: home contacts | `contacts.manager` and `contacts.onCallNurse` document `staffId`, `name`, `role`, `phone`, `email`. `contacts.emergencyInstructions` is text. Contacts can be null and individual fields can be absent when not published. Seeded contacts have the frontend's expected fields. | Live seeded contacts have name/role/phone/email. Typed Swagger schemas and local contract tests cover the fields. |
| R41: contentPath | `contentPath` is the authenticated relative route `/api/files/{fileId}/content`. It is a convenience for opening a resource through the API gateway, not a public URL or storage key. The frontend can keep using its existing authenticated download/preview proxy and build this same route from `fileId`. | Live resources return the expected paths, including a restricted resource. Source access is checked when opening content. |
| R16: handover boolean | `ClockOutDto.handoverCompleted` is a Swagger boolean, optional with default false. | Confirmed against current live Swagger. |
| R10: count casing | Task counts use **snake_case**: `upcoming`, `in_progress`, `submitted`, `completed`, `needs_attention`, `cancelled`, `all`, `overdue`. Do not convert these to camelCase. | Confirmed live after seeding; selected staff account had seven tasks. |

## Live evidence and its limits

The read-only audit used the existing `horlamiedea+22@gmail.com` session. It passed **16 of 18 checks**. The two failures were:

1. Another visible colleague in the account's active personal fixture home (Team showed only the account itself).
2. An assigned colleague shift in that home's coverage response.

See [the saved live results](command-center-handover-live-results.json) for the timestamp and each assertion. The audit reads endpoints and Swagger; it does not prove email/push delivery, actual GPS accuracy, no-draft submission on production, every organisation's configuration, or a complete browser UI integration. Live fixture checks describe that point in time; shifts and events naturally age.

## Seed correction and deployment

The batch originally put everyone in the shared Demo workforce hub, while keeping each account's personal fixture homes separate. The updated batch adds a rotating colleague to both of each account's fixture homes **after** creating everyone's personal shifts. It then creates one colleague coverage shift per fixture home, avoiding existing scheduled shifts. This ordering prevents coverage for one user from blocking another user's own shift setup.

Existing memberships, roles, passwords, tasks and completed work remain. The batch refuses to overwrite conflicting existing schedules. It reports `companionStaffIds`, `coverageShiftIds` and `colleaguesReady`, in addition to notification readiness. Coverage in the active home starts around two days after seeding; coverage in the upcoming home starts around six days after seeding. Use a date range that includes those dates. Team/coverage child routes require an active assignment for the caller; an upcoming home's details can be viewed before its start, but its operational child routes are not a way to bypass that start date.

After deploying/rebuilding the updated code, run from the server repository directory:

```sh
sudo docker compose --profile apps exec -T identity node scripts/seed-demo-workforce.mjs --base-url http://gateway:8009
```

Check that each account reports `colleaguesReady: true`, two `coverageShiftIds`, and `notificationsReady: true`. Then sign in/refresh the staff session and check:

- `GET /api/commandcenter/homes?limit=100`: select the active home whose name begins with `CC Test` and the first eight characters of the signed-in staff UUID.
- `GET /api/commandcenter/homes/{homeId}/team?limit=100`: at least one person besides the current user.
- `GET /api/commandcenter/homes/{homeId}/schedule?from=...&to=...`: an assigned shift for that colleague, with non-null staff identity. A range from today through the next 14 days covers the seeded fixtures.

Do not remove the database or Docker volumes. The command can resume an interrupted seed and sequential reruns reuse fixture rows. Run one batch instance at a time. Membership changes invalidate older access tokens; refresh after the batch completes.

## GPS integration detail

An example outside-home error has this shape (numbers are illustrative):

```json
{
  "statusCode": 400,
  "code": "COMMAND_CENTER_INVALID",
  "message": "Location is outside the home clock-in radius",
  "details": {
    "reason": "LOCATION_OUTSIDE_HOME",
    "distanceMeters": 1931.2,
    "radiusMeters": 150,
    "accuracyMeters": 5
  }
}
```

Use the measured distance to render the UI's distance label; metres divided by `1609.344` gives miles. Acceptance requires measured distance **plus the reported accuracy** to fit inside the configured radius. A device can therefore fail near the boundary even if its distance alone is below the radius. Missing/inaccurate GPS and an unconfigured home have distinct reasons and do not necessarily carry distance values.

For a deliberate outside-home test, use an active assigned GPS-required home and an uncompleted shift within its allowed clock-in window. The batch's GPS-required personal home is initially upcoming; use an explicitly prepared active GPS fixture for immediate clock testing. Do not mutate completed timesheets just to force a GPS check. Local integration creates the appropriate active GPS fixture and checks the failed clock-in before a successful one.

## Local verification

The updated implementation passed 444 cross-service checks, covering all 66 documented Command Center operations and all 19 notification operations, plus 216 backend unit tests and four seed HTTP retry tests. Workspace typecheck and the Command Center build passed. The cross-service suite uses disposable PostgreSQL/Redis and actual HTTP applications/handlers; broker transport, external mail and push delivery are not exercised against production.

The seed now honours gateway `Retry-After` responses with bounded retries, including during token refresh. It does not lower authentication limits and does not automatically retry uncertain network failures or 5xx responses after a possible write. No new API endpoints or database migration are required for the colleague correction.

## References and product decisions

- [Command Center Swagger](https://api.probenapp.com/api/commandcenter/docs)
- [OpenAPI export](command-center.openapi.json)
- [Postman collection](postman/proben.command-center.postman_collection.json)
- [Demo accounts and seed instructions](demo-workforce.md)
- [Roles and permissions](roles-and-permissions.md)
- [Earlier blocker decisions](command-center-blockers-pass2.md)

The PDF explicitly leaves the open-shift confirmation design, distance-based label, home-mute copy and map-provider choice with product/design. This change does not add a confirmation step, geospatial shift filtering or map-provider integration. Pickup remains immediate booking, and home muting remains a home notification preference.
