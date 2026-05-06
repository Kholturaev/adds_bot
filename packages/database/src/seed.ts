import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "./db";
import {
  categories,
  brands,
  advertisingPlans,
  adFieldDefinitions,
} from "./schema/index";
import { FieldType, PlanCode } from "@adds-bot/shared";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../.env"),
];
const envPath = envCandidates.find((candidate) => existsSync(candidate));

if (envPath) {
  dotenv.config({ path: envPath });
}

async function seed(): Promise<void> {
  console.log("Seeding database...");

  // ── Categories ─────────────────────────────────────────────────────────────
  const [phone] = await db
    .insert(categories)
    .values([{ name: "Telefon" }, { name: "Kompyuter" }])
    .onConflictDoNothing()
    .returning();

  console.log("Categories seeded.");

  // ── Brands (Phone) ─────────────────────────────────────────────────────────
  if (phone) {
    await db
      .insert(brands)
      .values([
        { categoryId: phone.id, name: "iPhone" },
        { categoryId: phone.id, name: "Samsung" },
        { categoryId: phone.id, name: "Oppo" },
        { categoryId: phone.id, name: "Redmi" },
        { categoryId: phone.id, name: "Poco" },
      ])
      .onConflictDoNothing();

    console.log("Phone brands seeded.");
  }

  // ── General phone field definitions (category-level) ───────────────────────
  if (phone) {
    await db
      .insert(adFieldDefinitions)
      .values([
        {
          categoryId: phone.id,
          key: "name",
          labelUz: "Nomi",
          labelRu: "Название",
          fieldType: FieldType.TEXT,
          isRequired: true,
          sortOrder: 1,
        },
        {
          categoryId: phone.id,
          key: "memory",
          labelUz: "Xotira (GB)",
          labelRu: "Память (ГБ)",
          fieldType: FieldType.TEXT,
          isRequired: true,
          sortOrder: 2,
        },
        {
          categoryId: phone.id,
          key: "color",
          labelUz: "Rangi",
          labelRu: "Цвет",
          fieldType: FieldType.TEXT,
          isRequired: true,
          sortOrder: 3,
        },
        {
          categoryId: phone.id,
          key: "status",
          labelUz: "Holati",
          labelRu: "Состояние",
          fieldType: FieldType.SELECT,
          isRequired: true,
          sortOrder: 4,
          optionsJson: ["Yangi", "Ishlatilgan"],
        },
        {
          categoryId: phone.id,
          key: "region",
          labelUz: "Viloyat",
          labelRu: "Регион",
          fieldType: FieldType.TEXT,
          isRequired: true,
          sortOrder: 5,
        },
        {
          categoryId: phone.id,
          key: "price",
          labelUz: "Narxi (so'm)",
          labelRu: "Цена (сум)",
          fieldType: FieldType.NUMBER,
          isRequired: true,
          sortOrder: 6,
        },
        {
          categoryId: phone.id,
          key: "contact_phone",
          labelUz: "Telefon raqam",
          labelRu: "Номер телефона",
          fieldType: FieldType.PHONE,
          isRequired: true,
          sortOrder: 7,
        },
        {
          categoryId: phone.id,
          key: "contact_telegram",
          labelUz: "Telegram username",
          labelRu: "Telegram username",
          fieldType: FieldType.TELEGRAM,
          isRequired: false,
          sortOrder: 8,
        },
        {
          categoryId: phone.id,
          key: "image",
          labelUz: "Rasm",
          labelRu: "Фото",
          fieldType: FieldType.IMAGE,
          isRequired: true,
          sortOrder: 9,
        },
      ])
      .onConflictDoNothing();

    console.log("Phone field definitions seeded.");
  }

  // ── Advertising Plans ──────────────────────────────────────────────────────
  await db
    .insert(advertisingPlans)
    .values([
      {
        code: PlanCode.ONE_TIME,
        titleUz: "1 marta e'lon (20 000 so'm)",
        titleRu: "Разместить 1 раз (20 000 сум)",
        priceUzs: 20000,
        totalPublications: 1,
        intervalDays: null,
        sortOrder: 1,
      },
      {
        code: PlanCode.TWO_TIMES_3_DAYS,
        titleUz: "2 marta (har 3 kunda) e'lon (25 000 so'm)",
        titleRu: "Разместить 2 раза (каждые 3 дня) (25 000 сум)",
        priceUzs: 25000,
        totalPublications: 2,
        intervalDays: 3,
        sortOrder: 2,
      },
      {
        code: PlanCode.THREE_TIMES,
        titleUz: "3 marta e'lon (30 000 so'm)",
        titleRu: "Разместить 3 раза (30 000 сум)",
        priceUzs: 30000,
        totalPublications: 3,
        intervalDays: null,
        sortOrder: 3,
      },
    ])
    .onConflictDoNothing();

  console.log("Advertising plans seeded.");
  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
