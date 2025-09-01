import { api } from "./client";
import type { Category } from "../types/category";

type ApiCategory = {
  id: number | string;
  name: string;
  created_at: string;
  updated_at: string;
};

type IndexResponse = { data: ApiCategory[] };
type EntityResponse = { data: ApiCategory };

function toCategory(entity: ApiCategory): Category {
  return {
    id: String(entity.id),
    name: entity.name,
    // バックエンドでは color/description をまだ返さないため適当なデフォルト値を設定
    color: "#1976d2",
    description: undefined,
    createdAt: new Date(entity.created_at),
    updatedAt: new Date(entity.updated_at),
  };
}

export async function listCategories(): Promise<Category[]> {
  const res = await api.get<IndexResponse>("/categories");
  return res.data.map(toCategory);
}

export async function createCategory(payload: {
  name: string;
}): Promise<Category> {
  const res = await api.post<EntityResponse>("/categories", {
    name: payload.name,
  });
  return toCategory(res.data);
}

export async function updateCategory(
  id: string,
  payload: { name: string },
): Promise<Category> {
  const res = await api.patch<EntityResponse>(`/categories/${id}`, {
    name: payload.name,
  });
  return toCategory(res.data);
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
