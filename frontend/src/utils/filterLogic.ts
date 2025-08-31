import type { Todo } from "../types/todo";
import type { FilterState } from "../types/filter";

export const filterByCompletion = (
  todos: Todo[],
  status: FilterState["completionStatus"],
): Todo[] => {
  if (status === "all") return todos;
  if (status === "completed") return todos.filter((todo) => todo.completed);
  if (status === "incomplete") return todos.filter((todo) => !todo.completed);
  return todos;
};

export const filterByCategories = (
  todos: Todo[],
  categoryIds: string[],
): Todo[] => {
  if (categoryIds.length === 0) return todos;
  return todos.filter((todo) => categoryIds.includes(todo.categoryId || ""));
};

export const filterByTags = (
  todos: Todo[],
  tags: string[],
  condition: "any" | "all",
): Todo[] => {
  if (tags.length === 0) return todos;

  return todos.filter((todo) => {
    if (condition === "all") {
      return tags.every((tag) => todo.tags.includes(tag));
    } else {
      return tags.some((tag) => todo.tags.includes(tag));
    }
  });
};

export const filterBySearch = (todos: Todo[], searchText: string): Todo[] => {
  const trimmedSearch = searchText.trim();
  if (trimmedSearch === "") return todos;

  return todos.filter((todo) =>
    todo.text.toLowerCase().includes(trimmedSearch.toLowerCase()),
  );
};

export const applyFilters = (todos: Todo[], filters: FilterState): Todo[] => {
  let filtered = todos;

  filtered = filterByCompletion(filtered, filters.completionStatus);
  filtered = filterByCategories(filtered, filters.categoryIds);
  filtered = filterByTags(filtered, filters.tags, filters.tagCondition);
  filtered = filterBySearch(filtered, filters.searchText);

  return filtered;
};

export const getActiveFilterCount = (filters: FilterState): number => {
  let count = 0;

  if (filters.completionStatus !== "all") count++;
  if (filters.categoryIds.length > 0) count++;
  if (filters.tags.length > 0) count++;
  if (filters.searchText.trim() !== "") count++;

  return count;
};
