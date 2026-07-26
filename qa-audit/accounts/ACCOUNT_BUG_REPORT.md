# Account bug report

## AQ-001 — Join-code staff privilege escalation

- Severity: Critical
- Affected: every ordinary account joining by code.
- Reproduce: call `/api/teams/join` with a valid code and `position: "Head Coach"`.
- Expected: server assigns only the role permitted by account/player relationship.
- Actual: client position was trusted; staff checks later treated it as authority.
- Impact: team-local vertical privilege escalation.
- Root cause: authorization attribute accepted from request body.
- Fix: server derives Parent, Player, or Member; request position is ignored.
- Regression: `tests/account-membership-policy.test.mjs`.
- Status: Fixed.

## AQ-002 — Removed and youth-linked membership resolution

- Severity: High
- Affected: removed members and invited youth players.
- Actual: removed direct documents could retain access; youth documents keyed by player ID could lose access.
- Root cause: membership helper checked only document existence at UID.
- Fix: active-state checks plus linked-player resolution in rules and server team access.
- Regression: linked youth/removed emulator test.
- Status: Fixed.

## AQ-003 — Cross-team chat membership lookup

- Severity: High
- Affected: users with membership in any team.
- Actual: message API accepted an active membership found by collection-group query without proving it belonged to the requested team.
- Impact: cross-team message attempt.
- Fix: lookup is scoped to requested team; chat rules explicitly exclude compatibility fallback.
- Regression: chat impersonation and removed-member tests.
- Status: Fixed.

## AQ-004 — Email verification absent from tenant/API boundary

- Severity: High
- Affected: new email/password accounts.
- Actual: signup entered tenant/checkout flows without verified email; APIs and rules did not reject unverified tokens.
- Fix: verification page/resend/check flow; API token check; Firestore and Storage verified/active gates; verified-email-change flow.
- Regression: account authentication plus emulator tests.
- Status: Fixed; provider link expiry/reuse remains manual.

## AQ-005 — Alert badge/inbox audience mismatch

- Severity: High
- Affected: all roles receiving team alerts.
- Actual: the badge could count alerts that the inbox filtered out, producing a count with empty history.
- Root cause: different audience/target logic between count and inbox, compounded by a broad team rules fallback.
- Fix: shared recipient predicate and explicit alert audience/target rules; fallback cannot broaden alerts.
- Regression: `tests/alert-audience.test.mjs` and team alert emulator test.
- Status: Fixed.

## AQ-006 — Team and league plan limits were client-only

- Severity: Critical
- Affected: free, expired, past-due, canceled, and paid owners.
- Reproduce: create `/teams` or `/leagues` directly after the UI cap is reached.
- Actual: Firestore accepted browser creates.
- Impact: subscription bypass and unbounded tenant creation.
- Fix: authenticated server creation endpoints atomically read trusted profile capacity and current count; direct browser creation denied. Only active/trialing paid state receives paid capacity.
- Regression: account creation policy tests and direct Firestore creation denials.
- Status: Fixed.

## AQ-007 — Global league invite email leakage and broken writer

- Severity: High
- Affected: signed-in users and league organizers.
- Actual: legacy global invite records containing recipient emails were readable by any signed-in user, while ordinary organizer writes were denied.
- Fix: legacy path is superadmin-only; new organizer invite writes use the creator-scoped league subcollection.
- Regression: legacy invite PII emulator test.
- Status: Fixed; end-to-end email delivery/acceptance is manual.

## AQ-008 — Club owner field mismatch

- Severity: Medium
- Affected: club/school owners using records with `ownerUserId`.
- Actual: rules recognized only legacy `ownerId`.
- Fix: owner-scoped rules accept either stored schema while retaining exact-UID isolation.
- Regression: club owner/outsider emulator assertions.
- Status: Fixed.

## AQ-009 — Non-owner staff UI/backend permission mismatch

- Severity: High (functional)
- Affected: assistant coach, manager, team staff, delegated school administrator.
- Reproduce: sign in as an active staff member who is not the team owner and use member, schedule, score, drill, document, alert, or chat administration UI.
- Expected: supported staff duties work according to product UI.
- Actual: many Firestore writes require primary team ownership.
- Security impact: fail-closed; no unauthorized access was observed.
- User impact: supported staff workflows can fail with permission denied.
- Root cause: UI `isStaff` model is broader than backend owner-only model.
- Fix: not changed without an approved product permission specification; broadening rules speculatively would create privilege risk.
- Status: Unresolved release blocker.

## AQ-010 — Tournament plan limit policy not authoritative

- Severity: High (subscription policy)
- Affected: tournament organizers/all authenticated roles.
- Actual: creator identity is enforced, but no repository-backed server plan/cap policy exists for tournament hub creation.
- Impact: the audit cannot prove tournament entitlement/limit compliance.
- Fix: requires product decision defining eligible plans and capacity, then server-mediated creation.
- Status: Unresolved release blocker.

## AQ-011 — Protected page routing is client-gated

- Severity: Medium
- Affected: protected and admin pages.
- Actual: direct navigation can receive the application shell; data and mutations fail at rules/APIs, and client guards redirect/deny.
- Expected by audit brief: server-side route rejection and secure cookie session.
- Security impact: no private data bypass confirmed, but route existence and static UI may be exposed.
- Fix: migrate to a server-verifiable session-cookie/middleware model.
- Status: Unresolved condition.

## AQ-012 — Full identity-provider lifecycle not executable locally

- Severity: Medium/verification condition
- Affected: OAuth, reset links, verification links, multi-device revocation.
- Actual: provider-backed expiry/reuse/rate-limit behavior cannot be proven by static review or rules emulator.
- Fix: execute Preview matrix using isolated Firebase identities.
- Status: Blocked manual verification.

## Changed implementation areas

Authentication and verification, API token checks, Firestore/Storage account gates, membership policy, team join/chat, youth/league invitations, server-mediated team/league creation, settings email verification, alert authorization, and regression tests.
