# PRD: Journal-Only Rebuild

## Summary
Rebuild the existing site to provide a focused product that contains only the Journal Dashboard and its Sidebar. Remove or disable the propfirm section and any related pages, routes, and assets. Keep and reuse journal-related UI, data flows, authentication, and storage (e.g., Supabase) where possible.

Goals:
- Deliver a lightweight, maintainable site focused on journaling features and dashboard metrics.
- Simplify navigation and remove all propfirm UI and features.
- Keep existing user auth and data; ensure a smooth migration with minimal data changes.

Assumptions
- The project currently uses Supabase for auth and storage (based on repo docs). We'll preserve the same backend unless you ask to change it.
- The Journal Dashboard and its sidebar components already exist in the repo and can be reused with minor refactors.
- We will not introduce major new UX besides consolidating and pruning features.

Out of scope
- Propfirm features or any functionality specific to prop trading firms.
- Large redesigns of the journal UI.

Success metrics
- Users can open the site and reach the journal dashboard in <= 2 clicks from root.
- Existing journal data and entries function without loss after the change.
- The build is smaller (fewer routes, fewer assets) and easier to maintain.

## Personas
- Casual trader / journaller: wants a simple dashboard to add, view, and analyze journal entries.
- Power user: uses tags, screenshots, and metrics overview to review performance.

## User journeys
1. Landing -> Dashboard: User lands on site (root) and sees the journal dashboard with sidebar navigation.
2. Create entry: User clicks "New Entry", fills the form, optionally uploads screenshot, and saves.
3. Browse entries: User filters by date/tag and opens entries for detail.
4. Metrics view: User toggles to view aggregated metrics (points, streaks, P&L as implemented).

## Core features (MVP)
- Auth: Keep existing Supabase auth (email/password, social as configured).
- Dashboard (main): List of recent entries, quick stats, and filters.
- Sidebar: Navigation to Dashboard, All Entries, New Entry, Settings, and optionally Export.
- Entry CRUD: Create, read, update, delete entries; support attachments/screenshots if present.
- Tagging & filtering: Tag entries and filter by date range, tag, search.
- Metrics / Insights: Reuse existing metrics widgets (points, streaks, win rate) from the repo.
- Export: CSV or JSON export of journal entries (optional for MVP, recommended).

## UI / Components (high-level)
- App shell
  - Header: Brand, user menu (logout), optional quick-add.
  - Sidebar: Persistent left navigation.
  - Content area: Route outlet for Dashboard and Entry views.
- Dashboard page (`/dashboard` or `/`)
  - Top metrics row
  - Recent entries list or grid
  - Filters bar
- Entries page (`/entries`)
  - Table or list view with pagination
  - Bulk actions (delete/export)
- Entry form modal or page (`/entries/new`, `/entries/:id`)
  - Title, date/time, trade details (if present), notes, tags, screenshot upload

Design constraints
- Keep the existing styling system (Tailwind + project styles in current repo).
- Maintain responsive behavior for mobile and desktop.

## Data model (suggested / match existing schema)
- users (existing)
- journals / entries
  - id (uuid)
  - user_id (fk)
  - title
  - body / notes (text)
  - date (timestamp)
  - tags (array or relation table)
  - screenshots (array of URLs or a separate screenshots table)
  - points / metrics fields (numerical) if used by dashboard
  - created_at, updated_at

If the repo already has a slightly different schema (e.g., journals table): reuse it. Prefer schema compatibility to avoid migrations.

## API / Backend endpoints
(Prefer reusing Supabase CRUD; if custom server exists, mirror these endpoints)
- GET /api/journals?userId=&limit=&offset=&filters=...
- GET /api/journals/:id
- POST /api/journals
- PUT /api/journals/:id
- DELETE /api/journals/:id
- POST /api/uploads (for screenshots) — or use Supabase Storage directly from client

Auth: ensure endpoints require authenticated user and check user_id matches.

## Navigation & Routing
- Root (`/`) -> redirect to `/dashboard`
- `/dashboard` -> Journal Dashboard
- `/entries` -> All entries
- `/entries/new` -> New entry
- `/entries/:id` -> Entry detail/edit
- `/settings` -> User settings

Remove or redirect all propfirm routes to `/dashboard` or a 404 with explanation.

## Migration plan
1. Inventory propfirm-related pages, components, routes, and assets.
2. Flag them for removal/archival. Optionally move to an `archive/propfirm` branch instead of deleting immediately.
3. Update route definitions and navigation to remove links.
4. Run a local test build and QA. Confirm journal flows still work.
5. Deploy to staging and run acceptance tests.

## Acceptance criteria
- Site root opens to the Journal Dashboard.
- No navigation links or routes to any propfirm features remain.
- Journal CRUD works (create/read/update/delete) for an authenticated user.
- Existing journal data remains accessible and unchanged.
- Basic metrics load and reflect journal data.
- Build and tests pass (lint, typecheck if applicable).

## Non-functional requirements
- Performance: pages render in < 2s on average network conditions.
- Security: maintain current auth and storage best practices; uploads validated.
- Accessibility: headlinestep: keyboard nav and basic ARIA attributes for forms.

## Risks & mitigations
- Risk: Removing propfirm code may remove shared components used by journal features.
  - Mitigation: Inventory and test shared components before deletion; refactor shared code to `components/shared`.
- Risk: Data loss if schema changes performed hastily.
  - Mitigation: Keep schema backwards compatible; backup DB before migrations.

## Timeline & milestones (rough estimate)
- Day 0: PRD approval (this doc)
- Day 1–2: Repo inventory, decide which files to keep/remove
- Day 3–5: Implement router & scaffold changes, prune propfirm routes, update nav
- Day 6–8: QA, tests, small UX fixes, prepare staging
- Day 9: Deploy to staging and run acceptance tests
- Day 10: Production deploy (if staging OK)

## Deliverables
- `PRD_JournalDashboard.md` (this file)
- A branch `journal-only` with the reduced app
- Minimal README update describing the focused product
- Tests and CI config for pre-deploy checks

## Next steps (implementation tasks)
1. Inventory and list files (components/pages) referencing "propfirm".
2. Create a `journal-only` branch and update routes to default to the dashboard.
3. Remove or archive propfirm files; keep any shared components reused by journal.
4. Run build and tests; fix issues.
5. QA and deploy to staging.

## Notes & questions
- Do you want to permanently delete propfirm code or archive it in a separate branch/folder? Archival is safer.
- Confirm whether Supabase backend should be preserved as-is.

---

If you want, I can now:
- scan the repo for files that belong to the propfirm section and produce an inventory; or
- create a `journal-only` branch and start pruning routes; or
- produce a minimal implementation plan with file-level edits.

Tell me which of these you want next.