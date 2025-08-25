import { useNavigate } from 'react-router-dom'
import { Paper, Box, Typography, Button, Stack } from '@mui/material'
import { Home as HomeIcon, Category as CategoryIcon } from '@mui/icons-material'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoCategories = () => {
    navigate('/categories')
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
      <Paper
        elevation={3}
        sx={{ p: 6, mt: 8, textAlign: 'center', width: '100%' }}
      >
        <Box mb={4}>
          <Typography
            variant="h1"
            component="h1"
            color="error"
            sx={{ fontSize: '6rem', fontWeight: 'bold' }}
          >
            404
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            color="text.primary"
            gutterBottom
          >
            ページが見つかりません
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 2, mb: 4 }}
          >
            お探しのページは存在しないか、移動した可能性があります
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            size="large"
          >
            ホームに戻る
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CategoryIcon />}
            onClick={handleGoCategories}
            size="large"
          >
            カテゴリ管理に戻る
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
