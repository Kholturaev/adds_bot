# Architecture Context

## Stack

| Layer          | Technology                                      | Role                                                                         |
| -------------- | ----------------------------------------------- | ---------------------------------------------------------------------------- |
| Bot Service    | Node.js + TypeScript + Telegram Bot API library | Handles user conversation flow, validation prompts, and API calls            |
| Backend API    | Node.js + TypeScript (REST)                     | Central business logic, admin APIs, approval workflow, publish orchestration |
| Admin Frontend | TypeScript web app                              | Admin UI for ads, brands, categories, requirements, and plans                |
| Database       | PostgreSQL                                      | Persistent storage for users, ads, plans, dynamic fields, statuses           |
| Messaging      | Telegram Bot API                                | Publishes approved ads to target Telegram channel/group                      |

## System Boundaries

- `bot-service/` — Telegram state machine, multilingual prompts, per-step validation, handoff to backend.
- `backend-api/` — Domain services, approval lifecycle, publish counters, admin endpoints, persistence layer.
- `admin-panel/` — Admin workflows (review, approve/reject, CRUD management).
- `database/` — SQL schema/migrations, indexes, constraints, enum definitions, audit timestamps.
- `shared/` — Shared DTOs, enums, validation schemas, i18n keys (optional but recommended).

## Storage Model

- **PostgreSQL**: users, categories, brands, dynamic field definitions, ads, ad field values, selected advertising plan, approval status, publication events.
- **PostgreSQL (MVP image storage)**: ad image binary or URL/text payload for one image per ad in MVP.
- **Future external storage (Cloudinary planned)**: multiple ad images and media optimization.

## Auth and Access Model

- Telegram users are identified by `telegram_user_id` and tracked automatically on `/start`.
- Admin panel uses a single local account with a hardcoded/seeded username and password stored securely (bcrypt hash). No JWT, no OAuth.
- Only the admin account can approve/reject/edit/delete ads and manage taxonomy (brands/categories/requirements/plans).
- Bot users can submit new ads and resubmit rejected ads after editing.
- Bot users cannot publish or approve their own ads.

## Bot Language Rules

- Intro/welcome message before bot starts: shown in **both Uzbek and Russian**.
- All other bot messages, prompts, and field labels: **Uzbek only**.
- No runtime language switching required beyond the intro.

## Invariants

1. No ad can be published to Telegram channel/group unless `approval_status = APPROVED`.
2. Ad plan counters (`remaining_publications`) must never drop below zero.
3. Every ad references exactly one category/type and one selected plan.
4. Dynamic required fields must be validated before ad enters `PENDING_APPROVAL`.
5. User language preference must be respected for bot prompts after first selection.
6. All user and admin actions that change ad lifecycle must be timestamped.

## Service Interaction

1. Telegram User -> Bot Service: conversation and data collection.
2. Bot Service -> Backend API: create/update user draft ad, validate, finalize submission.
3. Backend API -> Database: persist entities and state transitions.
4. Admin Panel -> Backend API: moderation and configuration.
5. Backend API -> Telegram channel/group: publish approved ads.

## Ad Lifecycle States

1. `DRAFT` (user is filling form)
2. `READY_FOR_REVIEW` (user confirmed ad)
3. `PENDING_APPROVAL` (visible in admin today's ads)
4. `APPROVED` (admin approved; awaiting manual publish action)
5. `PUBLISHED_PARTIAL` (plan has remaining publish count; admin manually triggered at least once)
6. `PUBLISHED_COMPLETE` (remaining publish count reached zero)
7. `REJECTED`
8. `DELETED` (admin soft-delete recommended)
