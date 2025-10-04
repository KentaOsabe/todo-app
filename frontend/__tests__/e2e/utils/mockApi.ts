import type { Page, Route } from "@playwright/test";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  category_id?: string | null;
  created_at: string;
  updated_at: string;
};

type Category = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export async function setupApiMock(page: Page) {
  // 各テスト開始時に永続状態をクリア（フィルター等のローカルストレージ汚染を防ぐ）
  await page.addInitScript(() => {
    try {
      window.localStorage.clear();
      sessionStorage.clear();
    } catch {
      // intentionally ignore storage clearing errors
      return;
    }
  });
  // テスト毎にクリーンなインメモリDB
  let todos: Todo[] = [];
  let categories: Category[] = [
    {
      id: "work",
      name: "仕事",
      created_at: new Date("2024-01-01").toISOString(),
      updated_at: new Date("2024-01-01").toISOString(),
    },
    {
      id: "private",
      name: "プライベート",
      created_at: new Date("2024-01-02").toISOString(),
      updated_at: new Date("2024-01-02").toISOString(),
    },
    {
      id: "other",
      name: "その他",
      created_at: new Date("2024-01-03").toISOString(),
      updated_at: new Date("2024-01-03").toISOString(),
    },
  ];

  async function handleApi(route: Route) {
    const req = route.request();
    const url = new URL(req.url());
    const { pathname } = url;
    const method = req.method();

    // Categories
    if (pathname === "/api/categories" && method === "GET") {
      return route.fulfill({ json: { data: categories } });
    }
    if (pathname === "/api/categories" && method === "POST") {
      const body = (await req.postDataJSON()) as { name: string };
      const now = new Date().toISOString();
      const id = String(Date.now());
      const entity: Category = {
        id,
        name: body.name,
        created_at: now,
        updated_at: now,
      };
      categories = [...categories, entity];
      return route.fulfill({ status: 201, json: { data: entity } });
    }
    const usageMatch = pathname.match(/^\/api\/categories\/(.+)\/usage$/);
    if (usageMatch && method === "GET") {
      const id = usageMatch[1];
      const todosCount = todos.filter((t) => t.category_id === id).length;
      return route.fulfill({
        json: {
          data: {
            in_use: todosCount > 0,
            counts: { todos: todosCount },
          },
        },
      });
    }

    const catMatch = pathname.match(/^\/api\/categories\/(.+)$/);
    if (catMatch) {
      const id = catMatch[1];
      if (method === "PATCH") {
        const body = (await req.postDataJSON()) as { name?: string };
        categories = categories.map((c) =>
          c.id === id
            ? {
                ...c,
                name: body.name ?? c.name,
                updated_at: new Date().toISOString(),
              }
            : c,
        );
        const entity = categories.find((c) => c.id === id)!;
        return route.fulfill({ json: { data: entity } });
      }
      if (method === "DELETE") {
        categories = categories.filter((c) => c.id !== id);
        return route.fulfill({ status: 204, body: "" });
      }
    }

    // Todos
    if (pathname === "/api/todos" && method === "GET") {
      return route.fulfill({ json: { data: todos } });
    }
    if (pathname === "/api/todos" && method === "POST") {
      const body = (await req.postDataJSON()) as {
        text: string;
        category_id?: string;
        completed?: boolean;
      };
      const now = new Date().toISOString();
      const id = String(Date.now());
      const entity: Todo = {
        id,
        text: body.text,
        completed: !!body.completed,
        category_id: body.category_id ?? null,
        created_at: now,
        updated_at: now,
      };
      todos = [...todos, entity];
      return route.fulfill({ status: 201, json: { data: entity } });
    }
    const todoMatch = pathname.match(/^\/api\/todos\/(.+)$/);
    if (todoMatch) {
      const id = todoMatch[1];
      if (method === "PATCH") {
        const body = (await req.postDataJSON()) as {
          text?: string;
          completed?: boolean;
          category_id?: string;
        };
        todos = todos.map((t) =>
          t.id === id
            ? {
                ...t,
                text: body.text ?? t.text,
                completed:
                  typeof body.completed === "boolean"
                    ? body.completed
                    : t.completed,
                category_id: body.category_id ?? t.category_id,
                updated_at: new Date().toISOString(),
              }
            : t,
        );
        const entity = todos.find((t) => t.id === id)!;
        return route.fulfill({ json: { data: entity } });
      }
      if (method === "DELETE") {
        todos = todos.filter((t) => t.id !== id);
        return route.fulfill({ status: 204, body: "" });
      }
    }

    // それ以外は素通し
    return route.fallback();
  }

  await page.route("**/api/**", handleApi);
}
