import { memo } from 'react'
import { AppBar, Tabs, Tab, styled, IconButton, Box } from '@mui/material'
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTab-root': {
    color: theme.palette.primary.contrastText,
  },
  '& .MuiTab-root.Mui-selected': {
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
}))

interface NavigationProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export const Navigation = memo(
  ({ isDarkMode, toggleDarkMode }: NavigationProps) => {
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
)
