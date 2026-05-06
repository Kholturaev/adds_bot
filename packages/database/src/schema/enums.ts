import { pgEnum } from "drizzle-orm/pg-core";
import  {
  AdStatus,
  FieldType,
  ImageStorageType,
  UserLanguage,
} from "@adds-bot/shared";

export const adStatusEnum = pgEnum("ad_status", [
  AdStatus.DRAFT,
  AdStatus.READY_FOR_REVIEW,
  AdStatus.PENDING_APPROVAL,
  AdStatus.APPROVED,
  AdStatus.PUBLISHED_PARTIAL,
  AdStatus.PUBLISHED_COMPLETE,
  AdStatus.REJECTED,
  AdStatus.DELETED,
]);

export const fieldTypeEnum = pgEnum("field_type", [
  FieldType.TEXT,
  FieldType.NUMBER,
  FieldType.SELECT,
  FieldType.PHONE,
  FieldType.TELEGRAM,
  FieldType.IMAGE,
]);

export const imageStorageTypeEnum = pgEnum("image_storage_type", [
  ImageStorageType.DB,
  ImageStorageType.URL,
]);

export const userLanguageEnum = pgEnum("user_language", [
  UserLanguage.UZ,
  UserLanguage.RU,
]);
