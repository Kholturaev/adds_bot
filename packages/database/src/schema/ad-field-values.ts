import {
  pgTable,
  uuid,
  text,
  numeric,
  jsonb,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { ads } from "./ads";
import { adFieldDefinitions } from "./ad-field-definitions";

export const adFieldValues = pgTable(
  "ad_field_values",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adId: uuid("ad_id")
      .notNull()
      .references(() => ads.id, { onDelete: "cascade" }),
    fieldDefinitionId: uuid("field_definition_id")
      .notNull()
      .references(() => adFieldDefinitions.id),
    valueText: text("value_text"),
    valueNumber: numeric("value_number"),
    valueJson: jsonb("value_json"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    uniqFieldPerAd: unique().on(t.adId, t.fieldDefinitionId),
  }),
);

export type AdFieldValue = typeof adFieldValues.$inferSelect;
export type NewAdFieldValue = typeof adFieldValues.$inferInsert;
