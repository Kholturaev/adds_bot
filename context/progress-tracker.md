# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Step 3 complete — Step 4 next

## Current Goal

- Step 4: Admin panel moderation MVP.

## Completed

- Project scope and business flow documented.
- Architecture boundaries and lifecycle states defined.
- Code standards and workflow rules aligned for Node.js + TypeScript + PostgreSQL.
- Admin UI context and MVP screens defined.
- Data model context added with entity-level design.
- **Step 1 done**: monorepo root config, packages/shared (enums/types), packages/database (Drizzle schema for all entities, migrate.ts, seed.ts).

## In Progress

- Step 4 prep: define admin-panel scaffold and moderation pages.

## Next Up

1. **Step 4**: admin panel moderation MVP.
2. Step 5: publication engine + plan counter decrement.
3. Step 6: hardening, QA, and release readiness.

## Resolved Decisions

- **Plan selection**: Always allowed in MVP; no payment gate.
- **Rejected ads**: Bot notifies user of rejection; user can edit and resubmit from Telegram.
- **Publication**: Manual publish button per ad in admin panel; not automatic on approve.
- **Bot language**: Intro/description shown in both Uzbek and Russian before bot starts. All subsequent bot flow is Uzbek only.
- **Admin auth**: Simple local admin only. Hardcoded or seeded username + password. No JWT, no external provider.

## Architecture Decisions

- Use separate services: bot-service, backend-api, admin-panel for clear responsibilities.
- Keep business rules centralized in backend API to avoid rule drift between bot and admin.
- Enforce approval-before-publish invariant to ensure moderation quality.
- Store one image per ad in MVP in PostgreSQL; design to extend to multiple images/cloud storage.
- Track `remaining_publications` per ad based on selected advertising plan.
- Publication is manual: admin presses a "Publish" button per ad (not triggered automatically on approve).
- Rejected ads trigger a Telegram notification to the user with a reason; user can edit and resubmit.
- Bot intro message is bilingual (Uzbek + Russian). All other bot messages are Uzbek only.
- Admin panel uses a single hardcoded/seeded admin account (username + password). No session tokens or external auth providers.

## Session Notes

- Context files are now concrete and aligned with requested business logic.
- Execution order source of truth is now `context/implementation-order.md`.
- Begin implementation with database-first approach inside monorepo Step 1.
- Step 1 quality pass complete: fixed ESLint/TypeScript/import issues in database schema and workspace TypeScript build setup.
- Local run verified: `db:generate`, `db:migrate`, and `db:seed` completed successfully against running PostgreSQL.
- Step 2 scaffold implemented: `apps/backend-api` created with Express app, admin auth middleware, common response/error shape, catalog CRUD routes/services for categories/brands/field definitions/advertising plans.
- Automated test added and passing (`admin-auth.service.test.ts`).
- Typecheck passes for monorepo after Step 2 scaffold.
- API health endpoint runs on port 3001; DB-backed endpoint check is currently blocked because PostgreSQL is not listening on local port 5432 at the moment (`ECONNREFUSED`).
- Step 3 implemented:
  - Added backend bot-flow module with endpoints for user upsert, bootstrap catalog, draft create, dynamic field collection, image upsert, preview, and submit to `PENDING_APPROVAL`.
  - Added draft submission validation for required fields/image and plan assignment with `remaining_publications` initialization.
  - Added `apps/bot-service` with Telegram polling bot flow: `/start`, language select, category/brand choose, step-by-step dynamic field collection, preview confirmation, and plan-based submit.
  - Monorepo typecheck passes including new app.
  - Existing backend tests still pass.
