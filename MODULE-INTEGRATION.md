# Module Integration Guide

This document defines the conventions every module in life-os must follow so
that modules built independently (e.g. generated in Bolt.new) can be dropped
into `/src/modules/<name>/` without conflicts.

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
- `module` — must match the module's folder name under `src/modules/` (e.g. `"health"`, `"vehicles"`, `"bills"`, `"habits"`).

## DB naming convention

Each module owns its own local database/store, named:

```
app-<module>
```

Examples: `app-health`, `app-vehicles`, `app-bills`, `app-habits`.

- Do not share a single database across modules. Each module reads/writes only its own `app-<module>` store.
- If a module needs multiple record types, use separate object stores/tables inside its own `app-<module>` database — do not create additional top-level `app-*` databases.

## Dates

- **ISO date strings only.** Store and pass `dueDate` (and any other date field) as `YYYY-MM-DD` or full ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) strings.
- Never store `Date` objects, timestamps (numbers), or locale-formatted strings (`"8/16/2026"`) in a `TrackableItem`.
- Format for display at the point of render, not at the point of storage.

## Shared CRUD function names

Every module must expose a data-access module (e.g. `src/modules/<name>/data.ts`) with these exact function names and signatures:

```ts
getAll(): Promise<TrackableItem[]>
create(item: Omit<TrackableItem, 'id'>): Promise<TrackableItem>
update(id: string, patch: Partial<TrackableItem>): Promise<TrackableItem>
remove(id: string): Promise<void>
getUpcoming(withinDays?: number): Promise<TrackableItem[]>
```

- `getUpcoming` returns pending items with `dueDate` within the given window (default: 7 days), sorted ascending by `dueDate`. This is what the Dashboard aggregates across modules.
- Keep these functions the only public data-access surface for the module — internal storage details (localStorage, IndexedDB, etc.) stay private to the module.

## Merging a new Bolt.new-built module

When bringing in a module built externally (e.g. in Bolt.new), work through this checklist before merging:

- [ ] Module code lives entirely under `src/modules/<name>/` — no files added outside that folder except route/nav registration (see below).
- [ ] All records use the shared `TrackableItem` interface from `src/core/types.ts` (no duplicate/local type definition).
- [ ] IDs are generated via `generateId()` from `src/core/idUtils.ts`.
- [ ] Module's storage is namespaced as `app-<name>` and does not touch other modules' data.
- [ ] All dates are ISO strings, never `Date` objects or numbers.
- [ ] Data layer exposes exactly `getAll`, `create`, `update`, `remove`, `getUpcoming` with the signatures above.
- [ ] Module exports a single default page component (e.g. `src/modules/<name>/<Name>.tsx`) suitable for use as a route element.
- [ ] Route added to `src/App.tsx` (`<Route path="/<name>" element={<Name />} />`).
- [ ] Nav entry added to `src/core/navConfig.ts` (`{ path: '/<name>', label: '<Label>', icon: '<emoji>' }`) — this drives both the sidebar and bottom nav automatically.
- [ ] No hardcoded colors/fonts that fight the shell's light/dark theming (`src/index.css` variables).
- [ ] `npm run build` passes with no type errors.
- [ ] Module works standalone at both mobile (<768px, bottom nav) and desktop (≥768px, sidebar) widths.
