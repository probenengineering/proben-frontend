# Proben roles and permissions

Reference date: 26 November 2026. This document describes the current repository implementation, including messaging, Command Center, notifications, organisation administration and platform access.

The backend defines **7 default organisation roles**, **23 permission keys**, and **two platform roles**. Organisations can edit their role permissions and create custom roles. The default matrix below is a template reference, not a verified export of the current production database. Use the roles and current-user APIs to see an organisation's actual configuration.

## 1. How access is decided

A job title, team membership and role assignment are different records. A job title such as Nurse does not grant permissions by itself. Nurses use the Care staff role by default. Joining a home or team controls membership and visibility; assigning a role controls authority.

A staff member can hold several roles. Their permissions are combined as a union across those assignments; there is no deny permission that cancels another role's grant. Permissions belong to one organisation, and tenant boundaries still apply even for an administrator.

Access also depends on the caller type, enabled modules where checked, account/session state, resource ownership, conversation membership, provider settings and operational rules such as home assignment dates. A permission does not bypass those checks.

### Assignment scopes

| Permission scope | Provider-wide role assignment | Role assignment for one home |
| --- | --- | --- |
| Personal | Grants the capability within the person's permitted use | Also grants the personal capability; it does not create an unlimited audience or bypass directory rules |
| Home | Grants authority across the provider, subject to endpoint-specific checks | Grants authority only for that assigned home |
| Provider | Grants provider administration authority | Grants nothing for that permission |

Examples:

- A Home manager assigned to Oak House can manage staff within the implemented home-management restrictions. The same assignment does not grant authority at Elm Lodge.
- A Regional manager assigned once per home receives home authority for those homes. Assigning the role provider-wide broadens its home-scoped permissions across the organisation.
- A Provider administrator role assigned only at one home does **not** grant provider-scoped permissions such as `org.manage` or `roles.manage`. Use a provider-wide assignment for an organisation administrator.
- Assigning a home-scoped role with personal messaging permissions still allows personal messaging outside that home where the directory and conversation rules permit it.

## 2. Default organisation roles

| Role key | Display name | Intended use | Permission count |
| --- | --- | --- | --- |
| `care_staff` | Care staff | Care assistants, support workers and nurses | 5 |
| `senior_carer` | Team leader / senior carer | Leads a shift or team | 7 |
| `home_manager` | Home manager | Home and deputy managers; usually assigned to specific homes | 14 |
| `regional_manager` | Regional manager | Oversees several homes; assign once per home or provider-wide | 13 |
| `office_staff` | HR and office staff | Non-clinical coordination | 7 |
| `information_governance` | Information governance lead | Data protection officer; the only default role with audited content access | 8 |
| `provider_admin` | Provider administrator | Manages accounts, roles, structure and settings | 20 |

Practical distinctions in the current defaults:

- Care staff can use the directory, send text/attachments/voice notes and start calls. Group creation, priority sending and organisation administration require additional permissions.
- Senior carers add group creation and priority sending to the care-staff baseline.
- Home managers can invite and manage staff in scope. Regional managers can view staff in scope but do **not** receive `staff.manage` by default.
- HR and office staff can create groups and view staff in scope; the role name does not grant staff editing or role administration.
- Information governance leads have audited content access, exports and legal-hold powers. Their template does **not** include attachments, voice-note sending, starting calls, group creation or organisation administration. Other assigned roles can add these capabilities.
- Provider administrators manage people, roles, settings, structure and messaging metadata. Their template does **not** include `messaging.content.access`, `messaging.export` or `messaging.legal_hold.manage`. They can still read conversations they legitimately belong to. Holders of `roles.manage` can change role contents or assignments, so these are default allocations rather than an immutable separation of powers.

## 3. Complete permission catalogue

The scope column refers to the assignment rules above. Feature policy and resource checks still apply.

| Permission key | Scope | Capability |
| --- | --- | --- |
| `directory.view` | personal | Use the staff directory within the provider-configured scope |
| `directory.view_all` | home | See every staff member in scope regardless of shared homes or teams |
| `messaging.use` | personal | Send and receive direct and group messages |
| `messaging.attachments.send` | personal | Attach images and documents to messages |
| `messaging.voice_notes.send` | personal | Record and send voice notes |
| `messaging.calls.start` | personal | Start voice and video calls (anyone can answer a call they receive) |
| `messaging.groups.create` | personal | Create group conversations |
| `messaging.groups.manage` | home | Manage groups linked to a home; receives ownership when the last owner leaves |
| `messaging.priority.send` | personal | Send priority messages and request acknowledgment |
| `messaging.announcements.send` | home | Publish announcements to homes, teams, departments, roles or the provider |
| `messaging.admin` | provider | Review and administer groups, memberships and ownership |
| `messaging.content.access` | provider | Read message content for a recorded reason (audited) |
| `messaging.legal_hold.manage` | provider | Place and release legal holds |
| `messaging.export` | provider | Export messages for subject access or investigation (audited) |
| `messaging.reports.view` | home | View messaging adoption, delivery and priority usage reports |
| `org.manage` | provider | Manage homes, teams and departments |
| `staff.view` | home | View staff accounts and their status |
| `staff.manage` | home | Invite, edit, assign and deactivate staff |
| `roles.manage` | provider | Create and edit roles |
| `provider.settings.manage` | provider | Change provider settings such as retention and notification limits |
| `support.grants.manage` | provider | Authorise Proben support to access provider data |
| `audit.view` | provider | View the provider audit log |
| `reports.view` | home | View account activation reports |

## 4. Default role-permission matrix

Column abbreviations: **Care** = care_staff; **Senior** = senior_carer; **Home** = home_manager; **Regional** = regional_manager; **Office** = office_staff; **IG** = information_governance; **Admin** = provider_admin.

**Yes** means the permission is included in the template. Its effective scope depends on the assignment. **—** means it is absent from that template and may still come from another assigned role.

| Permission | Care | Senior | Home | Regional | Office | IG | Admin |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `directory.view` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `directory.view_all` | — | — | Yes | Yes | — | Yes | Yes |
| `messaging.use` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `messaging.attachments.send` | Yes | Yes | Yes | Yes | Yes | — | Yes |
| `messaging.voice_notes.send` | Yes | Yes | Yes | Yes | Yes | — | Yes |
| `messaging.calls.start` | Yes | Yes | Yes | Yes | Yes | — | Yes |
| `messaging.groups.create` | — | Yes | Yes | Yes | Yes | — | Yes |
| `messaging.groups.manage` | — | — | Yes | Yes | — | — | Yes |
| `messaging.priority.send` | — | Yes | Yes | Yes | — | — | Yes |
| `messaging.announcements.send` | — | — | Yes | Yes | — | — | Yes |
| `messaging.admin` | — | — | — | — | — | Yes | Yes |
| `messaging.content.access` | — | — | — | — | — | Yes | — |
| `messaging.legal_hold.manage` | — | — | — | — | — | Yes | — |
| `messaging.export` | — | — | — | — | — | Yes | — |
| `messaging.reports.view` | — | — | Yes | Yes | — | — | Yes |
| `org.manage` | — | — | — | — | — | — | Yes |
| `staff.view` | — | — | Yes | Yes | Yes | — | Yes |
| `staff.manage` | — | — | Yes | — | — | — | Yes |
| `roles.manage` | — | — | — | — | — | — | Yes |
| `provider.settings.manage` | — | — | — | — | — | — | Yes |
| `support.grants.manage` | — | — | — | — | — | — | Yes |
| `audit.view` | — | — | — | — | — | Yes | Yes |
| `reports.view` | — | — | Yes | Yes | — | — | Yes |

## 5. Command Center access

Command Center currently accepts authenticated **staff** callers. It does not define separate permission strings such as tasks.manage, schedules.manage or attendance.approve. Its administration methods require **provider-wide `org.manage`**. Of the default templates, only a provider-wide Provider administrator assignment supplies that permission.

| Area | Ordinary staff access | Administration access |
| --- | --- | --- |
| Overview | Own overview and accessible source records | Staff administrators also retain their personal overview |
| Tasks | View assigned tasks, save drafts, start work and submit answers | Create/assign, review, return for changes and cancel tasks |
| Calendar | View own events and complete/reopen eligible own events | Create/assign events, delete events and use the administrative reschedule endpoint |
| Shifts and schedule | View assigned/eligible open shifts and permitted home coverage; use available shift-request workflows | Create/change/cancel shifts and review staffing requests, subject to attendance and conflict rules |
| Attendance/timesheets | Clock in/out, break/resume, view own history and submit eligible manual/overtime requests | Review requests and correct completed attendance with an audit trail; self-review restrictions apply |
| Time off | Create, view and cancel eligible own requests | View organisation requests and approve/decline them |
| Homes | View assigned active/upcoming homes and permitted team, schedule, resources and updates | Set operational assignment windows, publish resources/updates and manage administrative home data |
| Resources | Read resources permitted by home membership and any explicit recipient restriction | Publish resources and specify restrictions |
| Updates | Read accessible home updates and acknowledge those requiring acknowledgement | Publish home updates, including pinned and acknowledgement-required updates |

A Home manager or Regional manager title alone does not enable Command Center administration. Current administrative checks require provider-wide org.manage, even if the person has home-scoped staff.manage or messaging.groups.manage.

Staff cannot create personal tasks through an ordinary-staff endpoint. Their calendar response reports canReschedule: false; administrative event rescheduling uses the admin route. Clock-out saves a timesheet record directly; there is no separate timesheet submit/approve permission or endpoint. These are current backend rules, not proposed future features.

## 6. Messaging access and content privacy

Regular messaging requires messaging.use. Additional sending capabilities use the corresponding attachment, voice-note, calls, group-creation, priority or announcement permission. Provider policy may disable a feature even when its permission is present.

Conversation membership and history visibility control ordinary message reads. Creating a group makes the creator its owner. A group owner can manage that group's membership under the group rules; a permitted manager can manage a home-linked group within their home scope. These conversation roles are separate from organisation roles.

| Conversation role | Meaning |
| --- | --- |
| Owner | Can perform the group's ownership and membership operations permitted by group policy |
| Member | Can participate according to the conversation's rules; membership alone does not grant ownership |

Edits/deletes require authorship and applicable message rules. Replies, reactions and forwarding require access to the relevant messages/conversations. Forwarded files must pass file-access checks. Personal inbox controls such as pin, save, mute and snooze apply to the caller's own state.

Messaging administration and reading private content are separate permissions:

- messaging.admin enables administrative group/membership/ownership operations; it does not itself grant private message content access.
- messaging.content.access enables opening an audited, time-limited content-access grant for a recorded reason, then reading through its administrative content routes.
- messaging.export enables the separate audited export operation for a recorded reason and scope.
- messaging.legal_hold.manage enables placing/releasing retention holds. A legal hold preserves data; it is not an ordinary conversation membership grant.

## 7. Notifications and files

Notification inbox and preference routes are staff-only and operate on the signed-in person's own records. There are no separate notifications.read, notifications.manage or notifications.admin permission keys in the catalogue. Being an administrator does not make another person's notification inbox your own inbox. Opening a notification destination still requires access to its source record.

There is no general files.admin permission in the catalogue. File access follows ownership, purpose and resource access, including conversation membership, assigned tasks, home membership and restricted-resource recipients. The ability to manage organisation metadata does not create unrestricted file access. Messaging attachment/voice-note permissions control their specific send workflows.

## 8. Platform roles, support and service identities

These are separate from staff roles. A platform account does not automatically become an organisation staff member.

| Platform role | Implemented authority |
| --- | --- |
| platform_admin | List/create/update providers, manage platform users, list available support grants and start an eligible grant-backed support session |
| platform_support | List providers, list available support grants and start an eligible grant-backed support session; cannot create/update providers or manage platform users through the admin-only routes |

Provider updates include status and licensed module changes. A plain platform token has no provider context and is rejected by ordinary staff/support routes. A support session has a specific provider context and only the permissions approved by that provider.

### Provider-authorised support grants

A provider caller with support.grants.manage can create, list and revoke grants. Creation requires a reason and an expiry of 1–72 hours; a grant may be restricted to a named platform user and include a ticket reference. Revocation ends its support sessions. Starting a session checks that the grant is active, unexpired and available to that platform user.

Only these 6 permissions are grantable to support:

- `directory.view`
- `directory.view_all`
- `staff.view`
- `messaging.admin`
- `messaging.content.access`
- `audit.view`

Support sessions cannot use staff-only Command Center or notification-inbox routes even if they hold a permission used elsewhere. Administrative content reads still use their audited content-access workflow.

### Backend service identities

A service token represents a backend service rather than a staff member or platform administrator. Internal routes explicitly accept service callers. Service clients authenticate with Identity using SERVICE_NAME and SERVICE_CLIENT_SECRET; each credential must match its entry in SERVICE_CLIENTS. For example, Command Center's deployment credential is COMMANDCENTER_CLIENT_SECRET, mapped to SERVICE_CLIENT_SECRET at runtime. These credentials are separate from user roles, staff tokens and login codes.

## 9. Role administration API

Paths below include the gateway prefix. Use a bearer access token. Provider endpoints operate within the token's provider context.

| Method and path | Requirement / behaviour |
| --- | --- |
| GET /api/identity/permissions | Authenticated provider caller; returns the permission catalogue with descriptions and scopes |
| GET /api/identity/roles | Authenticated provider caller; returns current organisation roles, permission lists, system flag and assigned counts |
| POST /api/identity/roles | roles.manage; create a custom role using known permission keys |
| PATCH /api/identity/roles/{id} | roles.manage; edit a role's name, description or permission list |
| DELETE /api/identity/roles/{id} | roles.manage; custom role must be unassigned; default/system roles cannot be deleted |
| GET /api/identity/staff | staff.view, with provider/home scope checks |
| POST /api/identity/staff | staff.manage, with home and role-assignment checks |
| PATCH /api/identity/staff/{id} | staff.manage, with staff scope checks |
| PUT /api/identity/staff/{id}/homes | staff.manage, with permitted-home checks |
| PUT /api/identity/staff/{id}/teams | staff.manage, with membership/scope checks |
| PUT /api/identity/staff/{id}/roles | staff.manage plus role-assignment authority; replaces the assignment list |
| GET /api/identity/auth/me | Current profile, assignments, effective permissions and modules for the signed-in staff member |
| POST /api/identity/auth/refresh | Refreshes an existing session and returns current effective access |
| GET/POST /api/identity/support-grants | support.grants.manage |
| POST /api/identity/support-grants/{id}/revoke | support.grants.manage |

Default roles can be edited but not deleted. Custom role keys must match lower_snake_case with 2–63 characters, starting with a letter. Unknown permission keys are rejected. A permission-list update replaces that list; include every permission the role should retain.

### Assigning roles safely

Fetch the target's current assignments and the organisation's role IDs first. The assignment endpoint expects **role UUIDs**, not role keys. To assign a role provider-wide, omit homeId. To scope it to a home, supply that home's UUID.

Example body for PUT /api/identity/staff/{id}/roles:

```json
{
  "roles": [
    { "roleId": "CARE_STAFF_ROLE_UUID" },
    { "roleId": "HOME_MANAGER_ROLE_UUID", "homeId": "OAK_HOUSE_UUID" }
  ]
}
```

Replace placeholders with real UUIDs. This request replaces all assignments, so include any existing ones that should remain. Staff home/team membership is managed separately; assigning a role does not automatically join the staff member to that home or team.

The backend checks added **and removed** roles. A caller without provider-wide roles.manage cannot grant or remove effective permissions they do not hold at the relevant scope. Home managers also face restrictions when changing people, memberships or roles outside their managed homes; staff working across homes cannot simply be deactivated from an unrelated scope.

## 10. Frontend integration and access changes

Use /api/identity/auth/me for effective permissions and /api/identity/roles for the configured role definitions. Do not infer authority from a displayed job title, email address, seeded account name or role key alone.

The current staff me response represents permissions as a scope map: '*' contains provider-wide/personal grants and home UUID keys contain home-scoped grants. Backend principals internally represent the same data as permissions.provider and permissions.homes. Token claims also use the compact scope map. Check the actual response shape when integrating rather than assuming these representations are interchangeable.

When roles or memberships change, Identity bumps the staff member's authorisation version. An old access token is rejected as TOKEN_STALE and must be refreshed to pick up current permissions. Revoked sessions and deactivated accounts are also checked before token expiry. Removing a role is not delayed until a three-day access token naturally expires.

Show controls based on effective permissions, scope and source-specific capability fields, while still handling backend 403/404 responses. For example, org.manage must be provider-wide for Command Center administration; the existence of any home-scoped permission is insufficient. Conversation owners may have controls that ordinary members lack even when their organisation roles match.

Common access failures include missing permissions, out-of-scope staff/home access, disallowed principal type, disabled messaging module, stale tokens, invalid support grants, inactive assignments and missing conversation membership. A filtered 404 may deliberately avoid exposing a resource outside the caller's scope.

## 11. Source references

- [Permission catalogue, default templates, platform roles and support allowlist](../packages/contracts/src/permissions.ts)
- [Scope helpers and caller types](../packages/contracts/src/auth.ts)
- [Effective role aggregation](../services/identity/src/authz/access.service.ts)
- [Global HTTP authorisation guard](../packages/common/src/auth/auth.guard.ts)
- [Role administration](../services/identity/src/roles/roles.service.ts)
- [Role assignment authority](../services/identity/src/authz/assignment-guard.ts)
- [Staff membership and role changes](../services/identity/src/staff/staff.service.ts)
- [Platform routes](../services/identity/src/platform/platform.controller.ts)
- [Provider support grants](../services/identity/src/support/support-grants.service.ts)
- [Command Center rules](../services/commandcenter/src/service.ts)
- [Messaging administration](../services/messaging/src/admin/admin.controller.ts)
- [Demo workforce accounts](demo-workforce.md)
