import {
  adFieldDefinitions,
  adFieldValues,
  adImages,
  adStatusHistory,
  ads,
  advertisingPlans,
  brands,
  categories,
  db,
  telegramUsers,
} from "@adds-bot/database";
import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";
import { AdStatus, FieldType, ImageStorageType } from "@adds-bot/shared";
import { HttpError } from "../../common/http-error";
import {
  createDraftSchema,
  submitDraftSchema,
  upsertFieldValueSchema,
  upsertImageSchema,
  upsertTelegramUserSchema,
} from "./bot-flow.validation";

export async function upsertTelegramUser(input: unknown) {
  const data = upsertTelegramUserSchema.parse(input);

  const [user] = await db
    .insert(telegramUsers)
    .values({
      telegramUserId: BigInt(data.telegramUserId),
      telegramUsername: data.telegramUsername,
      phoneNumber: data.phoneNumber,
      language: data.language,
    })
    .onConflictDoUpdate({
      target: telegramUsers.telegramUserId,
      set: {
        telegramUsername: data.telegramUsername,
        phoneNumber: data.phoneNumber,
        language: data.language,
        updatedAt: new Date(),
      },
    })
    .returning({ id: telegramUsers.id });

  return { id: user.id };
}

export async function getBootstrapData() {
  const [activeCategories, activePlans] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.name)),
    db
      .select()
      .from(advertisingPlans)
      .where(eq(advertisingPlans.isActive, true))
      .orderBy(
        asc(advertisingPlans.sortOrder),
        asc(advertisingPlans.createdAt),
      ),
  ]);

  const activeBrands = await db
    .select()
    .from(brands)
    .where(eq(brands.isActive, true))
    .orderBy(asc(brands.name));

  return {
    categories: activeCategories,
    brands: activeBrands,
    plans: activePlans,
  };
}

export async function createDraft(input: unknown) {
  const data = createDraftSchema.parse(input);

  const [brand] = await db
    .select()
    .from(brands)
    .where(eq(brands.id, data.brandId))
    .limit(1);

  if (!brand) {
    throw new HttpError(404, "NOT_FOUND", "Brand not found");
  }

  if (brand.categoryId !== data.categoryId) {
    throw new HttpError(
      400,
      "INVALID_BRAND",
      "Brand does not belong to category",
    );
  }

  const [draft] = await db
    .insert(ads)
    .values({
      telegramUserId: data.telegramUserId,
      categoryId: data.categoryId,
      brandId: data.brandId,
      status: AdStatus.DRAFT,
      remainingPublications: 0,
    })
    .returning();

  return draft;
}

export async function getDraftFields(adId: string) {
  const [draft] = await db.select().from(ads).where(eq(ads.id, adId)).limit(1);

  if (!draft) {
    throw new HttpError(404, "NOT_FOUND", "Draft ad not found");
  }

  const fields = await db
    .select()
    .from(adFieldDefinitions)
    .where(
      and(
        eq(adFieldDefinitions.isActive, true),
        or(
          and(
            eq(adFieldDefinitions.categoryId, draft.categoryId!),
            isNull(adFieldDefinitions.brandId),
          ),
          eq(adFieldDefinitions.brandId, draft.brandId!),
        ),
      ),
    )
    .orderBy(
      asc(adFieldDefinitions.sortOrder),
      asc(adFieldDefinitions.createdAt),
    );

  return fields;
}

export async function upsertDraftFieldValue(adId: string, input: unknown) {
  const data = upsertFieldValueSchema.parse(input);

  const [fieldDef] = await db
    .select()
    .from(adFieldDefinitions)
    .where(eq(adFieldDefinitions.id, data.fieldDefinitionId))
    .limit(1);

  if (!fieldDef) {
    throw new HttpError(404, "NOT_FOUND", "Field definition not found");
  }

  const valuePayload = mapValueByFieldType(fieldDef.fieldType, data.value);

  const [row] = await db
    .insert(adFieldValues)
    .values({
      adId,
      fieldDefinitionId: data.fieldDefinitionId,
      ...valuePayload,
    })
    .onConflictDoUpdate({
      target: [adFieldValues.adId, adFieldValues.fieldDefinitionId],
      set: {
        ...valuePayload,
        updatedAt: new Date(),
      },
    })
    .returning();

  return row;
}

export async function upsertDraftImage(adId: string, input: unknown) {
  const data = upsertImageSchema.parse(input);

  const [row] = await db
    .insert(adImages)
    .values({
      adId,
      storageType: ImageStorageType.URL,
      imageUrl: data.imageUrl,
    })
    .onConflictDoUpdate({
      target: adImages.adId,
      set: {
        storageType: ImageStorageType.URL,
        imageUrl: data.imageUrl,
      },
    })
    .returning();

  return row;
}

export async function submitDraft(adId: string, input: unknown) {
  const data = submitDraftSchema.parse(input);

  const [draft, plan] = await Promise.all([
    db.select().from(ads).where(eq(ads.id, adId)).limit(1),
    db
      .select()
      .from(advertisingPlans)
      .where(eq(advertisingPlans.id, data.advertisingPlanId))
      .limit(1),
  ]);

  const ad = draft[0];
  const selectedPlan = plan[0];

  if (!ad) {
    throw new HttpError(404, "NOT_FOUND", "Draft ad not found");
  }

  if (!selectedPlan || !selectedPlan.isActive) {
    throw new HttpError(400, "INVALID_PLAN", "Advertising plan is invalid");
  }

  const requiredFields = await db
    .select({
      id: adFieldDefinitions.id,
      key: adFieldDefinitions.key,
      fieldType: adFieldDefinitions.fieldType,
    })
    .from(adFieldDefinitions)
    .where(
      and(
        eq(adFieldDefinitions.isActive, true),
        eq(adFieldDefinitions.isRequired, true),
        or(
          and(
            eq(adFieldDefinitions.categoryId, ad.categoryId!),
            isNull(adFieldDefinitions.brandId),
          ),
          eq(adFieldDefinitions.brandId, ad.brandId!),
        ),
      ),
    );

  const requiredNonImageFieldIds = requiredFields
    .filter((f) => f.fieldType !== FieldType.IMAGE)
    .map((f) => f.id);

  if (requiredNonImageFieldIds.length > 0) {
    const filledValues = await db
      .select({ fieldDefinitionId: adFieldValues.fieldDefinitionId })
      .from(adFieldValues)
      .where(
        and(
          eq(adFieldValues.adId, ad.id),
          inArray(adFieldValues.fieldDefinitionId, requiredNonImageFieldIds),
        ),
      );

    const filledSet = new Set(filledValues.map((v) => v.fieldDefinitionId));
    const missing = requiredNonImageFieldIds.filter((id) => !filledSet.has(id));

    if (missing.length > 0) {
      throw new HttpError(
        400,
        "MISSING_FIELDS",
        "Required fields are missing",
        {
          missingFieldDefinitionIds: missing,
        },
      );
    }
  }

  const imageRequired = requiredFields.some(
    (f) => f.fieldType === FieldType.IMAGE,
  );
  if (imageRequired) {
    const [image] = await db
      .select()
      .from(adImages)
      .where(eq(adImages.adId, ad.id))
      .limit(1);
    if (!image) {
      throw new HttpError(400, "MISSING_IMAGE", "Required image is missing");
    }
  }

  const now = new Date();

  const updated = await db.transaction(async (tx) => {
    const [saved] = await tx
      .update(ads)
      .set({
        advertisingPlanId: selectedPlan.id,
        remainingPublications: selectedPlan.totalPublications,
        status: AdStatus.PENDING_APPROVAL,
        submittedAt: now,
        updatedAt: now,
      })
      .where(eq(ads.id, ad.id))
      .returning();

    await tx.insert(adStatusHistory).values({
      adId: ad.id,
      fromStatus: ad.status,
      toStatus: AdStatus.PENDING_APPROVAL,
      reason: "Submitted from bot flow",
    });

    return saved;
  });

  return updated;
}

export async function getDraftPreview(adId: string) {
  const [ad] = await db.select().from(ads).where(eq(ads.id, adId)).limit(1);
  if (!ad) {
    throw new HttpError(404, "NOT_FOUND", "Draft ad not found");
  }

  const [category] = ad.categoryId
    ? await db
        .select()
        .from(categories)
        .where(eq(categories.id, ad.categoryId))
        .limit(1)
    : [null];

  const [brand] = ad.brandId
    ? await db.select().from(brands).where(eq(brands.id, ad.brandId)).limit(1)
    : [null];

  const [plan] = ad.advertisingPlanId
    ? await db
        .select()
        .from(advertisingPlans)
        .where(eq(advertisingPlans.id, ad.advertisingPlanId))
        .limit(1)
    : [null];

  const [values, image] = await Promise.all([
    db
      .select({
        fieldDefinitionId: adFieldValues.fieldDefinitionId,
        key: adFieldDefinitions.key,
        labelUz: adFieldDefinitions.labelUz,
        fieldType: adFieldDefinitions.fieldType,
        valueText: adFieldValues.valueText,
        valueNumber: adFieldValues.valueNumber,
        valueJson: adFieldValues.valueJson,
      })
      .from(adFieldValues)
      .innerJoin(
        adFieldDefinitions,
        eq(adFieldDefinitions.id, adFieldValues.fieldDefinitionId),
      )
      .where(eq(adFieldValues.adId, ad.id))
      .orderBy(asc(adFieldDefinitions.sortOrder)),
    db.select().from(adImages).where(eq(adImages.adId, ad.id)).limit(1),
  ]);

  return {
    ad,
    category,
    brand,
    plan,
    values,
    image: image[0] ?? null,
  };
}

function mapValueByFieldType(
  fieldType: FieldType,
  rawValue: string | number | string[],
) {
  switch (fieldType) {
    case FieldType.NUMBER: {
      const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
      if (Number.isNaN(value)) {
        throw new HttpError(400, "INVALID_NUMBER", "Expected numeric value");
      }

      return {
        valueText: null,
        valueNumber: String(value),
        valueJson: null,
      };
    }

    case FieldType.SELECT:
      return {
        valueText:
          typeof rawValue === "string"
            ? rawValue
            : Array.isArray(rawValue)
              ? rawValue.join(", ")
              : String(rawValue),
        valueNumber: null,
        valueJson: Array.isArray(rawValue) ? rawValue : null,
      };

    case FieldType.IMAGE:
      return {
        valueText: null,
        valueNumber: null,
        valueJson: null,
      };

    default:
      return {
        valueText: String(rawValue),
        valueNumber: null,
        valueJson: null,
      };
  }
}
