# Current-user 500 diagnosis — awaiting a real authenticated reproduction

No root-cause fix or data repair has been applied without a reproduced exception.

Read-only live data inspection:
- Admin account: canonical users/FpPGynGUXgYtff9mFb67Q0BLvaA2; ADMIN/ACTIVE; enabled Auth account; email matches the requested admin address; no missing inspected profile fields; birth date is Timestamp; no hospital assignment.
- Hospital Admin account: canonical users/wqVH2FHP3RY8clpOenAK8NbtQNB2; HOSPITAL_ADMIN/ACTIVE; enabled Auth account; email matches the requested hospital-admin address; no missing inspected profile fields; birth date is Timestamp; assignment hospital-001.
- Each important account has exactly one profile when matching canonical ID, stored id/uid/firebaseUid, or case-insensitive email across the users collection. No conflicting duplicate role was found.
- 25 profiles exist; 18 are active normal-user profiles. One existing enabled normal-user account was read and serialized successfully with USER role and matching canonical document ID.
- Direct current-controller audits returned 200 for all three roles. These audits are not authenticated HTTP requests and do not verify password login/reload/logout.

Code inspection:
- users.routes.ts places /me before /:id and authenticates the request.
- authenticate verifies the token and sets req.user; getCurrentUser uses its uid.
- getUserById reads COLLECTIONS.USERS at the UID; getCurrentUser returns the raw profile without hospital enrichment or unsafe phone/date/photo dereferences.
- Firestore document absence is intentional 404 PROFILE_NOT_FOUND.
- The current seed/cleanup scripts preserve important Auth UIDs, consolidate legacy email duplicates, assign ADMIN/HOSPITAL_ADMIN explicitly, and normalize their birth dates to Timestamp. No incompatible important-account record was found; seed scripts were not run.

Temporary safe capture:
- Only backend/src/controllers/user.controller.ts is instrumented for this diagnostic step.
- Local runtime.jsonl records controller load, current-user UID/HTTP marker, Firestore completion, HTTP status and sanitized exception details.
- No Authorization header, token, password, complete profile body, new endpoint, fake data or relaxed verification is involved.
- The live server loaded the instrumented controller. Its capture has not yet received a verified authenticated HTTP /users/me reproduction. Audit calls have distinct processes and no HTTP marker; they are not presented as reproduction.
- App.tsx was briefly refreshed to notify connected Vite clients, then restored. No permanent frontend or data change was made.

External blocker: reproducing the reported HTTP 500 requires the failing normal frontend session. No valid token/password or attached authenticated browser session is available to this agent, and a failing request has not reached the instrumented handler. The user has been asked only to refresh the authenticated page; the agent will read the server exception directly from its local capture. No request for manually copied logs is necessary.

Once the actual request arrives, use the exact captured failing operation/stack to apply a narrow fix, verify it, and remove the temporary handler instrumentation and diagnostic artifacts. Original controller source is retained locally for restoring only these temporary changes; check for concurrent edits before restoration. This diagnosis is open, not a declaration that the 500 is fixed.

Update: the actual verified Hospital Admin HTTP session was subsequently captured with /users/me statuses 200 and 304, and no server exception. Temporary controller instrumentation was removed after checking its source unchanged; original server error logging remains. The original reported 500 root cause remains unconfirmed. The earlier no-HTTP-request blocker above records the state at that earlier point, not the latest capture.
