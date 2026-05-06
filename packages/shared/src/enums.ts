// Ad lifecycle statuses
export enum AdStatus {
  DRAFT = "DRAFT",
  READY_FOR_REVIEW = "READY_FOR_REVIEW",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  PUBLISHED_PARTIAL = "PUBLISHED_PARTIAL",
  PUBLISHED_COMPLETE = "PUBLISHED_COMPLETE",
  REJECTED = "REJECTED",
  DELETED = "DELETED",
}

// Dynamic field types
export enum FieldType {
  TEXT = "text",
  NUMBER = "number",
  SELECT = "select",
  PHONE = "phone",
  TELEGRAM = "telegram",
  IMAGE = "image",
}

// Image storage modes
export enum ImageStorageType {
  DB = "db",
  URL = "url",
}

// Bot language (intro bilingual; rest is Uzbek only)
export enum UserLanguage {
  UZ = "uz",
  RU = "ru",
}

// Well-known advertising plan codes
export enum PlanCode {
  ONE_TIME = "one_time",
  TWO_TIMES_3_DAYS = "two_times_3_days",
  THREE_TIMES = "three_times",
}
