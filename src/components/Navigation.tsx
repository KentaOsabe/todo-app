import { AppBar, Tabs, Tab, styled, IconButton, Box } from '@mui/material'
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'

const StyledTabs = styled(Tabs)(() => ({
  '& .MuiTab-root': {
    color: 'rgba(255, 255, 255, 0.8)', // 非選択状態の色を少し明るく
  },
  '& .MuiTab-root.Mui-selected': {
    color: 'white',
    fontWeight: 'bold',
  },
}))

interface NavigationProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export const Navigation = ({ isDarkMode, toggleDarkMode }: NavigationProps) => {
  const location = useLocation()

  // 現在のパスに基づいてタブの値を決定
  const getTabValue = () => {
    if (location.pathname === '/') return 0
    if (location.pathname.startsWith('/categories')) return 1
    return false // どのタブにも該当しない場合
  }

  return (
    <AppBar position="static">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <StyledTabs value={getTabValue()} aria-label="navigation tabs">
          <Tab label="Todo" component={Link} to="/" aria-label="Todo page" />
          <Tab
            label="カテゴリ管理"
            component={Link}
            to="/categories"
            aria-label="Categories management page"
          />
        </StyledTabs>
        <IconButton
          onClick={toggleDarkMode}
          color="inherit"
          aria-label={
            isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
          }
          sx={{ mr: 2 }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>
    </AppBar>
  )
}
