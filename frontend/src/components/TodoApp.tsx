import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Box,
  List,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useCategoryManagement } from "../hooks/useCategoryManagement";
import { useFilters } from "../hooks/useFilters";
import { useTodoSorting } from "../hooks/useTodoSorting";
import type { EditTodoData, Todo } from "../types/todo";
import { FilterBar } from "./FilterBar";
import { SortableTodoItem } from "./SortableTodoItem";
import { TodoForm } from "./TodoForm";
import {
  listTodos,
  createTodo as apiCreateTodo,
  updateTodo as apiUpdateTodo,
  deleteTodo as apiDeleteTodo,
} from "../api/todos";
import { isAbortError } from "../utils/error";

export const TodoApp = () => {
  const [rawTodos, setRawTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // 初回の取得結果を適用済みかを明確化（重複適用の意図しない発生を抑止）
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [offline, setOffline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return false;
    return navigator.onLine === false;
  });

  // APIから取得したTodoを正規化（tags/orderが欠けている可能性に対応）
  const todos = useMemo(
    () =>
      rawTodos.map((todo, index) => ({
        ...todo,
        tags: todo.tags || [],
        order: todo.order !== undefined ? todo.order : index,
      })),
    [rawTodos],
  );

  const setTodos = (value: Todo[] | ((prev: Todo[]) => Todo[])) => {
    if (typeof value === "function") {
      setRawTodos((prev) => {
        const normalized = prev.map((todo, index) => ({
          ...todo,
          tags: todo.tags || [],
          order: todo.order !== undefined ? todo.order : index,
        }));
        return value(normalized);
      });
    } else {
      setRawTodos(value);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  // 初期取得はマウント時に一度だけ実行する意図のため、依存配列は空に固定
  // isInitialized は適用制御のための補助フラグであり、再フェッチを誘発しない。
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listTodos({ signal: controller.signal });
        // 初回のみ取得結果を適用（明示的な初期化フラグで可読性を担保）
        if (mounted && !isInitialized) {
          setRawTodos((prev) => (prev.length === 0 ? data : prev));
          setIsInitialized(true);
        }
      } catch (e: unknown) {
        // キャンセルは非エラー扱い
        if (mounted && !isAbortError(e)) setError("タスクの取得に失敗しました");
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  // オンライン/オフライン検知
  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);
  const { categories } = useCategoryManagement();
  const {
    filters,
    filteredTodos,
    updateFilters,
    resetFilters,
    availableTags,
    activeFilterCount,
  } = useFilters(todos);

  // ドラッグ&ドロップによる並び替え機能（全件を対象に順序を管理）
  const { handleDragEnd } = useTodoSorting(todos, setTodos);

  // 表示用: フィルター済みの配列を order 順に並べ替え
  const displayTodos = useMemo(
    () => [...filteredTodos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [filteredTodos],
  );

  const handleAddTodo = async (data: {
    text: string;
    categoryId?: string;
    tags: string[];
  }) => {
    // 楽観的に即時追加し、API結果で確定情報を反映
    const maxOrder =
      todos.length > 0 ? Math.max(...todos.map((t) => t.order || 0)) : -1;
    const tempId = `temp-${Date.now()}`;
    const optimistic: Todo = {
      id: tempId,
      text: data.text,
      completed: false,
      createdAt: new Date(),
      categoryId: data.categoryId,
      tags: data.tags ?? [],
      order: maxOrder + 1,
    };
    setTodos((prev) => [...prev, optimistic]);

    try {
      const created = await apiCreateTodo({
        text: data.text,
        categoryId: data.categoryId,
      });
      setTodos((prev) =>
        prev.map((t) =>
          t.id === tempId
            ? {
                ...t,
                ...created,
                tags: data.tags ?? [],
                order: optimistic.order,
              }
            : t,
        ),
      );
    } catch {
      // 失敗時は追加を取り消す
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const handleToggleTodo = async (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    // 楽観的更新（後続でエラーUIを追加）
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t)),
    );
    try {
      const updated = await apiUpdateTodo(id, { completed: nextCompleted });
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: updated.completed } : t,
        ),
      );
    } catch {
      // 失敗時は元に戻す
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: target.completed } : t,
        ),
      );
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const snapshot = todos;
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    try {
      await apiDeleteTodo(id);
    } catch {
      // 失敗時は元に戻す
      setTodos(snapshot);
    }
  };

  const handleEditTodo = async (id: string, data: EditTodoData) => {
    // 楽観的更新
    const snapshot = todos;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    try {
      const updated = await apiUpdateTodo(id, {
        text: data.text,
        categoryId: data.categoryId,
      });
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, text: updated.text, categoryId: updated.categoryId }
            : t,
        ),
      );
    } catch {
      setTodos(snapshot);
    }
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h3" component="h1" color="primary" sx={{ mb: 2 }}>
          Todo App
        </Typography>

        {offline && (
          <Box my={2}>
            <Alert severity="warning">
              オフラインです。操作は一時的に保存されない場合があります。
            </Alert>
          </Box>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box my={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <TodoForm onSubmit={handleAddTodo} categories={categories} />

        {/* FilterBar を一覧の上（フォーム直下）に移動 */}
        <FilterBar
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          categories={categories}
          availableTags={availableTags}
          activeFilterCount={activeFilterCount}
        />

        {displayTodos.length > 0 && (
          <Paper elevation={2} sx={{ mt: 2 }}>
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={displayTodos.map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <List>
                  {displayTodos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggleTodo}
                      onDelete={handleDeleteTodo}
                      onEdit={handleEditTodo}
                      categories={categories}
                    />
                  ))}
                </List>
              </SortableContext>
            </DndContext>
          </Paper>
        )}

        {todos.length === 0 && !loading && (
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mt: 4 }}
          >
            No todos yet. Add one above to get started!
          </Typography>
        )}

        {todos.length > 0 && displayTodos.length === 0 && !loading && (
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mt: 4 }}
          >
            No todos match the current filters.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};
