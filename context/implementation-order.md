# Implementation Order (Monorepo)

This file defines the build order for Adds-bot in a monorepo and the expected check-and-submit result after each step.

## Monorepo Layout (Target)

1. apps/backend-api
2. apps/bot-service
3. apps/admin-panel
4. packages/shared
5. packages/database
6. infra (optional later)

## Delivery Steps

### Step 1: Monorepo Foundation + Database First

Goal:

- Initialize monorepo structure, workspace tooling, shared TypeScript config, lint/test scripts.
- Implement initial PostgreSQL schema and migrations from data-model context.

Why first:

- All services depend on stable entities, enums, and relations.

Check before submit:

1. Workspace install works from root.
2. Database migrations run successfully on clean DB.
3. Seed data for categories/brands/plans is applied.
4. Basic DB health script or command passes.

Submit result:

- Monorepo initialized.
- Core schema is live and versioned.

### Step 2: Backend API Core (No UI Yet)

Goal:

- Build backend-api base architecture and catalog CRUD APIs:
  categories, brands, ad field definitions, advertising plans.
- Add admin auth guard skeleton and common error/response format.

Check before submit:

1. API boots and connects to DB.
2. CRUD endpoints for catalog modules work.
3. Validation and error response format are consistent.
4. Automated tests for core service methods pass.

Submit result:

- Stable backend core for both bot and admin-panel.

### Step 3: Bot Service Onboarding + Draft Flow (MVP Path)

Goal:

- Implement Telegram /start flow, language selection, user upsert.
- Implement step-by-step ad draft creation using backend APIs.
- Include preview and final confirmation with plan selection.

Check before submit:

1. New Telegram user is saved with language.
2. Draft ad can be created end-to-end up to pending approval.
3. Required field validation blocks invalid submissions.
4. One image upload is persisted in MVP format.

Submit result:

- User can fully submit ad from Telegram into review queue.

### Step 4: Admin Panel Moderation MVP

Goal:

- Implement login (selected auth strategy), dashboard, queue list, ad details.
- Implement approve/reject/edit/delete actions.

Check before submit:

1. Pending ads are visible and sortable by date (today's ads supported).
2. Admin can update ad data and change status.
3. Status history is persisted.
4. Catalog management screens connect to backend CRUD.

Submit result:

- Full moderation workflow operational.

### Step 5: Publication Engine + Plan Counter Logic

Goal:

- Implement publishing from backend to Telegram channel/group.
- Implement remaining publication decrement and completion transitions.

Check before submit:

1. Approved ad publishes successfully.
2. Publication event is stored.
3. Remaining publication never goes below zero.
4. Ad transitions to partial/complete published correctly.

Submit result:

- Ads can be published according to selected plan rules.

### Step 6: Hardening, QA, and Release Readiness

Goal:

- Add integration tests, logging polish, retries, idempotency checks, and docs.

Check before submit:

1. Critical flow tests pass (bot submit -> admin approve -> publish).
2. Lint/typecheck/tests pass for all apps/packages.
3. Open questions are resolved or documented with decisions.

Submit result:

- MVP is stable for controlled production rollout.

## Where To Begin Now

Start with Step 1.

Immediate first tasks:

1. Create root workspace config and package boundaries.
2. Setup packages/database with migration tool and initial schema.
3. Add shared enums/types in packages/shared matching DB enums.
4. Run migration + seed locally and verify.

Only after Step 1 submit, move to Step 2.
