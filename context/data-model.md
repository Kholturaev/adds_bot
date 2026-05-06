# Data Model Context

## Purpose

This document defines core PostgreSQL entities for Adds-bot MVP and their relationships.

## Core Entities

### TelegramUser

Tracks bot users.

- `id` (uuid, pk)
- `telegram_user_id` (bigint, unique, required)
- `telegram_username` (text, nullable)
- `phone_number` (text, nullable)
- `language` (enum: `uz`, `ru`, default `uz`)
- `created_at`, `updated_at`

### Category

High-level ad type such as Phone, Computer, Watch.

- `id` (uuid, pk)
- `name` (text, unique)
- `is_active` (boolean)
- `created_at`, `updated_at`

### Brand

Brand belongs to a category (e.g., Phone -> iPhone, Samsung).

- `id` (uuid, pk)
- `category_id` (fk -> Category.id)
- `name` (text)
- `is_active` (boolean)
- `created_at`, `updated_at`
- Unique constraint: (`category_id`, `name`)

### AdFieldDefinition

Dynamic field definitions by category/brand.

- `id` (uuid, pk)
- `category_id` (fk -> Category.id, nullable)
- `brand_id` (fk -> Brand.id, nullable)
- `key` (text, required, machine-friendly)
- `label_uz` (text, required)
- `label_ru` (text, required)
- `field_type` (enum: `text`, `number`, `select`, `phone`, `telegram`, `image`)
- `is_required` (boolean)
- `sort_order` (int)
- `options_json` (jsonb, nullable for select options)
- `is_active` (boolean)
- `created_at`, `updated_at`

Notes:

- If `brand_id` is set, definition is brand-specific override.
- If only `category_id` is set, definition is category-level default.

### AdvertisingPlan

Configurable ad plan options shown after user confirms post.

- `id` (uuid, pk)
- `code` (text, unique)
- `title_uz` (text)
- `title_ru` (text)
- `price_uzs` (int)
- `total_publications` (int)
- `interval_days` (int, nullable; example: 3 for "2 times in each 3 days")
- `is_active` (boolean)
- `sort_order` (int)
- `created_at`, `updated_at`

MVP seed examples:

1. one_time: 20_000 UZS, publications 1
2. two_times_3_days: 25_000 UZS, publications 2, interval 3
3. three_times: 30_000 UZS, publications 3

### Ad

Main ad record.

- `id` (uuid, pk)
- `telegram_user_id` (fk -> TelegramUser.id)
- `category_id` (fk -> Category.id)
- `brand_id` (fk -> Brand.id)
- `advertising_plan_id` (fk -> AdvertisingPlan.id)
- `status` (enum: `DRAFT`, `READY_FOR_REVIEW`, `PENDING_APPROVAL`, `APPROVED`, `PUBLISHED_PARTIAL`, `PUBLISHED_COMPLETE`, `REJECTED`, `DELETED`)
- `remaining_publications` (int)
- `submitted_at` (timestamp, nullable)
- `approved_at` (timestamp, nullable)
- `rejected_at` (timestamp, nullable)
- `created_at`, `updated_at`

Rules:

- On plan selection and submit, set `remaining_publications = AdvertisingPlan.total_publications`.
- Publishing decrements `remaining_publications` until 0.

### AdFieldValue

Stores user-provided dynamic values for an ad.

- `id` (uuid, pk)
- `ad_id` (fk -> Ad.id)
- `field_definition_id` (fk -> AdFieldDefinition.id)
- `value_text` (text, nullable)
- `value_number` (numeric, nullable)
- `value_json` (jsonb, nullable)
- `created_at`, `updated_at`

Constraint:

- Unique (`ad_id`, `field_definition_id`)

### AdImage (MVP: single row)

Stores image reference for ad. MVP uses one image per ad.

- `id` (uuid, pk)
- `ad_id` (fk -> Ad.id)
- `storage_type` (enum: `db`, `url`)
- `image_data` (bytea, nullable)
- `image_url` (text, nullable)
- `created_at`

Constraint:

- Unique (`ad_id`) for MVP single-image rule.

### AdPublicationEvent

Tracks each publication action.

- `id` (uuid, pk)
- `ad_id` (fk -> Ad.id)
- `published_to_chat_id` (text)
- `telegram_message_id` (text, nullable)
- `published_at` (timestamp)
- `remaining_publications_after` (int)

### AdStatusHistory

Audit trail for moderation and lifecycle transitions.

- `id` (uuid, pk)
- `ad_id` (fk -> Ad.id)
- `from_status` (text)
- `to_status` (text)
- `changed_by_admin_id` (uuid, nullable)
- `reason` (text, nullable)
- `created_at` (timestamp)

## Key Indexes

- `TelegramUser.telegram_user_id` unique index.
- `Ad.status, Ad.created_at` composite index for admin queue.
- `Ad.telegram_user_id, Ad.created_at` for user history lookups.
- `AdPublicationEvent.ad_id, published_at` for publish history.

## Initial Migration Notes

1. Create enums first.
2. Create base taxonomy tables (`Category`, `Brand`, `AdFieldDefinition`, `AdvertisingPlan`).
3. Create user and ad tables.
4. Add child tables (`AdFieldValue`, `AdImage`, `AdPublicationEvent`, `AdStatusHistory`).
5. Seed initial plans and phone brands.
