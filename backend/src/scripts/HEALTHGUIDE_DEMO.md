HealthGuide cleanup and demo workflow
===================================

Run from the backend directory. Credentials come from the existing Firebase initialization; the tool never writes Firebase Authentication, passwords or custom claims.

```powershell
npm.cmd run demo -- inspect
npm.cmd run demo -- cleanup
npm.cmd run demo -- seed
npm.cmd run demo -- demo
npm.cmd run demo -- demo --apply --project=healthconnect-caec4
npm.cmd run demo -- verify
npm.cmd run demo:test
```

All mutation modes are dry runs until both `--apply` and the exact `--project` are supplied. `demo` combines conservative cleanup with seed. It does not blanket-reset the database. Inspection includes unknown collections, legacy `doctor`, report guards and anonymous author subcollections. Unknown collections are preserved. Changes are logged by path and category.

Before writing, the workflow saves a recursive backup under ignored `demo-backups/`. Timestamp values in `backup-*.json` are tagged as `{ "__firestoreTimestamp": [seconds, nanoseconds] }`. These are local application snapshots, not managed Firestore exports. They contain private application data and must stay outside source control. `inspection-*.json` is a readable inventory; use the tagged backup for restoration. Multi-batch writes are not globally atomic. A result report records verified counts and unresolved legacy ownership.

Seeding preserves both important real Auth UIDs. It completes their existing profiles, normalizes their birth-date types/settings, and ensures the Hospital Admin owns one populated hospital. Missing important Auth users stop the run. Missing important profiles require inspection rather than invented personal details. Disabled Auth accounts are reported without modification.

Normal demo profiles are created only for enabled existing Auth identities that have no Firestore profile, until there are 12 active Auth-backed normal users. No existing normal profile is overwritten. New names are fictional. No new privileged Auth identities are created. Unauthenticated legacy profiles connected to existing content are retained and reported rather than merged by similar names.

New catalog entries reuse existing normalized names. Deterministic document IDs and relationship lookups avoid repeated copies. Existing seeded reviews, report resolutions, edits and memberships are preserved on repeat runs. The managed hospital is refreshed by seed mode. Membership IDs use the actual service helper. Anonymous numbers use the transactional service, and report guards use the service's exact hash architecture. Ratings and community counts are calculated by existing services, so no fabricated counters are persisted. Images are optional and omitted for new content.

Additional hospitals are preserved, not manufactured with invalid administrator IDs. New doctors include visiting assignments to other approved existing hospitals. Existing hospital ownership lacking Auth remains in the uncertainty report. The Super Admin report service deliberately excludes review reports; Hospital Admin can read review reports for its hospital and moderate hospital reviews only.

Verification exercises the `/users/me` controller with the known Auth UID, doctor directory/relationships, rating calculations, public content presentation, comments/replies, community members, report scopes, pending hospital reviews, anonymous DTOs and database references. It also checks that the Auth identity inventory did not change. It does not exercise password login, Firebase ID-token HTTP middleware, or Web/Mobile rendering. Existing project compiler errors may require `--transpile-only` for the operational scripts; these scripts have their own integrity checks.
