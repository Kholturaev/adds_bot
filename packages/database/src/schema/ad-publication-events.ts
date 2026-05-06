import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { ads } from "./ads";

export const adPublicationEvents = pgTable("ad_publication_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  adId: uuid("ad_id")
    .notNull()
    .references(() => ads.id, { onDelete: "cascade" }),
  publishedToChatId: text("published_to_chat_id").notNull(),
  telegramMessageId: text("telegram_message_id"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  remainingPublicationsAfter: integer("remaining_publications_after").notNull(),
});

export type AdPublicationEvent = typeof adPublicationEvents.$inferSelect;
export type NewAdPublicationEvent = typeof adPublicationEvents.$inferInsert;
