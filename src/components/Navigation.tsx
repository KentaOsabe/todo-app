import { AppBar, Tabs, Tab } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

export const Navigation = () => {
  const location = useLocation()

  // 現在のパスに基づいてタブの値を決定
  const getTabValue = () => {
    if (location.pathname === '/') return 0
    if (location.pathname.startsWith('/categories')) return 1
    return false // どのタブにも該当しない場合
  }

  return (
    <AppBar position="static">
      <Tabs value={getTabValue()} aria-label="navigation tabs">
        <Tab label="Todo" component={Link} to="/" aria-label="Todo page" />
        <Tab
          label="カテゴリ管理"
          component={Link}
          to="/categories"
          aria-label="Categories management page"
        />
      </Tabs>
    </AppBar>
  )
}
