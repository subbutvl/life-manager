export interface NavItem {
  path: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/health', label: 'Health', icon: '💊' },
  { path: '/vehicles', label: 'Vehicles', icon: '🚗' },
  { path: '/bills', label: 'Bills', icon: '💵' },
  { path: '/habits', label: 'Habits', icon: '✅' },
]
