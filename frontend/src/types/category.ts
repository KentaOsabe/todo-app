export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryUsageCounts {
  todos: number;
}

export interface CategoryUsage {
  inUse: boolean;
  counts: CategoryUsageCounts;
}

export interface CategoryFormData {
  name: string;
  color: string;
  description?: string;
}

export type DeleteCategoryResult =
  | { status: "success" }
  | { status: "inUse" }
  | { status: "usageCheckFailed" }
  | { status: "notFound" }
  | { status: "error"; message?: string };

export interface UseCategoryManagementReturn {
  categories: Category[];
  createCategory: (data: CategoryFormData) => void;
  updateCategory: (id: string, data: CategoryFormData) => void;
  deleteCategory: (id: string) => Promise<DeleteCategoryResult>;
  isCategoryInUse: (id: string) => Promise<boolean>;
  // UI/UX改善: 追加情報（任意）
  loading?: boolean;
  error?: string | null;
  offline?: boolean;
}
