import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Category,
  CategoryFormData,
  UseCategoryManagementReturn,
} from "../types/category";
import {
  listCategories as apiListCategories,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
} from "../api/categories";
import { isAbortError } from "../utils/error";

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
  // 初期表示は従来通りのデフォルトカテゴリを使い、マウント後にAPI結果で上書き
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  // ユーザーが作成/更新/削除などの操作を行ったかどうか
  const interactedRef = useRef(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return false;
    return navigator.onLine === false;
  });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const resolveOffline = () =>
      typeof navigator !== "undefined" ? navigator.onLine === false : false;
    const updateOffline = (forced?: boolean) => {
      if (!mounted) return;
      setOffline(forced ?? resolveOffline());
    };
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const fetched = await apiListCategories({ signal: controller.signal });
        if (mounted && !interactedRef.current) setCategories(fetched);
      } catch (e: unknown) {
        // キャンセルは非エラー扱い
        if (!isAbortError(e) && mounted) {
          setError("カテゴリの取得に失敗しました");
          updateOffline();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    // online/offline イベント監視（navigator状態と同期）
    const handleOnline = () => updateOffline(false);
    const handleOffline = () => updateOffline(true);
    let syncTimer: number | undefined;
    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      syncTimer = window.setTimeout(() => updateOffline(), 0);
    }
    // 直前に発火したイベントを取りこぼさないよう、マウント時に同期
    updateOffline();
    return () => {
      mounted = false;
      controller.abort();
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        if (syncTimer !== undefined) {
          window.clearTimeout(syncTimer);
        }
      }
    };
  }, []);

  // カテゴリの使用状況チェック機能
  // 現在はサンプルデータで動作確認済み
  const createCategory = useCallback(
    (data: CategoryFormData) => {
      interactedRef.current = true;
      // 同じ名前のカテゴリが既に存在するかチェック
      const exists = categories.some((category) => category.name === data.name);
      if (exists) return;

      // 楽観的に即時追加
      const tempId = `temp-cat-${Date.now()}`;
      const optimistic: Category = {
        id: tempId,
        name: data.name,
        color: data.color,
        description: data.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCategories((prev) => [...prev, optimistic]);

      // APIへ作成要求（成功で置換、失敗でロールバック）
      (async () => {
        try {
          const created = await apiCreateCategory({ name: data.name });
          setCategories((prev) =>
            prev.map((c) =>
              c.id === tempId
                ? {
                    ...created,
                    color: data.color,
                    description: data.description,
                  }
                : c,
            ),
          );
        } catch {
          // 失敗時はロールバック
          setCategories((prev) => prev.filter((c) => c.id !== tempId));
        }
      })();
    },
    [categories],
  );

  const updateCategory = useCallback((id: string, data: CategoryFormData) => {
    interactedRef.current = true;
    // 楽観的更新（今後のエラーUIで巻き戻し対応予定）
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

    (async () => {
      try {
        const updated = await apiUpdateCategory(id, { name: data.name });
        if (updated) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === id
                ? {
                    ...c,
                    name: updated.name,
                    // APIからはcolor/descriptionは来ないため、現在の値を維持
                  }
                : c,
            ),
          );
        }
      } catch {
        // 失敗時の巻き戻しは今後のUI改善で対応
      }
    })();
  }, []);

  const isCategoryInUse = useCallback((id: string): boolean => {
    // カテゴリ使用状況の確認（サンプルデータで動作）
    const mockTodos = [
      { id: "1", categoryId: "work", title: "Test Todo", completed: false },
    ];
    return mockTodos.some((todo) => todo.categoryId === id);
  }, []);

  const deleteCategory = useCallback(
    (id: string): boolean => {
      interactedRef.current = true;
      const categoryExists = categories.some((category) => category.id === id);
      if (!categoryExists) return false;

      if (isCategoryInUse(id)) return false;

      // 楽観的に削除、API失敗時の復元は今後の改善で対応
      setCategories((prev) => prev.filter((category) => category.id !== id));
      (async () => {
        try {
          await apiDeleteCategory(id);
        } catch {
          // 失敗時の巻き戻しは今後の改善で対応
        }
      })();
      return true;
    },
    [categories, isCategoryInUse],
  );

  return {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    isCategoryInUse,
    loading,
    error,
    offline,
  };
};
