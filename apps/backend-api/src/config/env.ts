import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../.env"),
];
const envPath = envCandidates.find((candidate) => existsSync(candidate));

if (envPath) {
  dotenv.config({ path: envPath });
}

const DEFAULT_PORT = 3001;

export const env = {
  port: Number(process.env.API_PORT ?? DEFAULT_PORT),
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
  publishTelegramBotToken: process.env.PUBLISH_TELEGRAM_BOT_TOKEN,
  publishTelegramChatId: process.env.PUBLISH_TELEGRAM_CHAT_ID,
};
