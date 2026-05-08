import { HttpError } from "../../common/http-error";

type PublishMessageInput = {
  botToken?: string;
  chatId?: string;
  text: string;
};

type TelegramSendMessageResponse = {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
};

export async function publishMessageToTelegram(
  input: PublishMessageInput,
): Promise<{ chatId: string; telegramMessageId: string }> {
  const botToken = input.botToken?.trim();
  const chatId = input.chatId?.trim();

  if (!botToken || !chatId) {
    throw new HttpError(
      500,
      "PUBLISH_CONFIG_MISSING",
      "Telegram publish configuration is missing",
    );
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: input.text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    },
  );

  const body = (await response.json()) as TelegramSendMessageResponse;

  if (!response.ok || !body.ok || !body.result?.message_id) {
    throw new HttpError(
      502,
      "TELEGRAM_PUBLISH_FAILED",
      body.description ?? "Failed to publish message to Telegram",
    );
  }

  return {
    chatId,
    telegramMessageId: String(body.result.message_id),
  };
}
