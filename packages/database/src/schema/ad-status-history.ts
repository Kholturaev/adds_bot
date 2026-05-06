import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { ads } from "./ads";

export const adStatusHistory = pgTable("ad_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  adId: uuid("ad_id")
    .notNull()
    .references(() => ads.id, { onDelete: "cascade" }),
  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  changedByAdminId: uuid("changed_by_admin_id"),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AdStatusHistoryEntry = typeof adStatusHistory.$inferSelect;
export type NewAdStatusHistoryEntry = typeof adStatusHistory.$inferInsert;
