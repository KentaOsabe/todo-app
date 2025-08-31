import { useState } from "react";
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
import { Add as AddIcon } from "@mui/icons-material";
import type { Category } from "../types/category";

interface TodoFormData {
  text: string;
  categoryId?: string;
  tags: string[];
}

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => void;
  categories: Category[];
}

export const TodoForm = ({ onSubmit, categories }: TodoFormProps) => {
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tagsInput, setTagsInput] = useState("");

  const handleSubmit = () => {
    if (text.trim() === "") return;

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    onSubmit({
      text: text.trim(),
      categoryId: categoryId || undefined,
      tags,
    });

    // フォームをクリア
    setText("");
    setCategoryId("");
    setTagsInput("");
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategoryId(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* テキスト入力 */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="新しいタスクを入力"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        {/* カテゴリとタグの入力行 */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* カテゴリ選択 */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="category-select-label">カテゴリ</InputLabel>
            <Select
              labelId="category-select-label"
              value={categoryId}
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
            fullWidth
            variant="outlined"
            label="タグ"
            placeholder="タグをカンマ区切りで入力"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            helperText="例: 重要, 急ぎ, 今日中"
          />

          {/* 追加ボタン */}
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<AddIcon />}
            sx={{ minWidth: 120, height: "fit-content" }}
          >
            追加
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
