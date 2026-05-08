import TelegramBot from "node-telegram-bot-api";
import { env } from "./config/env";
import { bindAdDraftFlow } from "./flows/ad-draft.flow";

const bot = new TelegramBot(env.botToken, { polling: true });

bindAdDraftFlow(bot);

console.log("bot-service started");
