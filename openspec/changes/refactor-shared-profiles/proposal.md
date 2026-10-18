# Change: Shared profile display and editing

## Why
Role-specific profile routes duplicate the same purpose. Profile viewing should clearly separate read-only display from authorized editing.

## What Changes
- Make `/member/my-profile` the common personal profile route for every role, initially in edit mode.
- Make `/member/member/[memberId]` the common route for viewing another member, initially in display mode.
- Keep route pages thin; share profile components with explicit mode and permission inputs, including child components.
- Display fields according to the subject's assigned roles. Combine applicable fields for members with multiple roles.
- Render display mode without inputs, upload controls, save controls, or other editing features. Provide an external Edit action only when authorized.
- Open password changes from a button in a dialog, preserving existing password authorization.
- Provide parent and mentor views with Details, Parents/Children, Badges, Belts, Goals, and Attendance tabs, matching the applicable legacy sections.
- Redirect old role-specific profile URLs and update navigation links.
- Treat photos as safeguarding identification: only mentors can upload, delete, or replace them. Avatar editing retains existing profile permissions.
- Prioritize photos for mentors and avatars for coders/parents. Remove swapping and provide a mentor-only copy from avatar to photo that preserves its source.

## Impact
- Scope: Vue app, plus explicitly approved minimal image-handler/shared-contract changes to enforce photo permissions and copy images. No database or legacy changes.
- Base branch: develop; implementation in a feature branch and PR.
- Affected code: Vue profile components, role pages, navigation, and client-side stores.
- Preserve server authorization for self, mentors, and linked parent-child relations; UI mode never grants access.
- Existing legacy-replication and profile proposals overlap; this change defines shared routing and presentation behavior.
