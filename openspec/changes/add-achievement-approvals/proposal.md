# Change: Mentor badge and belt approvals

## Why
The new mentor dashboard only displays pending belt applications. Mentors need the legacy ability to review badge and belt applications, record decisions and notes, and undo a mistaken decision.

## What Changes
- Add pending badge applications beside the existing belt applications on the mentor dashboard.
- Allow mentors to approve or reject pending applications with non-empty, trimmed notes.
- Record the decision time in UTC and the authenticated mentor's member ID in the existing awarded/rejected adult ID fields, after verifying their relationship to the consolidated members table.
- Add badge and belt history sections to the mentor coder detail page, with application notes, decision notes, dates, and undo actions.
- Undo clears the decision fields and returns an application to pending, preserving its original application notes and date.
- Require a verified session and a current, active mentor database record for reads and mutations introduced by this change.
- Perform UI API interactions through stores with immediate query invalidation and realtime refresh.
- Add Bruno requests and translations for all four supported languages.

## Impact
- New capability: achievement-approvals.
- Existing belt applications UI gains actions; mentor dashboard gains badge applications.
- Affected code: achievement data modules, server authorization helper, achievement API routes, client stores, dashboard components and mentor coder detail page.
- No changes to legacy source; existing tables should suffice, subject to foreign-key verification.
- Coder application submission, catalogue maintenance, email notifications and general member management are outside this change.

## Legacy References
- `src_legacy/Controllers/MentorController.cs`: BadgeApprove, BadgeReject, BadgeUndo, BeltApprove, BeltReject, BeltUndo.
- `src_legacy/Views/Mentor/MemberBadges.cshtml` and `MemberBelts.cshtml`: notes, pending decisions, earned/rejected history and undo controls.
- `docs/legacy/previous-features.md`: mentor dashboard and belt/badge management.
