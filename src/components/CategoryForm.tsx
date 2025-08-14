import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material'
import { useCategoryManagement } from '../hooks/useCategoryManagement'
import type { CategoryFormData } from '../types/category'

export const CategoryForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { categories, createCategory, updateCategory } = useCategoryManagement()

  const isEdit = Boolean(id)
  const existingCategory = isEdit ? categories.find(cat => cat.id === id) : null

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: '#1976d2',
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 編集モード時の初期値設定
  useEffect(() => {
    if (isEdit && existingCategory) {
      setFormData({
        name: existingCategory.name,
        color: existingCategory.color,
        description: existingCategory.description || '',
      })
    }
  }, [isEdit, existingCategory])

  // 編集モードで存在しないカテゴリの場合
  if (isEdit && !existingCategory) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Alert severity="error">カテゴリが見つかりません</Alert>
        </Paper>
      </Container>
    )
  }

  const handleChange =
    (field: keyof CategoryFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: event.target.value,
      }))

      // エラーをクリア
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: '',
        }))
      }
    }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 必須チェック
    if (!formData.name.trim()) {
      newErrors.name = 'カテゴリ名は必須です'
    } else {
      // 重複チェック（編集時は自分以外をチェック）
      const isDuplicate = categories.some(
        cat => cat.name === formData.name.trim() && cat.id !== id
      )

      if (isDuplicate) {
        newErrors.name = 'このカテゴリ名は既に存在します'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData: CategoryFormData = {
      name: formData.name.trim(),
      color: formData.color,
      description: formData.description?.trim(),
    }

    if (isEdit && id) {
      updateCategory(id, submitData)
    } else {
      createCategory(submitData)
    }

    navigate('/categories')
  }

  const handleCancel = () => {
    navigate('/categories')
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? 'カテゴリ編集' : 'カテゴリ新規作成'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="カテゴリ名"
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              required
            />

            <TextField
              fullWidth
              label="色"
              type="color"
              value={formData.color}
              onChange={handleChange('color')}
              sx={{ maxWidth: 200 }}
            />

            <TextField
              fullWidth
              label="説明"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange('description')}
            />

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button type="submit" variant="contained" color="primary">
                {isEdit ? '更新' : '作成'}
              </Button>

              <Button variant="outlined" onClick={handleCancel}>
                キャンセル
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
