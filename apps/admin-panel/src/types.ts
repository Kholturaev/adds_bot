export type Credentials = { username: string; password: string };

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: { code: string; message: string; details?: unknown } | null;
};

export type AdListItem = {
  id: string;
  status: string;
  remainingPublications: number;
  submittedAt: string | null;
  createdAt: string;
  categoryName: string | null;
  brandName: string | null;
  planTitleUz: string | null;
  telegramUserId: string | null;
  telegramUsername: string | null;
};

export type AdDetail = {
  ad: {
    id: string;
    status: string;
    createdAt: string;
    submittedAt: string | null;
    approvedAt: string | null;
    rejectedAt: string | null;
    remainingPublications: number;
    categoryId: string | null;
    brandId: string | null;
    advertisingPlanId: string | null;
    categoryName: string | null;
    brandName: string | null;
    planTitleUz: string | null;
    telegramUserId: string | null;
    telegramUsername: string | null;
    phoneNumber: string | null;
  };
  values: Array<{
    fieldDefinitionId: string;
    key: string;
    labelUz: string;
    fieldType: string;
    valueText: string | null;
    valueNumber: string | null;
    valueJson: unknown;
  }>;
  image: { imageUrl: string | null } | null;
  history: Array<{
    id: string;
    fromStatus: string;
    toStatus: string;
    reason: string | null;
    createdAt: string;
  }>;
  publicationEvents: Array<{
    id: string;
    publishedToChatId: string;
    telegramMessageId: string | null;
    publishedAt: string;
    remainingPublicationsAfter: number;
  }>;
};

export type Category = { id: string; name: string; isActive: boolean };
export type Brand = {
  id: string;
  categoryId: string;
  name: string;
  isActive: boolean;
};
export type Plan = {
  id: string;
  code: string;
  titleUz: string;
  priceUzs: number;
  totalPublications: number;
  isActive: boolean;
};
