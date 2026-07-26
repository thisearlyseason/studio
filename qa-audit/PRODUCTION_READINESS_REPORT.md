# The Squad Pro — Production Readiness Audit

Audit date: 2026-07-26  
Audit branch: `codex/qa-production-audit`  
Scope: repository review and local automated verification only; no production data, charges, emails, or push messages were sent.

## Executive summary

**Overall release status: READY WITH CONDITIONS.** The critical public-recruiting privacy exposure identified in the audit has been remediated on this audit branch: public scouting uses a server-side field whitelist and Firestore no longer permits anonymous reads of private player records or subcollections. A production launch remains conditional on the rules-emulator, Preview, environment, Stripe, email, push, and device checks listed below.

The audit also found that the Firestore/Storage emulator suite cannot run in this environment because Java 21 is unavailable; production environment configuration and third-party workflows cannot be verified without a Vercel Preview and test credentials. These are release conditions even after the critical privacy design is remediated.

## Architecture summary

- Framework: Next.js 15.5.22, React 19, TypeScript; Firebase App Hosting configuration (`apphosting.yaml`, Node 24 runtime).
- Identity and data: Firebase Authentication, Firestore security rules, Firebase Storage security rules, Firebase Admin SDK, Cloud Functions v2.
- Billing: Stripe subscriptions, Checkout, Customer Portal, Connect, idempotency/mutation locks, signed Stripe webhooks.
- Messaging: Resend email and signed Resend webhooks; Firebase Cloud Messaging.
- Other integrations: Google OAuth/Calendar, Google GenAI, Straico AI, FFmpeg/media processing, RSS/external URL fetching.
- Tenant types: teams/squads, leagues, tournaments, schools, clubs, households, public spectator projections, demos.
- Security controls observed: Admin SDK token verification for authenticated API routes, input-size guards, user/public rate limits, server-side plan and seat reconciliation, CSP/HSTS/security headers, restrictive Storage default deny.

## Findings

| Severity | ID | Finding | Status |
|---|---|---|---|
| Critical | SEC-001 | Public recruiting toggle granted unauthenticated reads of whole player documents and arbitrary subcollections. | Fixed on audit branch; emulator/Preview verification pending |
| High | REL-001 | Firestore/Storage rules integration suite is not runnable here (JDK 21 missing), so live rule behavior is not fully proven. | Blocked external environment |
| High | REL-002 | Required production environment variables and Vercel/App Hosting separation cannot be verified from this checkout. | Blocked external environment |
| Medium | DEP-001 | Dependency audit originally reported high Next.js/sharp/fast-uri issues. Next and sharp were upgraded and an override applied; remaining production audit findings are three moderate transitive GenAI/MCP advisories. | Partially fixed; review required |
| Medium | AUTH-001 | Parent-owned child player documents may be created/deleted by the guardian but parent update access is not consistently present in the player rules. | Unresolved functional/authorization review |
| Medium | QA-001 | Lint completes with exit code 0 but reports 1,943 warnings, including React hook dependency and accessibility/performance warnings. | Unresolved quality debt |
| Low | OPS-001 | App Hosting has `maxInstances: 1`; this is a capacity/availability risk at public launch. | Unresolved deployment decision |

## Fixed findings

### DEP-001 — dependency remediation

- Root cause: `next` 15.5.20 and `sharp` 0.33.5 were within reported advisory ranges; transitive `fast-uri` was also flagged.
- Change: upgraded `next` to 15.5.22, `sharp` to 0.35.3, and pinned `sharp` 0.35.3 and `fast-uri` 4.1.1 through package overrides.
- Evidence: `npm audit --omit=dev --package-lock-only` now reports **0 critical, 0 high, 3 moderate** findings. `npm run typecheck`, `npm test`, and `npm run build` pass after the change.
- Remaining: moderate advisory chain `@google/genai` → `@modelcontextprotocol/sdk` → `@hono/node-server`; no non-breaking remediation was offered by npm.

## Unresolved release blockers

1. Install JDK 21 or newer and run `npm run test:rules` against the emulator. Add explicit anonymous public-recruiting, cross-team, cross-league, cross-tournament, cross-school, parent, player, staff, and superadmin rule cases.
2. Run `npm run verify:env` in the production deployment environment and prove every required variable exists with correct scopes. Validate a Vercel/App Hosting Preview with isolated Firebase, Stripe test mode, Resend sandbox, and FCM test tokens.

## Release decision

Do **not** approve a public launch yet. Reassess only when the rules suite runs successfully, required production configuration is verified, and the manual test plan is completed in Preview.
