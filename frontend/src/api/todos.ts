import { api } from "./client";
import type { Todo } from "../types/todo";

type ApiTodo = {
  id: number | string;
  text: string;
  completed: boolean;
  category_id?: number | string | null;
  created_at: string;
  updated_at: string;
};

type IndexResponse = { data: ApiTodo[] };
type EntityResponse = { data: ApiTodo };

function toTodo(entity: ApiTodo): Todo {
  return {
    id: String(entity.id),
    text: entity.text,
    completed: entity.completed,
    createdAt: new Date(entity.created_at),
    categoryId:
      entity.category_id === null || entity.category_id === undefined
        ? undefined
        : String(entity.category_id),
    tags: [],
    // APIからは順序情報を受け取らないため、呼び出し側で再計算想定
    order: undefined,
  };
}

export async function listTodos(options?: {
  signal?: AbortSignal;
}): Promise<Todo[]> {
  const res = await api.get<IndexResponse>("/todos", {
    signal: options?.signal,
  });
  return res.data.map(toTodo);
}

export async function createTodo(
  payload: {
    text: string;
    categoryId?: string;
    completed?: boolean;
  },
  options?: { signal?: AbortSignal },
): Promise<Todo> {
  const body: Record<string, unknown> = { text: payload.text };
  if (payload.categoryId !== undefined)
    body["category_id"] = payload.categoryId;
  if (payload.completed !== undefined) body["completed"] = payload.completed;
  const res = await api.post<EntityResponse>("/todos", body, {
    signal: options?.signal,
  });
  return toTodo(res.data);
}

export async function updateTodo(
  id: string,
  payload: { text?: string; categoryId?: string; completed?: boolean },
  options?: { signal?: AbortSignal },
): Promise<Todo> {
  const body: Record<string, unknown> = {};
  if (payload.text !== undefined) body["text"] = payload.text;
  if (payload.categoryId !== undefined)
    body["category_id"] = payload.categoryId;
  if (payload.completed !== undefined) body["completed"] = payload.completed;
  const res = await api.patch<EntityResponse>(`/todos/${id}`, body, {
    signal: options?.signal,
  });
  return toTodo(res.data);
}

export async function deleteTodo(
  id: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  await api.delete(`/todos/${id}`, { signal: options?.signal });
}
