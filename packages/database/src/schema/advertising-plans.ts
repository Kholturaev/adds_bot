import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const advertisingPlans = pgTable("advertising_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  titleUz: text("title_uz").notNull(),
  titleRu: text("title_ru").notNull(),
  priceUzs: integer("price_uzs").notNull(),
  totalPublications: integer("total_publications").notNull(),
  intervalDays: integer("interval_days"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AdvertisingPlan = typeof advertisingPlans.$inferSelect;
export type NewAdvertisingPlan = typeof advertisingPlans.$inferInsert;
