import axios from "axios";
import { env } from "../config/env";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: { code: string; message: string; details?: unknown } | null;
};

const api = axios.create({
  baseURL: env.backendApiUrl,
  timeout: 15000,
});

async function unwrap<T>(
  promise: Promise<{ data: ApiResponse<T> }>,
): Promise<T> {
  const { data } = await promise;
  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? "Backend request failed");
  }
  return data.data;
}

export type BootstrapData = {
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; categoryId: string; name: string }>;
  plans: Array<{ id: string; titleUz: string; totalPublications: number }>;
};

export type DraftFieldDefinition = {
  id: string;
  key: string;
  labelUz: string;
  fieldType: "text" | "number" | "select" | "phone" | "telegram" | "image";
  isRequired: boolean;
  optionsJson: unknown;
};

export async function upsertTelegramUser(payload: {
  telegramUserId: string;
  telegramUsername?: string;
  language: "uz" | "ru";
  phoneNumber?: string;
}): Promise<{ id: string }> {
  return unwrap<{ id: string }>(api.post("/bot/users/upsert", payload));
}

export async function getBootstrapData(): Promise<BootstrapData> {
  return unwrap<BootstrapData>(api.get("/bot/bootstrap"));
}

export async function createDraft(payload: {
  telegramUserId: string;
  categoryId: string;
  brandId: string;
}): Promise<{ id: string }> {
  return unwrap<{ id: string }>(api.post("/bot/drafts", payload));
}

export async function getDraftFields(
  adId: string,
): Promise<DraftFieldDefinition[]> {
  return unwrap<DraftFieldDefinition[]>(api.get(`/bot/drafts/${adId}/fields`));
}

export async function saveFieldValue(
  adId: string,
  payload: { fieldDefinitionId: string; value: string | number },
) {
  return unwrap(api.post(`/bot/drafts/${adId}/field-values`, payload));
}

export async function saveImage(adId: string, imageUrl: string) {
  return unwrap(api.post(`/bot/drafts/${adId}/image`, { imageUrl }));
}

export async function getPreview(adId: string) {
  return unwrap<{
    category: { name: string } | null;
    brand: { name: string } | null;
    values: Array<{
      labelUz: string;
      valueText: string | null;
      valueNumber: string | null;
    }>;
    image: { imageUrl: string | null } | null;
  }>(api.get(`/bot/drafts/${adId}/preview`));
}

export async function submitDraft(adId: string, advertisingPlanId: string) {
  return unwrap(api.post(`/bot/drafts/${adId}/submit`, { advertisingPlanId }));
}
