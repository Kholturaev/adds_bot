import { AdStatus } from "@adds-bot/shared";
import { z } from "zod";

export const adIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listAdsQuerySchema = z.object({
  status: z.nativeEnum(AdStatus).optional(),
  today: z.preprocess((value) => {
    const raw = Array.isArray(value) ? value[0] : value;

    if (raw === undefined || raw === null || raw === "") {
      return undefined;
    }

    if (typeof raw === "boolean") {
      return raw;
    }

    if (typeof raw === "string") {
      const normalized = raw.trim().toLowerCase();
      if (normalized === "true" || normalized === "1") {
        return true;
      }
      if (normalized === "false" || normalized === "0") {
        return false;
      }
    }

    return raw;
  }, z.boolean().optional()),
});

export const updateAdSchema = z.object({
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  advertisingPlanId: z.string().uuid().optional(),
  imageUrl: z.string().min(1).optional(),
  fieldValues: z
    .array(
      z.object({
        fieldDefinitionId: z.string().uuid(),
        valueText: z.string().nullable().optional(),
        valueNumber: z.number().nullable().optional(),
        valueJson: z.unknown().nullable().optional(),
      }),
    )
    .optional(),
});

export const rejectAdSchema = z.object({
  reason: z.string().min(3),
});

export const publishAdSchema = z.object({
  publishedToChatId: z.string().min(1).optional(),
});
