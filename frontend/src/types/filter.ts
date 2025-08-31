export interface FilterState {
  completionStatus: "all" | "completed" | "incomplete";
  categoryIds: string[];
  tags: string[];
  tagCondition: "any" | "all";
  searchText: string;
}
