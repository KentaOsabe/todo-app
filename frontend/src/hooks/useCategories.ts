import { useCallback } from "react";
import type { Category } from "../types/category";
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

export const useCategories = () => {
  const [categories, setCategories] = useLocalStorage<Category[]>(
    "categories",
    DEFAULT_CATEGORIES,
  );

  const addCategory = useCallback(
    (name: string, color: string) => {
      // 同じ名前のカテゴリが既に存在するかチェック
      const exists = categories.some((category) => category.name === name);
      if (exists) {
        return;
      }

      const now = new Date();
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name,
        color,
        description: "",
        createdAt: now,
        updatedAt: now,
      };

      setCategories((prev) => [...prev, newCategory]);
    },
    [categories, setCategories],
  );

  const updateCategory = useCallback(
    (id: string, name: string, color: string) => {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === id
            ? { ...category, name, color, updatedAt: new Date() }
            : category,
        ),
      );
    },
    [setCategories],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((category) => category.id !== id));
    },
    [setCategories],
  );

  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((category) => category.id === id);
    },
    [categories],
  );

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
};
