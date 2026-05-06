# Adds-bot

## Overview

Adds-bot is a Telegram-based classifieds publishing system for devices (phone, watch, laptop, and future categories), with an admin panel and backend API. Users submit ads step by step in Telegram (Uzbek and Russian), admins review/approve/reject in web admin panel, and approved ads are published to a Telegram channel/group and stored in PostgreSQL.

## Goals

1. Provide a simple multilingual Telegram flow to create a device ad with validated input.
2. Ensure every ad is persisted in PostgreSQL and cannot be published without admin approval.
3. Let admins manage categories, brands, dynamic form requirements, pricing plans, and ad lifecycle.

## Core User Flow

1. User opens bot and presses `/start`.
2. Bot shows language-aware intro text (Uzbek/Russian) and creates or updates Telegram user record.
3. Bot asks: "What do you want to add today?" with item type choices (initially Phone, Computer; extensible).
4. User selects type, then selects category/brand (for Phone: iPhone, Samsung, Oppo, Redmi, Poco; extensible).
5. Bot asks required fields step by step based on selected type/brand dynamic schema.
6. User uploads required image count (current MVP: exactly 1 image).
7. Bot shows preview summary and asks "Is everything correct?" (Yes/No).
8. On Yes, bot asks user to select advertising plan.
9. Ad is saved in database as pending approval and appears in admin panel under today's ads.
10. Admin reviews, edits if needed, and approves or rejects.
11. If approved, backend publishes ad to Telegram channel/group and updates publication counters/status.

## Features

### Telegram Bot

- Uzbek and Russian UX copy.
- User onboarding and profile capture (telegram id, username, phone if provided/shared).
- Step-by-step ad creation conversation with validation.
- Dynamic fields by category/brand/type.
- Ad preview and confirmation.
- Advertising plan selection with configurable pricing.

### Backend API + Admin Panel

- Admin authentication and role-based access.
- CRUD for categories, brands, dynamic requirements (fields), advertising plans.
- Ad queue management: list, detail, edit, approve, reject, delete.
- "Today's ads" view ordered by creation date.
- Publication controls based on selected plan and remaining publish count.

### Data + Delivery

- PostgreSQL as source of truth for users, ads, requirements, plans, and status history.
- Integration to Telegram channel/group publishing after admin approval.
- Image storage in DB for MVP; later migration path to cloud storage (Cloudinary).

## Scope

### In Scope

- One Telegram bot service.
- One backend API service.
- One admin frontend.
- PostgreSQL schema and migrations for all core entities.
- Single image per ad in MVP.
- Plan-based publish counters and admin-triggered publishing.

### Out of Scope

- Payment gateway integration (plans are selectable but payment is managed outside system in MVP).
- End-user self-service editing of already submitted ads after approval.
- Multi-image cloud storage integration in MVP (planned later).

## Success Criteria

1. A new Telegram user can complete ad creation in chosen language and sees a final preview before submit.
2. Submitted ads always appear in admin queue with full details and selected plan.
3. Approved ads can be published to Telegram channel/group, with remaining publish count correctly decremented until zero.
