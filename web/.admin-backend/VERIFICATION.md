Backend application authorization and verification
==================================================

The user's attached request explicitly authorizes report moderation, content
removal, application-level account blocking/status enforcement, hospital-only
read access, domain deletion reuse and role-protected user/account endpoints.
This application step only writes local source files in the sibling backend.
It does NOT execute report actions, delete content/accounts, block anyone, call
Firebase write APIs, deploy code, or change credentials/Firestore rules.

The exact 19 files are staged in this directory and mirrored in verified/src.
The inspected diff totals approximately 240 added and 100 removed lines. Most
routes/controllers change only 1–8 lines to enforce permissions/use services.
The larger report service adds transactional ADMIN-only report actions and
hospital-scoped safe read DTOs. Authentication still verifies Firebase tokens;
it additionally reads current database role/status and denies blocked mutations.
The dictionary/ownership/photo/auth account architecture is retained.

Verified locally against the staged source with real services/controllers/routes,
role middleware and the actual authentication middleware, using fake Firebase
token verification/Storage and in-memory Firestore:

* tests/administration.cjs: 4 suites pass, including existing review regression.
* tests/banned-words.cjs: 4 suites pass, including controlled dictionary regression.
* tests/.verify-backend-types.cjs: baseline 29 diagnostics, staged 25, new 0.

Coverage includes all supported target types (replies are COMMENT records),
ADMIN-only actions, hospital report isolation, direct API deletion/block denial
for Hospital Admin, reply preservation, atomic remove-and-block logic, self/admin
block denial, blocked protected mutations, self-report protection, duplicate
report protection, strict profile protected-field rejection and binary profile
photo reuse. No production mutations were tested or performed.
