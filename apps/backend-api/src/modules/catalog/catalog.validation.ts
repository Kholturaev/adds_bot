import { z } from "zod";
import { FieldType } from "@adds-bot/shared";

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export const createBrandSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2),
  isActive: z.boolean().optional(),
});

export const updateBrandSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export const createFieldDefinitionSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  key: z.string().min(2),
  labelUz: z.string().min(1),
  labelRu: z.string().min(1),
  fieldType: z.nativeEnum(FieldType),
  isRequired: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  optionsJson: z.unknown().optional(),
  isActive: z.boolean().optional(),
});

export const updateFieldDefinitionSchema =
  createFieldDefinitionSchema.partial();

export const createAdvertisingPlanSchema = z.object({
  code: z.string().min(2),
  titleUz: z.string().min(1),
  titleRu: z.string().min(1),
  priceUzs: z.number().int().positive(),
  totalPublications: z.number().int().positive(),
  intervalDays: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateAdvertisingPlanSchema =
  createAdvertisingPlanSchema.partial();
