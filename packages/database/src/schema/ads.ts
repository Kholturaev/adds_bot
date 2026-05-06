import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { telegramUsers } from "./telegram-users";
import { categories } from "./categories";
import { brands } from "./brands";
import { advertisingPlans } from "./advertising-plans";
import { adStatusEnum } from "./enums";
import { AdStatus } from "@adds-bot/shared";

export const ads = pgTable("ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  telegramUserId: uuid("telegram_user_id")
    .notNull()
    .references(() => telegramUsers.id),
  categoryId: uuid("category_id").references(() => categories.id),
  brandId: uuid("brand_id").references(() => brands.id),
  advertisingPlanId: uuid("advertising_plan_id").references(
    () => advertisingPlans.id,
  ),
  status: adStatusEnum("status").notNull().default(AdStatus.DRAFT),
  remainingPublications: integer("remaining_publications").notNull().default(0),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Ad = typeof ads.$inferSelect;
export type NewAd = typeof ads.$inferInsert;
