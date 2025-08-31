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

export const TodoApp = () => {
  const [rawTodos, setRawTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listTodos();
        if (mounted) setRawTodos((prev) => (prev.length === 0 ? data : prev));
      } catch {
        if (mounted) setError("タスクの取得に失敗しました");
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
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

  // ドラッグ&ドロップによる並び替え機能
  const { sortedTodos, handleDragEnd } = useTodoSorting(
    filteredTodos,
    setTodos,
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

        {sortedTodos.length > 0 && (
          <Paper elevation={2} sx={{ mt: 2 }}>
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedTodos.map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <List>
                  {sortedTodos.map((todo) => (
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

        {todos.length > 0 && sortedTodos.length === 0 && !loading && (
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mt: 4 }}
          >
            No todos match the current filters.
          </Typography>
        )}

        <FilterBar
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          categories={categories}
          availableTags={availableTags}
          activeFilterCount={activeFilterCount}
        />
      </Paper>
    </Box>
  );
};
