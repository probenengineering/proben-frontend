# Staff management: left for the backend

**Updated 2026-11-27.** API base: `https://api.probenapp.com`.

1. **Activity for invitations and cancelled tasks.** The end-to-end test found that `GET /staff/{id}/activity` records nothing when an invitation is sent or resent (`POST /staff/{id}/resend-invite`), or when a task is cancelled (`POST /admin/tasks/{id}/cancel`). Everything else (record created, homes, role, task assigned) appeared as expected. Add kinds such as `invitation_sent` and `task_cancelled`, or confirm these are left out on purpose.
