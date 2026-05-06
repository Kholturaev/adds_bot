import {
  pgTable,
  uuid,
  customType,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { ads } from "./ads";
import { imageStorageTypeEnum } from "./enums";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const adImages = pgTable("ad_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  adId: uuid("ad_id")
    .notNull()
    .unique() // MVP: one image per ad
    .references(() => ads.id, { onDelete: "cascade" }),
  storageType: imageStorageTypeEnum("storage_type").notNull(),
  imageData: bytea("image_data"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AdImage = typeof adImages.$inferSelect;
export type NewAdImage = typeof adImages.$inferInsert;
