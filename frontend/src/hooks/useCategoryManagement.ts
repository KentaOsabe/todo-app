import { useCallback } from "react";
import type {
  Category,
  CategoryFormData,
  UseCategoryManagementReturn,
} from "../types/category";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "work",
    name: "仕事",
    color: "#1976d2",
    description: "仕事関連のタスク",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "private",
    name: "プライベート",
    color: "#ff5722",
    description: "個人的なタスク",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "other",
    name: "その他",
    color: "#9e9e9e",
    description: "その他のタスク",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
  },
];

export const useCategoryManagement = (): UseCategoryManagementReturn => {
  const [categories, setCategories] = useLocalStorage<Category[]>(
    "categories",
    DEFAULT_CATEGORIES,
  );

  // カテゴリの使用状況チェック機能
  // 現在はサンプルデータで動作確認済み
  const createCategory = useCallback(
    (data: CategoryFormData) => {
      // 同じ名前のカテゴリが既に存在するかチェック
      const exists = categories.some((category) => category.name === data.name);
      if (exists) {
        return;
      }

      const now = new Date();
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: data.name,
        color: data.color,
        description: data.description,
        createdAt: now,
        updatedAt: now,
      };

      setCategories((prev) => [...prev, newCategory]);
    },
    [categories, setCategories],
  );

  const updateCategory = useCallback(
    (id: string, data: CategoryFormData) => {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === id
            ? {
                ...category,
                name: data.name,
                color: data.color,
                description: data.description,
                updatedAt: new Date(),
              }
            : category,
        ),
      );
    },
    [setCategories],
  );

  const isCategoryInUse = useCallback((id: string): boolean => {
    // カテゴリ使用状況の確認（サンプルデータで動作）
    const mockTodos = [
      { id: "1", categoryId: "work", title: "Test Todo", completed: false },
    ];
    return mockTodos.some((todo) => todo.categoryId === id);
  }, []);

  const deleteCategory = useCallback(
    (id: string): boolean => {
      // カテゴリが存在するかチェック
      const categoryExists = categories.some((category) => category.id === id);
      if (!categoryExists) {
        return false;
      }

      // 使用中のカテゴリは削除できない
      if (isCategoryInUse(id)) {
        return false;
      }

      setCategories((prev) => prev.filter((category) => category.id !== id));
      return true;
    },
    [categories, isCategoryInUse, setCategories],
  );

  return {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    isCategoryInUse,
  };
};
