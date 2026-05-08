import TelegramBot from "node-telegram-bot-api";
import {
  createDraft,
  getBootstrapData,
  getDraftFields,
  getPreview,
  saveFieldValue,
  saveImage,
  submitDraft,
  upsertTelegramUser,
  type BootstrapData,
  type DraftFieldDefinition,
} from "../backend/api-client";

type Step =
  | "IDLE"
  | "WAIT_LANGUAGE"
  | "WAIT_CATEGORY"
  | "WAIT_BRAND"
  | "WAIT_FIELD"
  | "WAIT_CONFIRM"
  | "WAIT_PLAN";

type Session = {
  step: Step;
  telegramUserId: string;
  language: "uz" | "ru";
  bootstrap?: BootstrapData;
  categoryId?: string;
  brandId?: string;
  adId?: string;
  fields: DraftFieldDefinition[];
  fieldIndex: number;
};

const sessions = new Map<number, Session>();

export function bindAdDraftFlow(bot: TelegramBot): void {
  bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = String(msg.from?.id ?? "");

    sessions.set(chatId, {
      step: "WAIT_LANGUAGE",
      telegramUserId,
      language: "uz",
      fields: [],
      fieldIndex: 0,
    });

    await bot.sendMessage(
      chatId,
      "Assalomu alaykum! Xush kelibsiz.\nЗдравствуйте! Добро пожаловать.\n\nTilni tanlang / Выберите язык:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Uzbek", callback_data: "lang:uz" },
              { text: "Русский", callback_data: "lang:ru" },
            ],
          ],
        },
      },
    );
  });

  bot.on("callback_query", async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;

    if (!chatId || !data) {
      return;
    }

    try {
      // Acknowledge immediately so Telegram does not expire callback queries.
      await bot.answerCallbackQuery(query.id);

      const session = sessions.get(chatId);
      if (!session) {
        return;
      }

      if (data.startsWith("lang:")) {
        const language = data.split(":")[1] as "uz" | "ru";
        if (language !== "uz" && language !== "ru") {
          await bot.sendMessage(
            chatId,
            "Noto'g'ri til tanlandi. / Неверный язык.",
          );
          return;
        }

        session.language = language;
        session.step = "WAIT_CATEGORY";

        await upsertTelegramUser({
          telegramUserId: session.telegramUserId,
          telegramUsername: query.from.username,
          language,
        });

        session.bootstrap = await getBootstrapData();

        await bot.sendMessage(chatId, "Bugun nima qo'shmoqchisiz?", {
          reply_markup: {
            inline_keyboard: session.bootstrap.categories.map((c) => [
              { text: c.name, callback_data: `cat:${c.id}` },
            ]),
          },
        });
      }

      if (data.startsWith("cat:") && session.step === "WAIT_CATEGORY") {
        session.categoryId = data.split(":")[1];
        session.step = "WAIT_BRAND";

        const brands = (session.bootstrap?.brands ?? []).filter(
          (b) => b.categoryId === session.categoryId,
        );

        await bot.sendMessage(chatId, "Brandni tanlang:", {
          reply_markup: {
            inline_keyboard: brands.map((b) => [
              { text: b.name, callback_data: `brand:${b.id}` },
            ]),
          },
        });
      }

      if (data.startsWith("brand:") && session.step === "WAIT_BRAND") {
        session.brandId = data.split(":")[1];

        const draft = await createDraft({
          telegramUserId: await getInternalUserId(
            session.telegramUserId,
            session.language,
            query.from.username,
          ),
          categoryId: session.categoryId!,
          brandId: session.brandId,
        });

        session.adId = draft.id;
        session.fields = await getDraftFields(draft.id);
        session.fieldIndex = 0;
        session.step = "WAIT_FIELD";

        await askCurrentField(bot, chatId, session);
      }

      if (data === "confirm:yes" && session.step === "WAIT_CONFIRM") {
        session.step = "WAIT_PLAN";
        await bot.sendMessage(chatId, "Tarifni tanlang:", {
          reply_markup: {
            inline_keyboard: (session.bootstrap?.plans ?? []).map((p) => [
              { text: p.titleUz, callback_data: `plan:${p.id}` },
            ]),
          },
        });
      }

      if (data === "confirm:no" && session.step === "WAIT_CONFIRM") {
        session.step = "WAIT_CATEGORY";
        session.adId = undefined;
        session.fields = [];
        session.fieldIndex = 0;

        await bot.sendMessage(
          chatId,
          "Qaytadan boshlaymiz. Kategoriyani tanlang:",
          {
            reply_markup: {
              inline_keyboard: (session.bootstrap?.categories ?? []).map(
                (c) => [{ text: c.name, callback_data: `cat:${c.id}` }],
              ),
            },
          },
        );
      }

      if (
        data.startsWith("plan:") &&
        session.step === "WAIT_PLAN" &&
        session.adId
      ) {
        const planId = data.split(":")[1];
        await submitDraft(session.adId, planId);
        session.step = "IDLE";
        await bot.sendMessage(
          chatId,
          "E'loningiz qabul qilindi va ko'rib chiqish navbatiga yuborildi.",
        );
      }
    } catch (error) {
      console.error("Callback processing failed:", error);
      await bot.sendMessage(
        chatId,
        "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.\nПроизошла ошибка. Попробуйте снова.",
      );
    }
  });

  bot.on("message", async (msg) => {
    if (!msg.text && !msg.photo) {
      return;
    }

    const chatId = msg.chat.id;
    const session = sessions.get(chatId);
    if (!session || session.step !== "WAIT_FIELD" || !session.adId) {
      return;
    }

    const field = session.fields[session.fieldIndex];
    if (!field) {
      return;
    }

    try {
      if (field.fieldType === "image") {
        const lastPhoto = msg.photo?.[msg.photo.length - 1];
        if (!lastPhoto) {
          await bot.sendMessage(chatId, "Iltimos, rasm yuboring.");
          return;
        }
        await saveImage(session.adId, `telegram-file:${lastPhoto.file_id}`);
      } else {
        const value = msg.text ?? "";

        if (field.fieldType === "number") {
          const normalized = parseNumericInput(value);
          if (normalized === null) {
            await bot.sendMessage(
              chatId,
              "Noto'g'ri raqam formati. Masalan: 10000000 yoki 10 000 000",
            );
            return;
          }

          await saveFieldValue(session.adId, {
            fieldDefinitionId: field.id,
            value: normalized,
          });
        } else {
          await saveFieldValue(session.adId, {
            fieldDefinitionId: field.id,
            value,
          });
        }
      }
    } catch (error) {
      console.error("Field save failed:", error);
      await bot.sendMessage(
        chatId,
        "Qiymat saqlanmadi. Iltimos, to'g'ri formatda qayta yuboring.",
      );
      return;
    }

    session.fieldIndex += 1;

    if (session.fieldIndex >= session.fields.length) {
      const preview = await getPreview(session.adId);
      session.step = "WAIT_CONFIRM";
      await bot.sendMessage(chatId, buildPreviewText(preview), {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Ha", callback_data: "confirm:yes" },
              { text: "Yo'q", callback_data: "confirm:no" },
            ],
          ],
        },
      });
      return;
    }

    await askCurrentField(bot, chatId, session);
  });
}

async function askCurrentField(
  bot: TelegramBot,
  chatId: number,
  session: Session,
): Promise<void> {
  const field = session.fields[session.fieldIndex];
  if (!field) {
    return;
  }

  let suffix = "";
  if (field.fieldType === "number") {
    suffix = " (faqat raqam, masalan: 10000000)";
  }

  await bot.sendMessage(chatId, `${field.labelUz}${suffix}:`);
}

function buildPreviewText(preview: {
  category: { name: string } | null;
  brand: { name: string } | null;
  values: Array<{
    labelUz: string;
    valueText: string | null;
    valueNumber: string | null;
  }>;
}): string {
  const lines = [
    "E'lon preview:",
    `Kategoriya: ${preview.category?.name ?? "-"}`,
    `Brand: ${preview.brand?.name ?? "-"}`,
    "",
    ...preview.values.map(
      (v) => `${v.labelUz}: ${v.valueText ?? v.valueNumber ?? "-"}`,
    ),
    "",
    "Hammasi to'g'rimi?",
  ];

  return lines.join("\n");
}

async function getInternalUserId(
  telegramUserId: string,
  language: "uz" | "ru",
  username?: string,
): Promise<string> {
  const user = await upsertTelegramUser({
    telegramUserId,
    language,
    telegramUsername: username,
  });

  return user.id;
}

function parseNumericInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // Accept common human input formats: spaces, commas, apostrophes, trailing dot.
  const compact = trimmed.replace(/[\s,_']/g, "").replace(/\.$/, "");
  if (!/^-?\d+(\.\d+)?$/.test(compact)) {
    return null;
  }

  const value = Number(compact);
  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}
