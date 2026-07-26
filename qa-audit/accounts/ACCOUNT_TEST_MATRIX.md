# Account test matrix

Legend: **Pass** = automated evidence; **Blocked** = requires Preview/provider interaction; **Fail** = confirmed workflow mismatch.

| Synthetic identity | Role/state/plan | Expected access | Actual result | Result | Evidence / issue |
|---|---|---|---|---|---|
| `parent-a` | parent, verified, free, Team A | own profile/child, Team A family data only | Correctly scoped | Pass | Firestore guardian and tenant tests |
| `adult-player-a` | adult player, verified, free | own profile and active team only | Correctly scoped | Pass | team membership rules |
| `youth-a` | invited youth, verified by invite | linked player membership only | Linked member document resolves correctly | Pass | linked-youth emulator test |
| `coach-owner-a` | coach, active paid | owner operations and bounded creation | Team/league creation is now server-authorized and capped | Pass | account creation policy + direct-write denials |
| `assistant-a` | coach/member, staff position | normal coach operations in Team A, no billing | Some UI-presented writes remain owner-only | Fail | AQ-009 |
| `school-owner-a` | admin, school active | own school metadata and bounded squads | Owner field variants now work; delegated workflow needs Preview | Blocked | AQ-008; manual M-18 |
| `league-owner-a` | league creator, free | one league, own league only | direct creation bypass closed; isolation passes | Pass | league creation and query rules |
| `superadmin-a` | superadmin claim | administrator routes/APIs | Rules and APIs recognize claim; UI lifecycle not manually run | Blocked | manual M-25 |
| `outsider-b` | coach, verified, Team B | no Team A/League A/Club A data | Reads and writes denied | Pass | 24-test emulator suite |
| `unverified-a` | coach, unverified | verification page only | API, Firestore, Storage denied | Pass | auth and emulator tests |
| `suspended-a` | player, suspended | no private access | denied | Pass | emulator tests |
| `pending-delete-a` | parent, deletion pending | no private access | denied immediately | Pass | emulator + purge tests |
| `removed-a` | removed Team A member | no team/chat/notifications | denied | Pass | membership/chat tests |
| `demo-a` / `demo-b` | anonymous demo | own demo session only | cross-demo access denied | Pass | emulator test |
| `elite-active` | active elite, limit 8 | eight creation slots | policy returns 8 | Pass | account creation policy |
| `school-trial` | trialing school + 2 add-ons | seventeen slots | policy returns 17 | Pass | account creation policy |
| `elite-past-due` | past_due elite | free entitlement only | policy returns 1 | Pass | account creation policy |
| `email-password-new` | unverified signup | one account, then verify | code path sends verification and gates tenant work | Pass | static regression; provider link lifecycle blocked |
| `oauth-new` | Google | verified profile and correct role | not executed against isolated provider | Blocked | M-03 |
| `password-reset-a` | verified | generic, single-use provider reset | request behavior reviewed; token lifecycle not executed | Blocked | M-05 |
| `multi-org-a` | owner A, member B | switch without cache bleed | data rules scoped; browser history/tab behavior untested | Blocked | M-20 |

## Execution order

1. Identity creation, normalization, duplicate submission, and verification.
2. Login, logout, reset, revocation, multi-device, suspended/deletion states.
3. Direct API/rules/storage authorization and role tampering.
4. Team, league, tournament, school, invitation, and multi-tenant workflows.
5. Subscription state and capacity transitions using Stripe test mode.
6. Notifications, email links, preferences, removed-user suppression.
7. Settings, ownership, deletion/cancellation, and final purge dry run.
8. Responsive navigation and dashboard checks in Vercel Preview.

## Automated totals

- Focused account-policy tests: 12 passed, 0 failed.
- Firestore/Storage authorization tests: 24 passed, 0 failed.
- Full repository unit suite: 130 passed, 0 failed.
- Combined repository unit plus rules suite: 154 passed, 0 failed.
- Manual account scenarios remaining: 30 (see release checklist).
