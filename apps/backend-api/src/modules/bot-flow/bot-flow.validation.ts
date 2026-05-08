import { z } from "zod";
import { FieldType, UserLanguage } from "@adds-bot/shared";

export const upsertTelegramUserSchema = z.object({
  telegramUserId: z.string().regex(/^\d+$/),
  telegramUsername: z.string().min(1).optional(),
  phoneNumber: z.string().min(3).optional(),
  language: z.nativeEnum(UserLanguage),
});

export const createDraftSchema = z.object({
  telegramUserId: z.string().uuid(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid(),
});

export const adIdParamSchema = z.object({
  adId: z.string().uuid(),
});

export const upsertFieldValueSchema = z.object({
  fieldDefinitionId: z.string().uuid(),
  value: z.union([z.string(), z.number(), z.array(z.string())]),
});

export const upsertImageSchema = z.object({
  imageUrl: z.string().min(1),
});

export const submitDraftSchema = z.object({
  advertisingPlanId: z.string().uuid(),
});

export const fieldTypeValueSchema = z.object({
  fieldType: z.nativeEnum(FieldType),
});
