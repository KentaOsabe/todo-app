export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  categoryId?: string;
  tags: string[];
  order?: number;
}

export interface EditTodoData {
  text: string;
  categoryId?: string;
  tags: string[];
}
