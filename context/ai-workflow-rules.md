# AI Workflow Rules

## Approach

Build Adds-bot incrementally with a contract-first approach. Always implement one bounded unit at a time (data model, bot flow, moderation flow, publication flow), verify it end to end, then move forward. All implementation must follow the context documents in this folder.

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large
  speculative changes
- Do not combine unrelated system boundaries in a
  single implementation step

Feature units for this project:

1. Database schema + migrations
2. Backend catalog APIs (categories, brands, requirements, plans)
3. Bot onboarding + user registration
4. Bot ad creation flow with dynamic fields
5. Admin moderation list + detail + approve/reject
6. Telegram channel publishing integration
7. Reporting and quality improvements

## When to Split Work

Split an implementation step if it combines:

- Bot conversation logic and admin UI delivery in one PR
- Catalog configuration CRUD and moderation lifecycle logic
- Schema refactor and publish integration in same change

If a change cannot be verified end to end quickly,
the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the
  context files
- If a requirement is ambiguous, resolve it in the
  relevant context file before implementing
- If a requirement is missing, add it as an open question
  in `progress-tracker.md` before continuing

Project-specific ambiguity policy:

- If Telegram copy text is missing, add placeholder key and log requirement in tracker.
- If a dynamic field type is undefined, support `text` temporarily and log follow-up.
- If publication scheduling is unclear, implement manual admin-triggered publication for MVP.

## Protected Files

Do not modify the following unless explicitly instructed:

- Generated migration history after production release.
- Third-party Telegram client internals.
- External UI library internals.

## Keeping Docs in Sync

Update the relevant context file whenever implementation
changes:

- System architecture or boundaries
- Storage model decisions
- Code conventions or standards
- Feature scope

Also update docs when:

- Ad lifecycle states change.
- Plan pricing/count rules change.
- Field validation requirements change.

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. Build/typecheck passes for changed services
5. Critical path tests (or manual checks for MVP) were executed
