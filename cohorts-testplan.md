# Cohorts Feature — QA Test Plan
 
**Scope:** End-to-end testing of the Cohort Groups module across Backend (`budgetnista-be`), Admin FE (`budgetnista-admin-fe`), and Learner FE (`budgetnista-learner-fe`).
**Author:** QA
**Execution method:** Phase-wise, Playwright MCP (UI) + manual/API checks (backend jobs, notifications).
**Last updated:** 2026-06-25
 
---
 
## 0. Test Strategy
 
### 0.1 Test types
- **UI (Playwright):** Admin + Learner browser flows.
- **API/Manual:** Celery jobs (`create_weekly_cohorts`, `propose_solo_merges`), `backfill_cohorts` command, notification fan-out, DB-constraint behaviour.
- **Negative/Edge:** Permission gates, 404 leaks, optimistic-lock 409s, idempotency.
 
### 0.2 Environments & URLs
| Component | URL | Notes |
|---|---|---|
| Backend API | https://budgetnista-be-production.up.railway.app | Django + DRF; `/api/v1/admin/` prefix |
| Admin FE | https://admin.dev.budgetnista-admin.qilinlab.com | Login: superadmin@yopmail.com / Admin@123 |
| Learner FE | https://learner.dev.budgetnista.qilinlab.com | Login: sundar@qilinlab.com / 7708278760sS@ |
| Redis | localhost:6379 | throttle + cache + celery broker |
 
### 0.3 Test accounts (provision before run)
| Role | Purpose |
|---|---|
| `super_admin` | All admin cohort management + flags |
| `org_admin` | Negative: must NOT see/reach `/cohorts` |
| `div_admin` | Negative: must NOT see/reach `/cohorts` |
| `instructor` | Negative: must NOT reach cohort admin |
| `learner A` (org X) | Member of a multi-person cohort |
| `learner B` (org X) | Same cohort as A (discussion peer) |
| `learner C` (org Y) | Solo / proximity candidate |
| `learner D` (B2C, org NULL) | B2C cohort path |
| `suspended learner` | Moderation suspension gate |
 
### 0.4 Test data prerequisites
- ≥1 **published** course with `cohorts_enabled=True`.
- Enrolments spread across **multiple ISO weeks** and **multiple orgs** (to exercise auto, solo, proximity, B2C-NULL).
- At least one course with **past enrolments** (for `backfill_cohorts`).
- Ability to run management commands / trigger Celery tasks on demand.
 
### 0.5 Entry / Exit criteria
- **Entry:** all three servers up, Redis up, Celery worker+beat up, test accounts + seed data ready.
- **Exit:** all P0/P1 cases Pass; no open Sev-1/Sev-2 defects; backend constraints verified.
 
### 0.6 Severity / Priority legend
- **P0** = blocker (core flow), **P1** = high, **P2** = medium, **P3** = low/cosmetic.
 
---
 
## PHASE 1 — Course-Level Cohort Configuration (Admin)
 
> Pre: logged in as super_admin. Page: `/courses/[courseId]/settings` → "Group learners into cohorts".
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P1-01 | Cohorts disabled by default | P1 | Open a course never configured for cohorts | Toggle is OFF; no duration/threshold inputs visible |
| P1-02 | Enable cohorts | P0 | Toggle ON | `PATCH /admin/courses/{id}/ {cohorts_enabled:true}`; two inputs appear (length weeks, solo-merge window days) |
| P1-03 | Set cohort length | P1 | Enter 6 in "Cohort length (weeks)", blur | Auto-saves `cohort_duration_weeks:6`; persists on reload |
| P1-04 | Set proximity threshold | P1 | Enter 14 in "Solo-merge window (days)", blur | Auto-saves `cohort_proximity_threshold_days:14` |
| P1-05 | Length bounds | P2 | Enter 0 / 53 | Rejected/clamped to 1–52 |
| P1-06 | Threshold bounds | P2 | Enter 0 / 91 | Rejected/clamped to 1–90 |
| P1-07 | Disable cohorts | P2 | Toggle OFF | `cohorts_enabled:false`; inputs hide; existing cohorts untouched |
 
---
 
## PHASE 2 — Cohort Formation (Backend job / backfill)
 
> Executed via Celery / management command, verified in DB + Admin FE list.
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P2-01 | Weekly job — ≥2 enrolments same (course,org,week) | P0 | Seed 3 enrolments same closed week; run `create_weekly_cohorts` | 1 AUTO cohort created; 3 memberships `source=auto state=active`; `member_count=3` |
| P2-02 | Weekly job — open week skipped | P0 | Enrol in current (open) ISO week; run job | No cohort yet (only closed weeks processed) |
| P2-03 | Solo fallback | P0 | 1 enrolment in an isolated week (no adjacent cohort); run job | SOLO cohort (origin=solo); 1 membership; **SOLO flag** raised (OPEN) |
| P2-04 | Proximity assign — within threshold | P0 | 1 enrolment within `threshold` days of an existing cohort boundary; run job | Learner joins adjacent cohort; membership `source=proximity`, state `early`/`late`; **PROXIMITY flag** raised |
| P2-05 | Proximity — outside threshold | P1 | 1 enrolment > threshold days from any cohort | Falls back to SOLO (P2-03 behaviour) |
| P2-06 | Proximity tie-break | P2 | Equidistant prev vs upcoming | Upcoming wins; state=early |
| P2-07 | Same-week late join (no flag) | P1 | New enrolment in a week that already has a real cohort | Joins it, state=active, **no flag** |
| P2-08 | Org scoping | P0 | Enrolments same week, different orgs | Separate cohort per org |
| P2-09 | B2C / NULL org | P1 | B2C learner (org NULL), ≥2 same week | Cohort with `organisation=NULL` formed |
| P2-10 | Idempotency | P0 | Run `create_weekly_cohorts` twice | 2nd run assigns nobody new; no duplicate cohorts/memberships |
| P2-11 | Week-year boundary | P2 | Enrol 2025-12-29..31 (ISO 2026-W01) | Grouped into iso_year=2026, iso_week=1 |
| P2-12 | AUTO unique constraint | P1 | Force re-run after manual edits | No 2nd AUTO cohort for same (course,org,week) |
| P2-13 | `backfill_cohorts --dry-run` | P1 | Run dry-run on course w/ past enrolments | Reports planned cohorts; **no DB writes**; no notifications |
| P2-14 | `backfill_cohorts` (real) | P1 | Run without --notify | Cohorts created oldest→newest; notifications **suppressed** |
| P2-15 | `backfill_cohorts --notify` | P2 | Run with --notify | COHORT_ASSIGNED notifications sent |
| P2-16 | `propose_solo_merges` — adjacent solos | P0 | Two SOLO cohorts exactly 7 days apart, same (course,org); run job | MERGE_PROPOSAL flag on earlier cohort; both SOLO flags resolved `merge_proposed` |
| P2-17 | `propose_solo_merges` — non-adjacent | P1 | Two solos >7 days apart | No proposal |
| P2-18 | `propose_solo_merges` idempotent | P1 | Run twice | No duplicate MERGE_PROPOSAL |
 
---
 
## PHASE 3 — Admin: Cohort List & Filtering
 
> Page: `/cohorts` (Cohorts tab). Navigate via sidebar: **Community → Cohorts** (Community group must be expanded).
 
**Confirmed column headers (live):** NAME, COURSE, ORG, ISO WEEK, DATE RANGE, MEMBERS, STATUS, ORIGIN
 
**Confirmed filter controls (live — 5 total):** "Search cohort name…" (text), "All courses" (dropdown), "All organisations" (dropdown), "All statuses" (dropdown), "All origins" (dropdown)
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P3-01 | List renders | P0 | Expand "Community" in sidebar → click "Cohorts" | 5 filter controls visible (search + 4 dropdowns); count label "N cohorts"; Cohorts/Flags tabs visible |
| P3-01b | Column headers visible with data | P0 | Open /cohorts when cohorts exist | Columns: NAME, COURSE, ORG, ISO WEEK, DATE RANGE, MEMBERS, STATUS, ORIGIN |
| P3-02 | Search by name | P1 | Type cohort name (debounced) | Filtered rows |
| P3-03 | Filter by course | P1 | Select course | Only that course's cohorts |
| P3-04 | Filter by organisation | P1 | Select org | Org-scoped rows |
| P3-05 | Filter by status | P1 | Upcoming/Active/Completed/Archived | Correct subset; badges colour-coded |
| P3-06 | Filter by origin | P2 | Auto/Manual/Solo | Correct subset |
| P3-07 | Clear filters | P2 | Click clear | All cohorts return |
| P3-08 | Pagination | P2 | >20 cohorts | 20/page; navigate pages |
| P3-09 | Empty state | P2 | No cohorts configured yet | "No cohorts yet" icon + "Turn on cohorts for a course in Course → Settings → Cohorts. The weekly job then groups each week's enrolments into a cohort every Monday." |
| P3-10 | Row → detail | P0 | Click row | Navigate `/cohorts/{id}`; detail header shows "Week {N} — {Course Name}" |
 
---
 
## PHASE 4 — Admin: Cohort Detail + Edit + Optimistic Lock
 
> Page: `/cohorts/[cohortId]` → Manage menu → Edit cohort.
 
**Confirmed Manage menu options (live):** Edit cohort | Merge a cohort in… | Split cohort… | Delete cohort (red/destructive)
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P4-01 | Detail masthead | P0 | Open detail | Name, status, origin, course, org, week, member count; Members + Activity tabs |
| P4-02 | Rename | P0 | Edit name, save | `PATCH` name only (dirty-field); list+detail update; audit `renamed` |
| P4-03 | Shift dates | P0 | Change start/end, save | Dates update; audit `dates_changed`; members notified (COHORT_DATES_CHANGED) |
| P4-04 | end < start | P2 | Set end before start | 400; CheckConstraint enforced |
| P4-05 | Past end_date guard | P1 | Set end_date in past | 400 past_end_date → "Apply anyway" re-submits `force:true` |
| P4-06 | Dirty-field rename-only | P1 | Rename only on a cohort with past end | No past_end_date trip (only name sent) |
| P4-07 | Optimistic lock 409 | P1 | Open Edit in two tabs, save in both | 2nd save → 409; "changed since opened" toast; refetch; sheet stays open |
 
---
 
## PHASE 5 — Admin: Member Management
 
> Detail → Members tab.
 
**Confirmed member table columns (live):** LEARNER, State (sortable), JOINED VIA, Progress (sortable), Joined (sortable)
**Add members button** visible top-right of Members tab.
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P5-01 | Roster renders | P0 | Open Members tab | Columns: LEARNER (avatar+name/email), State (sortable), JOINED VIA, Progress % (sortable), Joined (sortable); "Add members" button top-right; empty state: "No members in this cohort yet." |
| P5-02 | Add members (multi) | P0 | Add members → search → select 3 → submit | Fan-out `POST members/`; summary toast "Added N"; counts update |
| P5-03 | Add already-in-cohort | P1 | Add a learner already in a cohort | Tallied: "Added X · 1 already in a cohort" (409 handled) |
| P5-04 | Move member | P0 | Move member → pick dest (same course) | `POST move-member/`; member leaves source, joins dest; progress preserved; audit `member_moved`; COHORT_MOVED notif |
| P5-05 | Move scope | P1 | Open dest picker | Only same-course, non-source, non-archived cohorts listed |
| P5-06 | Remove member | P0 | Remove → confirm | `POST remove-member/`; row removed; member_count−1; progress preserved; audit `member_removed`; COHORT_REMOVED notif |
| P5-07 | One-cohort invariant | P0 | Add a learner to a 2nd cohort directly | 409 already_in_cohort (partial-unique enforced) |
| P5-08 | Soft-delete reuse | P1 | Remove then re-add same learner | Re-add succeeds (freed unique slot) |
 
---
 
## PHASE 6 — Admin: Merge & Split
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P6-01 | Merge scope | P1 | Manage → Merge a cohort in → open picker | Only same-course, same-org, non-archived sources |
| P6-02 | Merge happy path | P0 | Pick source, submit | Members move to dest; later end_date wins; source `archived`, `merged_into=dest`; audit `merged`; COHORT_MERGED notif to dest members |
| P6-03 | Merge optimistic lock | P1 | Stale dest | 409; "changed since opened"; refetch |
| P6-04 | Split happy path | P0 | Manage → Split → check subset → name → submit | New MANUAL cohort; subset moved; audit `split` |
| P6-05 | Split guard ≥1 each side | P1 | Select all / select none | Blocked (must leave ≥1 in source AND move ≥1) |
| P6-06 | Split optimistic lock | P2 | Stale | 409 handled |
 
---
 
## PHASE 7 — Admin: Delete
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P7-01 | Delete blocked (members) | P0 | Delete cohort w/ live members | 400 cohort_not_empty; inline "reassign/remove first"; dialog stays |
| P7-02 | Delete empty cohort | P1 | Remove all members → delete | 204; soft-deleted; redirect `/cohorts`; audit `deleted` |
| P7-03 | Create blocked | P1 | `POST /admin/cohorts/` directly | 405 Method Not Allowed (cohorts only from job/split) |
 
---
 
## PHASE 8 — Admin: Flags Queue
 
> Page: `/cohorts` (Flags tab). Depends on flags from Phase 2.
 
**Confirmed filter options (live):**
- Status: **Open** (default), Resolved, Dismissed, All statuses
- Kind: **All kinds** (default), Solo cohort, Proximity, Merge proposal
- Course: **All courses** (default), then individual courses
 
**Confirmed column headers (live):** FLAG, COURSE, ORGANISATION, LEARNER, Raised (sortable ↑↓), Status (sortable ↑↓)
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P8-01 | Queue renders | P0 | Open Flags tab | Columns: FLAG, COURSE, ORGANISATION, LEARNER, Raised (sortable), Status (sortable); 3 filter dropdowns (Status/Kind/Course); flag count in top-right |
| P8-02 | Filter by status | P1 | Open Status dropdown | Options: Open (default), Resolved, Dismissed, All statuses |
| P8-03 | Filter by kind | P1 | Open Kind dropdown | Options: All kinds (default), Solo cohort, Proximity, Merge proposal |
| P8-04 | Accept SOLO/PROXIMITY | P1 | Accept a non-merge flag | Acknowledged; status → resolved; assignment unchanged |
| P8-05 | Accept MERGE_PROPOSAL | P0 | Accept merge flag | Performs merge; resolution `merged`; toast "Cohorts merged"; secondary archived |
| P8-06 | Dismiss | P1 | Dismiss flag | status `dismissed`; only flags list invalidated |
| P8-07 | Override | P0 | Override → pick dest cohort | `POST override/`; learner reassigned membership `source=override is_override=true`; flag resolved `overridden`; audit `override_assignment` |
| P8-08 | Override scope | P1 | Open dest picker | Scoped to flag's course/org (BE re-enforces) |
| P8-09 | Flag-raised notification | P1 | Trigger any new flag | COHORT_FLAG_RAISED broadcast to all super_admins |
| P8-10 | One-open-flag-per-cohort | P2 | Re-run job producing same solo | No duplicate OPEN flag (partial-unique) |
| P8-11 | Empty state text | P2 | No flags match filter | "No flags match your filters. Nothing needs attention." |
 
---
 
## PHASE 9 — Admin: Audit Trail
 
> Detail → Activity tab.
 
**Confirmed Activity tab empty state (live):** "No activity yet." / "Admin actions on this cohort will appear here."
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P9-01 | Timeline renders | P1 | Open Activity | Each entry: action, actor email, before/after, timestamp; paginated. Empty state: "No activity yet." + "Admin actions on this cohort will appear here." |
| P9-02 | All verbs captured | P1 | After Phases 4–8 actions | created, renamed, dates_changed, member_added/removed/moved, merged, split, override_assignment present |
| P9-03 | System actor null | P2 | Job-created cohort | actor null / system; renders gracefully |
| P9-04 | Read-only | P3 | Inspect | No mutating controls |
 
---
 
## PHASE 10 — Learner: My Cohorts / Groups Tab
 
> Learner FE. Page: `/community?tab=groups`.
 
**Important — Learner portal login (confirmed live):** Login is **2-step with email OTP**. After entering credentials the portal redirects to `/verify-email?email=...` requiring a 6-digit code. All `/community/*` routes redirect to `/verify-email` if the OTP step is not completed. Automated Playwright testing of the learner cohort UI requires either a real OTP, a backend bypass flag, or a seeded session.
 
**Confirmed Community page structure (live):**
- URL: `/community`
- Heading: "Community"
- Subtitle: "Connect with fellow learners through forums and groups"
- **Tabs: Forums | Groups | Challenges** (there is NO standalone "Cohorts" tab — cohorts surface inside the **Groups** tab)
- Groups tab → calls `GET /api/v1/cohorts/me/` to fetch learner's cohorts
- Sidebar navigation under Community: Discussion Forum, Messages


 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P10-01 | Groups list | P0 | Open Groups tab (member of ≥1) | `GET /cohorts/me/`; cohort cards (name, status chip, member count, peers strip) |
| P10-02 | Empty state | P1 | Learner in no cohort | "No cohort groups yet" copy; no CTA |
| P10-03 | Open detail | P0 | Click card | Navigate `/community/cohorts/{id}` |
| P10-04 | My-courses chip | P2 | My Courses page | "In a cohort" chip on cohort-enabled course cards |
 
---
 
## PHASE 11 — Learner: Cohort Detail Page
 
> Page: `/community/cohorts/[cohortId]`.
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P11-01 | Detail renders | P0 | Open as member | Hero (name/status/count), progress distribution stacked bar, average, members roster w/ progress |
| P11-02 | Non-member 404 | P0 | Open a cohort you're not in | "Cohort not found" card (no existence leak) |
| P11-03 | Members ordering | P2 | Inspect roster | Ordered by progress desc; self marked is_me |
| P11-04 | Solo cohort copy | P2 | Open solo cohort | "You're the first here — peers join as they enrol this week." |
| P11-05 | Peer profile | P1 | Click peer | Peer-profile dialog opens; "Message" CTA |
| P11-06 | Start Discussion CTA | P1 | Click CTA | Navigate to `/discussion` |
 
---
 
## PHASE 12 — Learner: Cohort Discussion
 
> Page: `/community/cohorts/[cohortId]/discussion`.
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P12-01 | Empty thread | P1 | Open w/ no messages | "No messages yet. Start the conversation…" |
| P12-02 | Post message | P0 | Type + Send (or Ctrl+Enter) | `POST messages/`; appears oldest→newest above composer; thread invalidates |
| P12-03 | Reply (single-level) | P0 | Reply on a top-level msg | `POST messages/ {parent}`; nested under parent; reply on a reply not offered |
| P12-04 | Reply notification | P1 | B replies to A's message | A receives COHORT_DISCUSSION_REPLY |
| P12-05 | Like toggle | P1 | Click like, click again | `POST like/`; count up then down; is_liked toggles; silent (no toast) |
| P12-06 | Delete own | P1 | Delete own message | `DELETE messages/{id}`; tombstone "[deleted]"; no actions on it |
| P12-07 | Cannot delete others' | P1 | Inspect others' message | No trash icon (author/super_admin only) |
| P12-08 | Polling | P2 | B posts; A's open thread | A sees it within ~10s (refetchInterval) |
| P12-09 | Body sanitisation | P2 | Post zero-width/control chars | Rejected/stripped |
| P12-10 | Throttle | P2 | Post >20 msgs/min | Throttled (Redis 20/min/user+cohort) |
| P12-11 | Non-member post blocked | P1 | Non-member POSTs to thread | 403/404 |
 
---
 
## PHASE 13 — Learner: In-Player Cohort Tab
 
> `/learn/[courseSlug]/...` lesson player tabs.
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P13-01 | Tab visibility | P1 | Open lesson in cohort-enabled course (member) | "Cohort" tab present w/ member-count chip (`useMyCohort` truthy) |
| P13-02 | Tab hidden | P1 | Open lesson, not in a cohort | No Cohort tab |
| P13-03 | In-context thread | P1 | Open Cohort tab | Header (name/status) + thread; reply/like/report work |
| P13-04 | Jump to full page | P2 | Click "View cohort →" | Navigate `/community/cohorts/{id}` |
 
---
 
## PHASE 14 — Learner: Find Members / Peer Profile / Message
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P14-01 | Search ≥2 chars | P1 | Type 2+ chars in Find Members | `GET /dm/users/?search=`; role/org-scoped results |
| P14-02 | Too-short hint | P3 | Type 1 char | "Keep typing — at least 2 characters" |
| P14-03 | No results | P3 | Garbage query | "No members match …" |
| P14-04 | Open profile | P1 | Click result | Peer-profile dialog |
| P14-05 | Message peer | P2 | "Message" in dialog | Routes to `/messages` pre-addressed |
 
---
 
## PHASE 15 — Moderation: Suspension & Reporting
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P15-01 | Suspended composer | P0 | Suspended learner opens discussion | `useMyModerationStatus` suspended → SuspensionBanner replaces composer; history visible |
| P15-02 | Suspended can still read/like | P2 | Suspended learner likes a msg | Allowed (suspension blocks posting only) |
| P15-03 | Report message | P1 | Flag others' message → reason → submit | `POST /moderation/reports/ {source:"cohort_message"}`; success toast |
| P15-04 | Duplicate report | P2 | Report same message twice | 400 "already reported" surfaces as toast |
| P15-05 | Report → moderation queue | P1 | Check moderation admin queue | Cohort report appears in unified queue |
| P15-06 | Suspended can report | P2 | Suspended learner reports | Allowed |
 
---
 
## PHASE 16 — Notifications (cross-cutting)
 
> Verify recipient + context for each event (in-app + any channels enabled).
 
| ID | Event | Trigger | Recipient |
|---|---|---|---|
| P16-01 | COHORT_ASSIGNED | Member added (job/admin) | The learner |
| P16-02 | COHORT_MOVED | move-member | The moved learner |
| P16-03 | COHORT_REMOVED | remove-member | The removed learner |
| P16-04 | COHORT_MERGED | merge | All dest members |
| P16-05 | COHORT_DATES_CHANGED | edit dates | All members |
| P16-06 | COHORT_FLAG_RAISED | any flag | All super_admins |
| P16-07 | COHORT_DISCUSSION_REPLY | reply to a message | Parent author |
| P16-08 | Suppression | `backfill_cohorts` (no --notify) | No retroactive spam |
 
---
 
## PHASE 17 — Permissions / RBAC
 
> **Important:** "Cohorts" is nested under the "Community" sidebar group (alongside Forums and Moderation). The Community group must be expanded to reveal Cohorts. super_admin sees Community → Cohorts; lower roles should not see the Community/Cohorts nav items.
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P17-01 | Nav gating | P0 | Login org_admin/div_admin/instructor → expand Community (if visible) | No "Cohorts" item under Community (or Community group itself hidden) |
| P17-02 | Direct URL guard | P0 | org_admin opens `/cohorts` directly | Access denied / redirected (not super_admin) |
| P17-03 | Admin API guard | P0 | Non-admin calls `/admin/cohorts/` | 403 IsPlatformAdmin |
| P17-04 | Learner membership gate | P0 | Learner GETs a cohort they're not in | 404 (no existence leak) |
| P17-05 | Unauth redirect | P1 | Logged-out opens `/cohorts` | Redirect `/login` |
| P17-06 | Learner blocked from admin FE | P1 | learner logs into admin FE | 401 "not authorized for admin console" |
 
---
 
## PHASE 18 — Cross-Cutting: Concurrency, Soft-Delete, Idempotency
 
| ID | Title | Priority | Steps | Expected |
|---|---|---|---|---|
| P18-01 | Optimistic lock (all mutations) | P1 | Stale `expected_modified_date` on edit/merge/split/delete | 409 CohortConflict |
| P18-02 | Weekly job select_for_update | P2 | Concurrent/retried job runs | No duplicate AUTO cohort |
| P18-03 | Soft-delete cohort survives audit | P2 | Merge → inspect source | Archived row + history retained, `merged_into` set |
| P18-04 | Removed membership frees slot | P1 | Remove → re-add | Succeeds (live partial-unique only) |
| P18-05 | Progress preserved | P0 | Move/merge/remove | Enrollment progress unchanged throughout |
 
---
 
## Defect log (fill during execution)
| ID | Phase/Case | Severity | Description | Status |
|---|---|---|---|---|
| | | | | |
 
## Run summary (fill during execution)
| Phase | Total | Pass | Fail | Blocked | Notes |
|---|---|---|---|---|---|
| | | | | | |
 