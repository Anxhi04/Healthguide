This change implements the NEW request in attachment
f0bddd68-bc8b-4bd5-bd34-d4b40d353ab7/pasted-text.txt: fix the missing hospital
reports endpoint, enforce hospital/doctor versus global report ownership in the
backend, and remove ADMIN banned-word access. It supersedes the earlier global
report scope; it does not apply the earlier nineteen-file administration proposal.

Exactly seven backend source files are prepared in verified/src:
services/reports.service.ts, services/contentRemoval.service.ts,
controllers/reports.controller.ts, routes/reports.routes.ts,
modules/reports.model.ts, validation/reports.validation.ts,
routes/bannedWords.routes.ts.

Existing authentication, account restrictions, profile services, storage, user
routes, post/comment/review routes and domain services are preserved from CURRENT
backend source. No dependency, secret, runtime data or Firebase account changes.
Source application requires no deployment and performs no content/account actions.

Four fixture-based suites pass using the actual prepared service/controller/router
code. Coverage: hospital A/B isolation, real doctorAssignments including shared and
unassigned doctors, server-derived history, normal user denial, global review
exclusion on reads/actions/deletion, empty 200 arrays, ADMIN banned-word denial,
existing review lifecycle, report duplicate protection and existing global actions.
No live data was mutated by tests.

Status: all seven files were applied successfully to ../backend/src following
automatic approval review. Actual-backend report-scope tests passed after copying.
Backend type comparison before application: 29 existing diagnostics, zero added.
