import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { brands } from "./brands";
import { fieldTypeEnum } from "./enums";

export const adFieldDefinitions = pgTable("ad_field_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => categories.id),
  brandId: uuid("brand_id").references(() => brands.id),
  key: text("key").notNull(),
  labelUz: text("label_uz").notNull(),
  labelRu: text("label_ru").notNull(),
  fieldType: fieldTypeEnum("field_type").notNull(),
  isRequired: boolean("is_required").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  optionsJson: jsonb("options_json"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AdFieldDefinition = typeof adFieldDefinitions.$inferSelect;
export type NewAdFieldDefinition = typeof adFieldDefinitions.$inferInsert;
