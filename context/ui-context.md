# UI Context

## Theme

Admin panel uses a light, clean operations dashboard style with strong status visibility: neutral base, high-contrast text, and clear semantic colors for moderation actions (approve/reject/pending). Mobile and desktop layouts must both be supported.

## Colors

Define design tokens in `:root` and consume only token variables in components.

| Role            | CSS Variable       | Value     |
| --------------- | ------------------ | --------- |
| Page background | `--bg-base`        | `#f5f7fb` |
| Surface         | `--bg-surface`     | `#ffffff` |
| Primary text    | `--text-primary`   | `#111827` |
| Muted text      | `--text-muted`     | `#6b7280` |
| Primary accent  | `--accent-primary` | `#0f766e` |
| Border          | `--border-default` | `#d1d5db` |
| Error           | `--state-error`    | `#b91c1c` |
| Success         | `--state-success`  | `#15803d` |
| Warning         | `--state-warning`  | `#b45309` |

## Typography

| Role      | Font          | Variable      |
| --------- | ------------- | ------------- |
| UI text   | IBM Plex Sans | `--font-sans` |
| Code/mono | IBM Plex Mono | `--font-mono` |

## Border Radius

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-md`  |
| Cards / panels    | `rounded-xl`  |
| Modals / overlays | `rounded-2xl` |

## Component Library

Use a reusable component system (table, form field, status badge, modal, confirmation dialog). Prioritize consistency for moderation actions and dynamic form builders.

## Layout Patterns

- Main layout: top navbar + left navigation + responsive content area.
- Moderation list: sortable/filterable table with status chips and quick actions.
- Ad detail page: two-column desktop layout, stacked mobile layout.
- Dynamic requirements manager: list/table + inline edit modal.
- Confirm/reject actions must always include explicit confirmation dialog.

## Icons

Use one consistent icon set (stroke style). Suggested sizes: `16px` inline text, `18-20px` in buttons, `24px` in page headers.

## Admin Screens (MVP)

1. Login page
2. Dashboard (today's ads, pending count, approved count)
3. Ads queue list
4. Ad details + edit + approve/reject
5. Categories and brands management
6. Dynamic requirements management
7. Advertising plans management
