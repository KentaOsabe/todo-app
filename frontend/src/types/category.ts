export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryFormData {
  name: string;
  color: string;
  description?: string;
}

export interface UseCategoryManagementReturn {
  categories: Category[];
  createCategory: (data: CategoryFormData) => void;
  updateCategory: (id: string, data: CategoryFormData) => void;
  deleteCategory: (id: string) => boolean;
  isCategoryInUse: (id: string) => boolean;
}
