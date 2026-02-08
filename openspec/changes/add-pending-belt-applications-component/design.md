# Design: Pending Belt Applications Component

## Context

Mentors currently have no dedicated interface to view and manage pending belt applications. The mentor home page shows demo content (TeamsList) that needs to be replaced with actionable functionality. The existing `MemberBelt` component mixes member data retrieval with belt color rendering, making it difficult to show belt colors in contexts where the belt doesn't belong to a specific member (like applications).

## Goals

- Provide mentors with a clear view of pending belt applications
- Enable efficient review workflow with expandable details
- Establish reusable belt color component for future features
- Maintain backward compatibility with existing MemberBelt usage
- Follow established patterns from attendance table implementation

## Non-Goals

- Approval/rejection workflow (future feature)
- Filtering or searching applications (future feature)
- Historical view of past applications (future feature)
- Notifications for new applications (future feature)

## Decisions

### Decision 1: Extract BeltColor Component

**What**: Create standalone `BeltColor` component separate from `MemberBelt`

**Why**:

- Belt colors need to be displayed in multiple contexts (current belt, applied belt, historical belts)
- Current `MemberBelt` component tightly couples member lookup with rendering
- Reusability enables future features (belt history, badge requirements, etc.)

**Alternatives considered**:

- Keep logic in MemberBelt, duplicate rendering in ApplicationsPending
  - ❌ Violates DRY principle
  - ❌ Styling inconsistencies likely
- Use MemberBelt with fake member object
  - ❌ Hacky, confusing code
  - ❌ Tight coupling remains

**Implementation details**:

```typescript
// BeltColor.vue props
{
  belt: BeltModel | null,  // Belt data including color and hexCode
  size?: "sm" | "md" | "lg",
}

// MemberBelt.vue becomes wrapper
{
  member: MemberModel,     // Unchanged
  size?: "sm" | "md" | "lg"  // Unchanged
}
```

**Migration**: All existing MemberBelt usage continues to work with same interface.

### Decision 2: Use Computed Property for Pending Applications

**What**: Add `PendingBeltApplications` computed property to `useMemberBeltsStore`.
This should use a dedicated new API endpoint that returns only pending applications.
The store should refresh this data whenever member belts are updated.

**Why**:

- Filtering logic done in api endpoint, but cached in store (single source of truth)
- Automatic reactivity when data changes
- Sorting logic in one place (consistent across app)
- Easier to test and maintain

**Alternatives considered**:

- Filter in component
  - ❌ Logic duplication if multiple components need it
  - ❌ Harder to test
- Separate store
  - ❌ Over-engineering for single computed property
  - ❌ Still needs access to same data

**Filtering criteria**:

```typescript
applicationDate !== null && // Has been submitted
	awarded === null && // Not yet awarded
	rejectedDate === null && // Not rejected
	deleted === false; // Not soft-deleted
```

**Sorting**:

1. Primary: Belt color (using sort order from BeltModel if available, or color name)
2. Secondary: Member name (alphabetical, case-insensitive)

### Decision 3: Adapt Attendance Table Pattern

**What**: Use `@tanstack/vue-table` and `UTable` similar to attendance page

**Why**:

- Consistent user experience across mentor pages
- Proven pattern that works well
- Expandable row functionality already demonstrated
- Familiar to developers maintaining the code

**Alternatives considered**:

- Custom table implementation
  - ❌ Reinventing the wheel
  - ❌ More code to maintain
- Different table library
  - ❌ Inconsistent with existing patterns
  - ❌ Additional dependency

**Table columns**:
| Column | Content | Component |
|--------|---------|-----------|
| Coder | Full name + Photo | Text + `MemberAvatar` |
| Team | Name + icon | Text + `TeamLogo` or icon |
| Belt | Applied color | `BeltColor` (not current belt) |

### Decision 4: Inline Expandable Details

**What**: Clicking row expands details panel within table (below row)

**Why**:

- Keeps user in context (no modal/navigation)
- Schnell review flow (see list, click for details, back to list)
- Consistent with common table patterns
- Mobile-friendly (no hover states required)

**Alternatives considered**:

- Modal dialog
  - ❌ Disrupts review flow
  - ❌ Extra clicks to dismiss
- Side panel
  - ❌ Complex layout on mobile
  - ❌ More screen real estate required
- Navigate to detail page
  - ❌ Too heavy for quick review
  - ❌ Loss of list context

**Details panel content**:

- Coder name (redundant but reinforces context)
- Belt color being applied for
- Application date (formatted, human-readable)
- Application notes
- Future: Approve/Reject buttons and message input (not in this phase)

## Risks / Trade-offs

### Risk: BeltColor Refactor Breaking Changes

**Likelihood**: Low
**Impact**: Medium (broken belt displays on existing pages)
**Mitigation**:

- Maintain exact same MemberBelt interface
- Test on attendance and sign-in pages before merging
- No changes to CSS class names or styling

### Trade-off: Store Complexity vs Component Complexity

**Decision**: Put filtering/sorting in store computed property
**Trade-off**: Store grows larger, but components stay simple
**Rationale**: Store complexity is worth it for maintainability and reusability

### Risk: Performance with Many Applications

**Likelihood**: Low (typical sessions have 0-5 pending applications)
**Impact**: Low (computed property recalculates on data change)
**Mitigation**:

- Computed properties are cached by Vue
- Filtering is O(n) where n is total member_belts records
- Sorting is O(n log n) where n is pending applications (small number)
- If performance issue arises later, can add server-side filtering

## Migration Plan

### Phase 1: Extract BeltColor (safe refactor)

1. Create `BeltColor.vue` with extracted logic
2. Update `MemberBelt.vue` to use BeltColor
3. Test existing pages (attendance, sign-in)
4. Commit and deploy independently if needed

### Phase 2: Add Store Support

1. Add `PendingBeltApplications` to store
2. Test store computed property
3. Commit (no visible changes yet)

### Phase 3: Add ApplicationsPending Component

1. Create component with table and translations
2. Test in isolation (not yet on mentor page)

### Phase 4: Replace Mentor Home Content

1. Update mentor home page to use ApplicationsPending
2. Remove TeamsList
3. Test end-to-end

### Rollback Strategy

- Each phase can be reverted independently
- MemberBelt refactor is backward compatible (safe to keep even if rest is reverted)
- Mentor home page change is single-line (easy revert)

## Open Questions

### Resolved:

- **Q**: Should we show member's current belt in addition to applied belt?
  **A**: No, table shows only applied belt. Member details could show both in future iteration.

- **Q**: What order for belt colors in sort?
  **A**: Use the belts store to get the list of belts. These include a sort order field that can be used to sort applications by belt color.

- **Q**: Should application details panel be persistent or collapse when clicking another row?
  **A**: Collapse others (only one expanded at a time). Simpler UX.

- **Q**: TeamLogo component exists?
  **A**: There is a TemLogo component that can be reused. If team has no logo, just show name.

### Open:

- None currently. Proceed with implementation.

## Success Criteria

- ✅ BeltColor component works in MemberBelt without breaking existing pages
- ✅ ApplicationsPending displays on mentor home page
- ✅ Table shows correct applications (pending only, sorted correctly)
- ✅ Row click expands details panel
- ✅ All translations present in all four languages
- ✅ Empty state displays when no applications
- ✅ Tests pass, code formatted and linted
