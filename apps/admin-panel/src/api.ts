import type {
  AdDetail,
  AdListItem,
  ApiResponse,
  Brand,
  Category,
  Plan,
} from "./types";

const API_BASE = "http://localhost:3001";

function adminHeaders(username: string, password: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-admin-username": username,
    "x-admin-password": password,
  };
}

async function request<T>(
  path: string,
  username: string,
  password: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...adminHeaders(username, password),
      ...(init?.headers ?? {}),
    },
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Request failed");
  }

  return json.data;
}

export function fetchAds(
  username: string,
  password: string,
  params: { status?: string; today?: boolean },
) {
  const query = new URLSearchParams();
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.today) {
    query.set("today", "true");
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<AdListItem[]>(`/admin/ads${suffix}`, username, password);
}

export function fetchAdDetail(id: string, username: string, password: string) {
  return request<AdDetail>(`/admin/ads/${id}`, username, password);
}

export function approveAd(id: string, username: string, password: string) {
  return request(`/admin/ads/${id}/approve`, username, password, {
    method: "POST",
  });
}

export function publishAd(
  id: string,
  username: string,
  password: string,
) {
  return request(`/admin/ads/${id}/publish`, username, password, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function rejectAd(
  id: string,
  reason: string,
  username: string,
  password: string,
) {
  return request(`/admin/ads/${id}/reject`, username, password, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function deleteAd(id: string, username: string, password: string) {
  return request(`/admin/ads/${id}`, username, password, {
    method: "DELETE",
  });
}

export function updateAd(
  id: string,
  payload: { imageUrl?: string },
  username: string,
  password: string,
) {
  return request(`/admin/ads/${id}`, username, password, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchCategories(username: string, password: string) {
  return request<Category[]>(`/admin/catalog/categories`, username, password);
}

export function createCategory(
  payload: { name: string },
  username: string,
  password: string,
) {
  return request<Category>(`/admin/catalog/categories`, username, password, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchBrands(username: string, password: string) {
  return request<Brand[]>(`/admin/catalog/brands`, username, password);
}

export function createBrand(
  payload: { categoryId: string; name: string },
  username: string,
  password: string,
) {
  return request<Brand>(`/admin/catalog/brands`, username, password, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchPlans(username: string, password: string) {
  return request<Plan[]>(`/admin/catalog/plans`, username, password);
}

export function createPlan(
  payload: {
    code: string;
    titleUz: string;
    titleRu: string;
    priceUzs: number;
    totalPublications: number;
    intervalDays?: number | null;
  },
  username: string,
  password: string,
) {
  return request<Plan>(`/admin/catalog/plans`, username, password, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
