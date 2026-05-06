import {
  adFieldDefinitions,
  advertisingPlans,
  brands,
  categories,
  db,
} from "@adds-bot/database";
import { eq } from "drizzle-orm";
import {
  createAdvertisingPlanSchema,
  createBrandSchema,
  createCategorySchema,
  createFieldDefinitionSchema,
  updateAdvertisingPlanSchema,
  updateBrandSchema,
  updateCategorySchema,
  updateFieldDefinitionSchema,
} from "./catalog.validation";
import { HttpError } from "../../common/http-error";

export async function listCategories() {
  return db.select().from(categories);
}

export async function createCategory(input: unknown) {
  const data = createCategorySchema.parse(input);
  const [created] = await db
    .insert(categories)
    .values({
      name: data.name,
      isActive: data.isActive ?? true,
    })
    .returning();

  return created;
}

export async function updateCategory(id: string, input: unknown) {
  const data = updateCategorySchema.parse(input);

  const [updated] = await db
    .update(categories)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();

  if (!updated) {
    throw new HttpError(404, "NOT_FOUND", "Category not found");
  }

  return updated;
}

export async function deleteCategory(id: string) {
  const [deleted] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();

  if (!deleted) {
    throw new HttpError(404, "NOT_FOUND", "Category not found");
  }

  return deleted;
}

export async function listBrands() {
  return db.select().from(brands);
}

export async function createBrand(input: unknown) {
  const data = createBrandSchema.parse(input);
  const [created] = await db
    .insert(brands)
    .values({
      categoryId: data.categoryId,
      name: data.name,
      isActive: data.isActive ?? true,
    })
    .returning();

  return created;
}

export async function updateBrand(id: string, input: unknown) {
  const data = updateBrandSchema.parse(input);

  const [updated] = await db
    .update(brands)
    .set({
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      updatedAt: new Date(),
    })
    .where(eq(brands.id, id))
    .returning();

  if (!updated) {
    throw new HttpError(404, "NOT_FOUND", "Brand not found");
  }

  return updated;
}

export async function deleteBrand(id: string) {
  const [deleted] = await db
    .delete(brands)
    .where(eq(brands.id, id))
    .returning();

  if (!deleted) {
    throw new HttpError(404, "NOT_FOUND", "Brand not found");
  }

  return deleted;
}

export async function listFieldDefinitions() {
  return db.select().from(adFieldDefinitions);
}

export async function createFieldDefinition(input: unknown) {
  const data = createFieldDefinitionSchema.parse(input);

  const [created] = await db
    .insert(adFieldDefinitions)
    .values({
      categoryId: data.categoryId ?? null,
      brandId: data.brandId ?? null,
      key: data.key,
      labelUz: data.labelUz,
      labelRu: data.labelRu,
      fieldType: data.fieldType,
      isRequired: data.isRequired ?? true,
      sortOrder: data.sortOrder ?? 0,
      optionsJson: data.optionsJson,
      isActive: data.isActive ?? true,
    })
    .returning();

  return created;
}

export async function updateFieldDefinition(id: string, input: unknown) {
  const data = updateFieldDefinitionSchema.parse(input);

  const [updated] = await db
    .update(adFieldDefinitions)
    .set({
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.brandId !== undefined ? { brandId: data.brandId } : {}),
      ...(data.key !== undefined ? { key: data.key } : {}),
      ...(data.labelUz !== undefined ? { labelUz: data.labelUz } : {}),
      ...(data.labelRu !== undefined ? { labelRu: data.labelRu } : {}),
      ...(data.fieldType !== undefined ? { fieldType: data.fieldType } : {}),
      ...(data.isRequired !== undefined ? { isRequired: data.isRequired } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      ...(data.optionsJson !== undefined
        ? { optionsJson: data.optionsJson }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      updatedAt: new Date(),
    })
    .where(eq(adFieldDefinitions.id, id))
    .returning();

  if (!updated) {
    throw new HttpError(404, "NOT_FOUND", "Field definition not found");
  }

  return updated;
}

export async function deleteFieldDefinition(id: string) {
  const [deleted] = await db
    .delete(adFieldDefinitions)
    .where(eq(adFieldDefinitions.id, id))
    .returning();

  if (!deleted) {
    throw new HttpError(404, "NOT_FOUND", "Field definition not found");
  }

  return deleted;
}

export async function listAdvertisingPlans() {
  return db.select().from(advertisingPlans);
}

export async function createAdvertisingPlan(input: unknown) {
  const data = createAdvertisingPlanSchema.parse(input);
  const [created] = await db
    .insert(advertisingPlans)
    .values({
      code: data.code,
      titleUz: data.titleUz,
      titleRu: data.titleRu,
      priceUzs: data.priceUzs,
      totalPublications: data.totalPublications,
      intervalDays: data.intervalDays ?? null,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning();

  return created;
}

export async function updateAdvertisingPlan(id: string, input: unknown) {
  const data = updateAdvertisingPlanSchema.parse(input);
  const [updated] = await db
    .update(advertisingPlans)
    .set({
      ...(data.code !== undefined ? { code: data.code } : {}),
      ...(data.titleUz !== undefined ? { titleUz: data.titleUz } : {}),
      ...(data.titleRu !== undefined ? { titleRu: data.titleRu } : {}),
      ...(data.priceUzs !== undefined ? { priceUzs: data.priceUzs } : {}),
      ...(data.totalPublications !== undefined
        ? { totalPublications: data.totalPublications }
        : {}),
      ...(data.intervalDays !== undefined
        ? { intervalDays: data.intervalDays }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      updatedAt: new Date(),
    })
    .where(eq(advertisingPlans.id, id))
    .returning();

  if (!updated) {
    throw new HttpError(404, "NOT_FOUND", "Advertising plan not found");
  }

  return updated;
}

export async function deleteAdvertisingPlan(id: string) {
  const [deleted] = await db
    .delete(advertisingPlans)
    .where(eq(advertisingPlans.id, id))
    .returning();

  if (!deleted) {
    throw new HttpError(404, "NOT_FOUND", "Advertising plan not found");
  }

  return deleted;
}
