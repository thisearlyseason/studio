# Account release checklist

## Status

**READY WITH CONDITIONS**

All confirmed critical/high account-security and authorization defects found in this audit are fixed and locally verified. Production approval remains conditional on the required Vercel Preview identity-provider and Stripe test-mode run, plus an explicit rollout decision for existing unverified accounts.

## Completed

- [x] Actual global roles, team positions, states, login methods, plans, and billing states inventoried.
- [x] New profile writes cannot set role/plan/Stripe/admin fields.
- [x] Email/password signup sends verification before tenant/join/checkout work.
- [x] Unverified, suspended, removed, and deletion-pending identities fail closed.
- [x] API tokens are signature-, expiry-, and revocation-verified.
- [x] Login errors do not intentionally enumerate email existence.
- [x] Email change uses verify-before-update.
- [x] Join payload cannot grant a staff position.
- [x] Youth linked membership and removed membership are handled.
- [x] Team chat request is target-team scoped.
- [x] Team alert badge/inbox use one audience predicate and rules enforce it.
- [x] Team, league, club, player, subscription, facility, admin, and storage isolation tests pass.
- [x] Team/league creation limits are enforced by trusted server state.
- [x] Legacy global league invitation PII is admin-only.
- [x] Account deletion immediately disables/revokes and has purge regression coverage.
- [x] Delegated staff can operate team workflows without promoting roles, changing billing, or modifying the owner.
- [x] Supported tournaments remain team-scoped; unsupported root tournament tenant writes are closed.
- [x] Protected direct URLs require revocation-checked HTTP-only server sessions.
- [x] Signup requires matching password confirmation and accurately describes verification-before-payment.
- [x] Local desktop/tablet/mobile landing checks have no horizontal overflow; mobile login/signup and direct-route behavior were browser-verified.
- [x] TypeScript, lint (warnings only), unit, emulator rules, Next production build, and Functions build pass.

## Deployment conditions

- [ ] Run the Vercel Preview test matrix against isolated Firebase identities and Stripe test mode.
- [ ] Define rollout behavior for pre-existing accounts whose Firebase email is currently unverified.

## Manual Preview scenarios (30)

- [ ] M-01 valid email/password registration and duplicate-submit/slow-network behavior.
- [ ] M-02 duplicate/case/space/Unicode/long-input registration.
- [ ] M-03 Google OAuth new/existing/cross-provider login.
- [ ] M-04 verification valid/expired/reused/modified/cross-browser links and resend throttling.
- [ ] M-05 password reset valid/expired/reused/modified/unknown-email lifecycle.
- [ ] M-06 logout, refresh, expired and revoked session.
- [ ] M-07 password/email change invalidates or refreshes other-device sessions as intended.
- [ ] M-08 suspended/disabled/deletion-pending active browser session.
- [ ] M-09 new/existing/wrong-account/forwarded team invitation.
- [ ] M-10 duplicate/expired/canceled/reused invitation and inviter permission loss.
- [ ] M-11 league invitation delivery, removal, resend, acceptance, and deep link.
- [ ] M-12 tournament and school invitation flows after their policy is defined.
- [ ] M-13 parent/guardian complete child and team workflow.
- [ ] M-14 adult player complete workflow.
- [ ] M-15 invited youth complete workflow.
- [ ] M-16 coach owner complete workflow.
- [ ] M-17 assistant coach/manager complete Preview workflow (automated authority matrix passes).
- [ ] M-18 school owner and delegated administrator complete workflow.
- [ ] M-19 league creator and tournament creator complete workflow.
- [ ] M-20 multi-organization/team switching, refresh, history, and simultaneous tabs.
- [ ] M-21 desktop, tablet, and mobile navigation/direct deep links for each role.
- [ ] M-22 upload/download/delete media across two tenants.
- [ ] M-23 notification/email recipient, preference, duplicate, history, and removed-user checks.
- [ ] M-24 billing owner vs non-owner direct URL/API controls.
- [ ] M-25 superadmin routes, APIs, audit logs, and destructive confirmations.
- [ ] M-26 Stripe test-mode checkout, monthly/annual upgrade and trial.
- [ ] M-27 Stripe test-mode downgrade, past-due, cancellation, payment failure, and stale session.
- [ ] M-28 owner, ordinary user, and child-linked account deletion/cancel deletion.
- [ ] M-29 seven-day purge dry run in disposable data and recreation using the same email.
- [ ] M-30 two anonymous demo sessions, no external messaging/billing, and reset behavior.

## Final metrics

| Metric | Result |
|---|---:|
| Account types found | 8 (7 role-backed types plus demo) |
| Global roles found | 7 |
| Subscription plans found | 5 |
| Account/billing states represented in automated policy tests | 14 |
| Focused account tests | 41 |
| Focused tests passed | 41 |
| Focused tests failed | 0 |
| Manual scenarios blocked/pending | 30 |
| Full unit + rules tests | 159 passed, 0 failed |
| Critical bugs found/fixed/unresolved | 2 / 2 / 0 |
| High bugs found/fixed/unresolved | 7 / 7 / 0 |
| Medium bugs found/fixed/unresolved | 3 / 2 / 1 blocked external verification |
| Low bugs | 0 |
| Total bugs fixed | 11 |
| Total bugs unresolved | 0 confirmed code defects |
| External verification conditions | 2 |
| Confirmed cross-account breaches remaining | 0 |
| Confirmed cross-organization breaches remaining | 0 |
| Automated subscription-policy failures remaining | 0 |
| Automated authentication failures remaining | 0 |
| Automated authorization security failures remaining | 0 |
| Functional authorization mismatches remaining | 0 confirmed |

## Required release decision

Do not promote the Preview deployment to production until the existing-user verification rollout is decided and all 30 manual scenarios pass with isolated Firebase identities and Stripe test mode. This audit does not claim the application has no other bugs.
