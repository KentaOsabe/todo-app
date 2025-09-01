import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  Autocomplete,
  TextField,
  Button,
  Badge,
  Typography,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import type { FilterState } from "../types/filter";
import type { Category } from "../types/category";

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  categories: Category[];
  availableTags: string[];
  activeFilterCount: number;
}

export const FilterBar = ({
  filters,
  onFiltersChange,
  onReset,
  categories,
  availableTags,
  activeFilterCount,
}: FilterBarProps) => {
  const handleCompletionStatusChange = (
    _event: React.MouseEvent<HTMLElement>,
    newStatus: FilterState["completionStatus"] | null,
  ) => {
    if (newStatus !== null) {
      onFiltersChange({ completionStatus: newStatus });
    }
  };

  const handleCategoriesChange = (
    _event: React.SyntheticEvent,
    newValue: Category[],
  ) => {
    onFiltersChange({
      categoryIds: newValue.map((category) => category.id),
    });
  };

  const handleTagsChange = (
    _event: React.SyntheticEvent,
    newTags: string[],
  ) => {
    onFiltersChange({ tags: newTags });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ searchText: event.target.value });
  };

  const handleTagConditionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onFiltersChange({ tagCondition: event.target.checked ? "all" : "any" });
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Badge
          badgeContent={activeFilterCount > 0 ? activeFilterCount : undefined}
          color="primary"
          sx={{ mr: 1 }}
        >
          <FilterIcon />
        </Badge>
        <Typography variant="h6" component="h2">
          フィルター
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          size="small"
          startIcon={<ClearIcon />}
          onClick={onReset}
          disabled={activeFilterCount === 0}
        >
          リセット
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        {/* 完了状態フィルター */}
        <FormControl>
          <Typography variant="subtitle2" gutterBottom>
            完了状態
          </Typography>
          <ToggleButtonGroup
            value={filters.completionStatus}
            exclusive
            onChange={handleCompletionStatusChange}
            size="small"
            aria-label="完了状態フィルター"
          >
            <ToggleButton value="all" aria-label="全て">
              全て
            </ToggleButton>
            <ToggleButton value="incomplete" aria-label="未完了">
              未完了
            </ToggleButton>
            <ToggleButton value="completed" aria-label="完了済み">
              完了済み
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        {/* カテゴリフィルター */}
        <Box sx={{ minWidth: 200 }}>
          <Autocomplete
            multiple
            options={categories}
            value={categories.filter((cat) =>
              filters.categoryIds.includes(cat.id),
            )}
            onChange={handleCategoriesChange}
            getOptionLabel={(option) => option.name}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  label={option.name}
                  size="small"
                  style={{ backgroundColor: option.color, color: "white" }}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="カテゴリ" size="small" />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Chip
                  label={option.name}
                  size="small"
                  style={{ backgroundColor: option.color, color: "white" }}
                />
              </li>
            )}
          />
        </Box>

        {/* タグフィルター */}
        <Box sx={{ minWidth: 200 }}>
          <Autocomplete
            multiple
            options={availableTags}
            value={filters.tags}
            onChange={handleTagsChange}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="タグ"
                size="small"
                variant="outlined"
              />
            )}
          />
          <FormControlLabel
            control={
              <Switch
                role="switch"
                checked={filters.tagCondition === "all"}
                onChange={handleTagConditionChange}
                size="small"
              />
            }
            label={`タグ条件: ${filters.tagCondition === "all" ? "すべて" : "いずれか"}`}
            sx={{ mt: 0.5 }}
          />
        </Box>

        {/* 検索フィルター */}
        <TextField
          label="検索"
          value={filters.searchText}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: 150 }}
          placeholder="Todoを検索..."
        />
      </Box>
    </Paper>
  );
};
