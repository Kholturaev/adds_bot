# Code Standards 

## General

- Keep each service module single-purpose (bot flow, domain service, repository, controller).
- Prefer explicit domain names: `Ad`, `Brand`, `Category`, `Plan`, `AdFieldDefinition`.
- Fix causes, not symptoms; avoid hidden fallback logic for required business rules.
- Business logic belongs in backend domain layer, not in controllers or Telegram handlers.

## TypeScript

- Strict TypeScript required (`strict: true`, `noImplicitAny: true`).
- Avoid `any`; define DTOs, domain types, and discriminated unions for ad steps.
- Validate all external input at boundaries (Telegram updates, admin requests).
- Use runtime validation library (Zod/Valibot/Joi) for request and step payloads.
- Use enums/constants for ad statuses and plan types to avoid magic strings.

## Node Services

- Backend route handlers should remain thin: parse, validate, call domain service, return response.
- Bot update handlers should map update -> intent -> step action; no DB queries directly in handler.
- All DB access goes through repository/data access layer.
- Use structured logs with request/ad/user context identifiers.

## Styling

- Admin panel must use design tokens from `ui-context.md`.
- No hardcoded colors inside components except token definitions.
- Reusable form/table/status badge components required for moderation screens.

## API Routes

- Validate every payload before logic.
- Enforce admin auth for moderation/configuration endpoints.
- Use consistent response shape: `{ success, data, error }`.
- Use idempotent behavior where possible (especially publish actions).
- Return domain error codes for predictable bot/admin handling.

## Data and Storage

- PostgreSQL is source of truth for all entities and lifecycle transitions.
- Use foreign keys and constraints to enforce integrity.
- Use transactions for multi-step state changes (approve + publication event update).
- MVP stores one image with ad record; design schema to support future one-to-many images.

## File Organization

- `bot-service/src/handlers/` — Telegram update entry points.
- `bot-service/src/flows/` — Step-by-step ad creation finite state flow.
- `backend-api/src/modules/ads/` — Ad domain logic, controllers, repositories.
- `backend-api/src/modules/admin/` — Moderation and configuration endpoints.
- `backend-api/src/modules/catalog/` — Categories, brands, dynamic requirement management.
- `admin-panel/src/pages/` — Screens for queue, detail, settings.
- `admin-panel/src/components/` — Reusable UI components.

## Testing Expectations

- Unit tests for ad lifecycle transitions and plan counter decrement logic.
- Integration tests for approval -> publish flow.
- Contract tests for bot-service to backend-api payloads.
- Validate multilingual message key existence for Uzbek and Russian before release.
