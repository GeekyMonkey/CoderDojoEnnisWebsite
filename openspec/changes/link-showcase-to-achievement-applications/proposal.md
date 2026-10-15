# Change: Link showcase evidence to badge and belt applications

## Why
Coders should be able to support achievement applications with multiple existing showcase projects. Evaluators need to inspect those projects directly while reviewing the application.

## What Changes
- Store selected showcase item GUIDs as `showcase_item_ids uuid[]` on badge and belt application records.
- Add an Add action that opens a picker of the coder's own showcase entries, including hidden entries; display linked entries as reusable cards.
- Add a Delete/remove-link action on selected cards. Removing a link leaves the showcase item and its image intact.
- Allow link selection before submission and add/remove changes to pending applications. Keep decided applications read-only; reapplications have their own evidence selections.
- Display linked showcase cards to evaluators alongside the existing application notes.
- When a showcase item is deleted, clean its owning member’s badge and belt application arrays in the same transaction and refresh open views. Also self-heal existing missing references.
- Reuse `ShowcaseCard` across public, coder and evaluator screens, including its presentation styles and accessible disclosure behavior.
- Route data reads/writes and realtime refresh through TanStack stores.

## Proposed database schema

Applications use the existing achievement records rather than a separate application table:

```sql
alter table coderdojo.member_badges
  add column showcase_item_ids uuid[] not null default '{}'::uuid[];

alter table coderdojo.member_belts
  add column showcase_item_ids uuid[] not null default '{}'::uuid[];
```

Existing records receive empty arrays. The database write boundary must reject null elements and duplicate IDs, validate newly attached IDs against showcase ownership, and update only a pending application owned by the verified coder. Array order records selection order. Preserve existing application date, notes, progression and review permissions.

## Impact
- New capability: achievement-showcase-evidence; extends implement-coder-achievements, add-achievement-approvals and add-member-showcase.
- Migration and atomic coder application/link-update logic; generated database types and shared application/review contracts.
- Coder application form, pending application display, evaluator review views, TanStack stores and Bruno requests.
- Shared ShowcaseCard presentation; public showcase remains a consumer of the same card.

## Assumptions for approval
- Only the coder's own showcase entries can be attached, whether publicly visible or hidden.
- Links may be edited while the application is pending; awarded/rejected records remain read-only.
- Missing/deleted showcase references are automatically removed from badge and belt application arrays, including decided applications.
