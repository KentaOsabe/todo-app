import { useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { Check as CheckIcon, Close as CloseIcon } from "@mui/icons-material";
import type { EditTodoData } from "../types/todo";
import type { Category } from "../types/category";

interface TodoEditFormProps {
  editData: EditTodoData;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
  onUpdateData: (data: Partial<EditTodoData>) => void;
}

export const TodoEditForm = ({
  editData,
  categories,
  onSave,
  onCancel,
  onUpdateData,
}: TodoEditFormProps) => {
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  }, []);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateData({ text: event.target.value });
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    const categoryId = event.target.value || undefined;
    onUpdateData({ categoryId });
  };

  const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tagsInput = event.target.value;
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    onUpdateData({ tags });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSave();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onCancel();
    }
  };

  const tagsInputValue = editData.tags.join(", ");

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* テキスト入力 */}
        <TextField
          inputRef={textInputRef}
          inputProps={{ "data-testid": "todoedit-text" }}
          fullWidth
          variant="outlined"
          size="small"
          multiline
          maxRows={3}
          value={editData.text}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
        />

        {/* カテゴリとタグの入力行 */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          {/* カテゴリ選択 */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="edit-category-select-label">カテゴリ</InputLabel>
            <Select
              labelId="edit-category-select-label"
              data-testid="todoedit-category"
              value={editData.categoryId || ""}
              label="カテゴリ"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">
                <em>なし</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* タグ入力 */}
          <TextField
            size="small"
            variant="outlined"
            label="タグ"
            placeholder="タグをカンマ区切りで入力"
            inputProps={{ "data-testid": "todoedit-tags" }}
            value={tagsInputValue}
            onChange={handleTagsChange}
            sx={{ flex: 1 }}
          />

          {/* アクションボタン */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={onSave}
              startIcon={<CheckIcon />}
              color="primary"
            >
              保存
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={onCancel}
              startIcon={<CloseIcon />}
            >
              キャンセル
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
