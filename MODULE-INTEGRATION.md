# Module Integration Guide

This document defines the conventions every module in life-os must follow so
that modules built independently (e.g. generated in Bolt.new) can be dropped
into `/src/modules/<suite>/<name>/` without conflicts.

## Suites and modules

The app is organized into 5 suites. Each suite is a top-level nav item
(sidebar on desktop, bottom nav on mobile); its modules live under nested
routes and, for multi-module suites, are presented as a card grid at the
suite's index route (`/personal`, `/finance`, `/home`). Health and Travel are
single-module suites and route straight through to their module with no grid.

| Suite      | Route            | Module            | Route                        | Dexie DB name          |
|------------|------------------|--------------------|-------------------------------|-------------------------|
| Personal   | `/personal`      | Habits             | `/personal/habits`            | `app-habits`            |
| Personal   | `/personal`      | Todos              | `/personal/todos`             | `app-todos`             |
| Personal   | `/personal`      | Wishlist           | `/personal/wishlist`          | `app-wishlist`          |
| Finance    | `/finance`       | Expenses           | `/finance/expenses`           | `app-expenses`          |
| Finance    | `/finance`       | Subscriptions      | `/finance/subscriptions`      | `app-subscriptions`     |
| Finance    | `/finance`       | Bills              | `/finance/bills`              | `app-bills`             |
| Finance    | `/finance`       | Assets             | `/finance/assets`             | `app-assets`            |
| Health     | `/health`        | Health             | `/health`                     | `app-health`            |
| Home       | `/home`          | Chores             | `/home/chores`                | `app-chores`            |
| Home       | `/home`          | Household Items    | `/home/household-items`       | `app-household-items`   |
| Travel     | `/travel`        | Travel             | `/travel`                     | `app-travel`            |

## Shared types

Every trackable record — regardless of module — implements `TrackableItem`
from [`src/core/types.ts`](src/core/types.ts):

```ts
interface TrackableItem {
  id: string
  module: string
  title: string
  dueDate: string
  recurrence?: string
  status: 'pending' | 'done'
  notes?: string
}
```

- `id` — generate with `generateId()` from [`src/core/idUtils.ts`](src/core/idUtils.ts) (wraps `crypto.randomUUID()`). Never hand-roll IDs.
- `module` — must match the module's name from the table above (e.g. `"habits"`, `"expenses"`, `"household-items"`).

## DB naming convention

Each module owns its own local Dexie database, named:

```
app-<module>
```

Use the exact names from the table above — e.g. `app-habits`, `app-expenses`, `app-household-items`, `app-travel`.

- Do not share a single database across modules. Each module reads/writes only its own `app-<module>` database.
- If a module needs multiple record types, use separate tables inside its own `app-<module>` database — do not create additional top-level `app-*` databases.

## Dates

- **ISO date strings only.** Store and pass `dueDate` (and any other date field) as `YYYY-MM-DD` or full ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) strings.
- Never store `Date` objects, timestamps (numbers), or locale-formatted strings (`"8/16/2026"`) in a `TrackableItem`.
- Format for display at the point of render, not at the point of storage.

## Shared CRUD function names

Every module must expose a data-access module (e.g. `src/modules/<suite>/<name>/data.ts`) with these exact function names and signatures:

```ts
getAll(): Promise<TrackableItem[]>
create(item: Omit<TrackableItem, 'id'>): Promise<TrackableItem>
update(id: string, patch: Partial<TrackableItem>): Promise<TrackableItem>
remove(id: string): Promise<void>
getUpcoming(withinDays?: number): Promise<TrackableItem[]>
```

- `getUpcoming` returns pending items with `dueDate` within the given window (default: 7 days), sorted ascending by `dueDate`. This is what suite/dashboard views aggregate across modules.
- Keep these functions the only public data-access surface for the module — internal storage details (Dexie tables, schema, etc.) stay private to the module.

## Merging a new Bolt.new-built module

When bringing in a module built externally (e.g. in Bolt.new), work through this checklist before merging:

- [ ] Module code lives entirely under `src/modules/<suite>/<name>/` (or `src/modules/<name>/` for the single-module Health and Travel suites) — no files added outside that folder except route/nav registration (see below).
- [ ] Module name and Dexie DB name match the table above exactly.
- [ ] All records use the shared `TrackableItem` interface from `src/core/types.ts` (no duplicate/local type definition).
- [ ] IDs are generated via `generateId()` from `src/core/idUtils.ts`.
- [ ] Module's storage is namespaced as `app-<name>` and does not touch other modules' data.
- [ ] All dates are ISO strings, never `Date` objects or numbers.
- [ ] Data layer exposes exactly `getAll`, `create`, `update`, `remove`, `getUpcoming` with the signatures above.
- [ ] Module exports a single default page component suitable for use as a route element.
- [ ] Route added to `src/App.tsx` under the correct suite path (e.g. `<Route path="/personal/habits" element={<Habits />} />`).
- [ ] For a multi-module suite, the module is added to that suite's `modules` array in `src/core/suites.ts` (`{ path: '/<suite>/<name>', label: '<Label>', icon: '<emoji>' }`) so it appears in the suite's card grid. Suite-level nav (sidebar/bottom nav) needs no change — it only lists the 5 suites.
- [ ] No hardcoded colors/fonts that fight the shell's light/dark theming (`src/index.css` variables).
- [ ] `npm run build` passes with no type errors.
- [ ] Module works standalone at both mobile (<768px, bottom nav) and desktop (≥768px, sidebar) widths.
