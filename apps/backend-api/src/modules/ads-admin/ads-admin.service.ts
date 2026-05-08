import {
  adFieldDefinitions,
  adFieldValues,
  adImages,
  adPublicationEvents,
  adStatusHistory,
  ads,
  advertisingPlans,
  brands,
  categories,
  db,
  telegramUsers,
} from "@adds-bot/database";
import { AdStatus, ImageStorageType } from "@adds-bot/shared";
import { and, asc, desc, eq, gte, inArray, lt, SQL } from "drizzle-orm";
import { env } from "../../config/env";
import { HttpError } from "../../common/http-error";
import { publishMessageToTelegram } from "./ads-admin.publisher";
import {
  listAdsQuerySchema,
  publishAdSchema,
  rejectAdSchema,
  updateAdSchema,
} from "./ads-admin.validation";

export async function listAds(input: unknown) {
  const query = listAdsQuerySchema.parse(input);
  const conditions: SQL[] = [];

  if (query.status) {
    conditions.push(eq(ads.status, query.status));
  }

  if (query.today) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    conditions.push(gte(ads.createdAt, start));
    conditions.push(lt(ads.createdAt, end));
  }

  const rows = await db
    .select({
      id: ads.id,
      status: ads.status,
      remainingPublications: ads.remainingPublications,
      submittedAt: ads.submittedAt,
      createdAt: ads.createdAt,
      categoryName: categories.name,
      brandName: brands.name,
      planTitleUz: advertisingPlans.titleUz,
      telegramUserId: telegramUsers.telegramUserId,
      telegramUsername: telegramUsers.telegramUsername,
    })
    .from(ads)
    .leftJoin(categories, eq(categories.id, ads.categoryId))
    .leftJoin(brands, eq(brands.id, ads.brandId))
    .leftJoin(advertisingPlans, eq(advertisingPlans.id, ads.advertisingPlanId))
    .leftJoin(telegramUsers, eq(telegramUsers.id, ads.telegramUserId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(ads.createdAt));

  return rows.map((row) => ({
    ...row,
    telegramUserId:
      row.telegramUserId !== null && row.telegramUserId !== undefined
        ? row.telegramUserId.toString()
        : null,
  }));
}

export async function getAdDetail(adId: string) {
  const [ad] = await db
    .select({
      id: ads.id,
      status: ads.status,
      createdAt: ads.createdAt,
      submittedAt: ads.submittedAt,
      approvedAt: ads.approvedAt,
      rejectedAt: ads.rejectedAt,
      remainingPublications: ads.remainingPublications,
      categoryId: ads.categoryId,
      brandId: ads.brandId,
      advertisingPlanId: ads.advertisingPlanId,
      categoryName: categories.name,
      brandName: brands.name,
      planTitleUz: advertisingPlans.titleUz,
      telegramUserId: telegramUsers.telegramUserId,
      telegramUsername: telegramUsers.telegramUsername,
      phoneNumber: telegramUsers.phoneNumber,
    })
    .from(ads)
    .leftJoin(categories, eq(categories.id, ads.categoryId))
    .leftJoin(brands, eq(brands.id, ads.brandId))
    .leftJoin(advertisingPlans, eq(advertisingPlans.id, ads.advertisingPlanId))
    .leftJoin(telegramUsers, eq(telegramUsers.id, ads.telegramUserId))
    .where(eq(ads.id, adId))
    .limit(1);

  if (!ad) {
    throw new HttpError(404, "NOT_FOUND", "Ad not found");
  }

  const [values, image, history, publicationEvents] = await Promise.all([
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
      .where(eq(adFieldValues.adId, adId))
      .orderBy(
        asc(adFieldDefinitions.sortOrder),
        asc(adFieldDefinitions.createdAt),
      ),
    db.select().from(adImages).where(eq(adImages.adId, adId)).limit(1),
    db
      .select()
      .from(adStatusHistory)
      .where(eq(adStatusHistory.adId, adId))
      .orderBy(desc(adStatusHistory.createdAt)),
    db
      .select()
      .from(adPublicationEvents)
      .where(eq(adPublicationEvents.adId, adId))
      .orderBy(desc(adPublicationEvents.publishedAt)),
  ]);

  return {
    ad: {
      ...ad,
      telegramUserId:
        ad.telegramUserId !== null && ad.telegramUserId !== undefined
          ? ad.telegramUserId.toString()
          : null,
    },
    values,
    image: image[0] ?? null,
    history,
    publicationEvents,
  };
}

export async function updateAd(adId: string, input: unknown) {
  const payload = updateAdSchema.parse(input);

  const [existing] = await db
    .select()
    .from(ads)
    .where(eq(ads.id, adId))
    .limit(1);
  if (!existing) {
    throw new HttpError(404, "NOT_FOUND", "Ad not found");
  }

  if (existing.status === AdStatus.DELETED) {
    throw new HttpError(400, "INVALID_STATE", "Deleted ad cannot be updated");
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(ads)
      .set({
        ...(payload.categoryId !== undefined
          ? { categoryId: payload.categoryId }
          : {}),
        ...(payload.brandId !== undefined ? { brandId: payload.brandId } : {}),
        ...(payload.advertisingPlanId !== undefined
          ? { advertisingPlanId: payload.advertisingPlanId }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(ads.id, adId))
      .returning();

    if (payload.fieldValues && payload.fieldValues.length > 0) {
      const fieldIds = payload.fieldValues.map(
        (item) => item.fieldDefinitionId,
      );
      const validDefs = await tx
        .select({ id: adFieldDefinitions.id })
        .from(adFieldDefinitions)
        .where(inArray(adFieldDefinitions.id, fieldIds));

      if (validDefs.length !== fieldIds.length) {
        throw new HttpError(
          400,
          "INVALID_FIELD",
          "Some field definitions are invalid",
        );
      }

      for (const value of payload.fieldValues) {
        await tx
          .insert(adFieldValues)
          .values({
            adId,
            fieldDefinitionId: value.fieldDefinitionId,
            valueText: value.valueText ?? null,
            valueNumber:
              value.valueNumber !== undefined && value.valueNumber !== null
                ? String(value.valueNumber)
                : null,
            valueJson: value.valueJson ?? null,
          })
          .onConflictDoUpdate({
            target: [adFieldValues.adId, adFieldValues.fieldDefinitionId],
            set: {
              valueText: value.valueText ?? null,
              valueNumber:
                value.valueNumber !== undefined && value.valueNumber !== null
                  ? String(value.valueNumber)
                  : null,
              valueJson: value.valueJson ?? null,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (payload.imageUrl) {
      await tx
        .insert(adImages)
        .values({
          adId,
          storageType: ImageStorageType.URL,
          imageUrl: payload.imageUrl,
        })
        .onConflictDoUpdate({
          target: adImages.adId,
          set: {
            storageType: ImageStorageType.URL,
            imageUrl: payload.imageUrl,
          },
        });
    }

    return updated;
  });
}

export async function approveAd(adId: string) {
  const [existing] = await db
    .select()
    .from(ads)
    .where(eq(ads.id, adId))
    .limit(1);
  if (!existing) {
    throw new HttpError(404, "NOT_FOUND", "Ad not found");
  }

  if (existing.status === AdStatus.DELETED) {
    throw new HttpError(400, "INVALID_STATE", "Deleted ad cannot be approved");
  }

  const now = new Date();

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(ads)
      .set({
        status: AdStatus.APPROVED,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(ads.id, adId))
      .returning();

    await tx.insert(adStatusHistory).values({
      adId,
      fromStatus: existing.status,
      toStatus: AdStatus.APPROVED,
      reason: "Approved by admin",
    });

    return updated;
  });
}

export async function publishAd(adId: string, input: unknown) {
  const payload = publishAdSchema.parse(input);

  const [existing] = await db
    .select()
    .from(ads)
    .where(eq(ads.id, adId))
    .limit(1);
  if (!existing) {
    throw new HttpError(404, "NOT_FOUND", "Ad not found");
  }

  if (
    existing.status !== AdStatus.APPROVED &&
    existing.status !== AdStatus.PUBLISHED_PARTIAL
  ) {
    throw new HttpError(
      400,
      "INVALID_STATE",
      "Only approved or partially published ads can be published",
    );
  }

  if (existing.remainingPublications <= 0) {
    throw new HttpError(
      400,
      "NO_PUBLICATIONS_LEFT",
      "No remaining publications",
    );
  }

  const text = await buildPublicationText(adId);
  const publishResult = await publishMessageToTelegram({
    botToken: env.publishTelegramBotToken,
    chatId: payload.publishedToChatId ?? env.publishTelegramChatId,
    text,
  });

  const remainingAfter = existing.remainingPublications - 1;
  const nextStatus =
    remainingAfter === 0
      ? AdStatus.PUBLISHED_COMPLETE
      : AdStatus.PUBLISHED_PARTIAL;

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(ads)
      .set({
        remainingPublications: remainingAfter,
        status: nextStatus,
        updatedAt: new Date(),
      })
      .where(eq(ads.id, adId))
      .returning();

    await tx.insert(adPublicationEvents).values({
      adId,
      publishedToChatId: publishResult.chatId,
      telegramMessageId: publishResult.telegramMessageId,
      remainingPublicationsAfter: remainingAfter,
    });

    await tx.insert(adStatusHistory).values({
      adId,
      fromStatus: existing.status,
      toStatus: nextStatus,
      reason: `Published to ${publishResult.chatId}`,
    });

    return {
      ad: updated,
      publication: {
        publishedToChatId: publishResult.chatId,
        telegramMessageId: publishResult.telegramMessageId,
        remainingPublicationsAfter: remainingAfter,
      },
    };
  });
}

export async function rejectAd(adId: string, input: unknown) {
  const payload = rejectAdSchema.parse(input);
  const [existing] = await db
    .select()
    .from(ads)
    .where(eq(ads.id, adId))
    .limit(1);

  if (!existing) {
    throw new HttpError(404, "NOT_FOUND", "Ad not found");
  }

  if (existing.status === AdStatus.DELETED) {
    throw new HttpError(400, "INVALID_STATE", "Deleted ad cannot be rejected");
  }

  const now = new Date();

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(ads)
      .set({
        status: AdStatus.REJECTED,
        rejectedAt: now,
        updatedAt: now,
      })
      .where(eq(ads.id, adId))
      .returning();

    await tx.insert(adStatusHistory).values({
      adId,
      fromStatus: existing.status,
      toStatus: AdStatus.REJECTED,
      reason: payload.reason,
    });

    return updated;
  });
}

export async function deleteAd(adId: string) {
  const [existing] = await db
    .select()
    .from(ads)
    .where(eq(ads.id, adId))
    .limit(1);
  if (!existing) {
    throw new HttpError(404, "NOT_FOUND", "Ad not found");
  }

  if (existing.status === AdStatus.DELETED) {
    return existing;
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(ads)
      .set({
        status: AdStatus.DELETED,
        updatedAt: new Date(),
      })
      .where(eq(ads.id, adId))
      .returning();

    await tx.insert(adStatusHistory).values({
      adId,
      fromStatus: existing.status,
      toStatus: AdStatus.DELETED,
      reason: "Soft deleted by admin",
    });

    return updated;
  });
}

async function buildPublicationText(adId: string): Promise<string> {
  const detail = await getAdDetail(adId);

  const lines: string[] = [];
  lines.push("<b>New Ad</b>");

  if (detail.ad.categoryName) {
    lines.push(`<b>Category:</b> ${escapeHtml(detail.ad.categoryName)}`);
  }

  if (detail.ad.brandName) {
    lines.push(`<b>Brand:</b> ${escapeHtml(detail.ad.brandName)}`);
  }

  if (detail.ad.telegramUsername) {
    lines.push(`<b>User:</b> @${escapeHtml(detail.ad.telegramUsername)}`);
  }

  for (const field of detail.values) {
    const value =
      field.valueText ?? field.valueNumber ?? stringifyValue(field.valueJson);
    if (!value || value === "-") {
      continue;
    }

    lines.push(`<b>${escapeHtml(field.labelUz)}:</b> ${escapeHtml(value)}`);
  }

  if (detail.image?.imageUrl) {
    lines.push(`<b>Image:</b> ${escapeHtml(detail.image.imageUrl)}`);
  }

  return lines.join("\n");
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
