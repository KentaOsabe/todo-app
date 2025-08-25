import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Paper,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useCategoryManagement } from '../hooks/useCategoryManagement'

export const CategoriesPage = () => {
  const navigate = useNavigate()
  const { categories, deleteCategory } = useCategoryManagement()
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const handleNewCategory = () => {
    navigate('/categories/new')
  }

  const handleEditCategory = (id: string) => {
    navigate(`/categories/${id}/edit`)
  }

  const handleDeleteCategory = (id: string) => {
    const confirmed = confirm('このカテゴリを削除しますか？')
    if (!confirmed) return

    const success = deleteCategory(id)
    if (success) {
      setSnackbar({
        open: true,
        message: 'カテゴリを削除しました',
        severity: 'success',
      })
    } else {
      setSnackbar({
        open: true,
        message: '使用中のカテゴリは削除できません',
        severity: 'error',
      })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj)
  }

  return (
    <Box sx={{ flex: 1 }}>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" component="h1">
            カテゴリ管理
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNewCategory}
          >
            新規作成
          </Button>
        </Box>

        {categories.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            py={4}
          >
            カテゴリがありません
          </Typography>
        ) : (
          <List>
            {categories.map(category => (
              <ListItem
                key={category.id}
                divider
                sx={{ py: 2 }}
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      edge="end"
                      aria-label="編集"
                      onClick={() => handleEditCategory(category.id)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="削除"
                      onClick={() => handleDeleteCategory(category.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }
              >
                <Box display="flex" alignItems="center" mr={2}>
                  <Chip
                    data-testid={`category-color-${category.id}`}
                    size="small"
                    sx={{
                      backgroundColor: category.color,
                      color: 'white',
                      minWidth: 16,
                      height: 16,
                      borderRadius: '50%',
                      '& .MuiChip-label': {
                        padding: 0,
                      },
                    }}
                    label=""
                  />
                </Box>
                <ListItemText
                  primary={category.name}
                  secondary={
                    <>
                      {category.description}
                      <br />
                      作成日: {formatDate(category.createdAt)} | 更新日:{' '}
                      {formatDate(category.updatedAt)}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
