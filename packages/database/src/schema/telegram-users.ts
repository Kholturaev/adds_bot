import { pgTable, uuid, bigint, text, timestamp } from "drizzle-orm/pg-core";
import { userLanguageEnum } from "./enums";
import { UserLanguage } from "@adds-bot/shared";

export const telegramUsers = pgTable("telegram_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  telegramUserId: bigint("telegram_user_id", { mode: "bigint" })
    .notNull()
    .unique(),
  telegramUsername: text("telegram_username"),
  phoneNumber: text("phone_number"),
  language: userLanguageEnum("language").notNull().default(UserLanguage.UZ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type TelegramUser = typeof telegramUsers.$inferSelect;
export type NewTelegramUser = typeof telegramUsers.$inferInsert;
