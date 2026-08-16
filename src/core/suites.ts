export interface ModuleDef {
  path: string
  label: string
  icon: string
}

export interface SuiteDef {
  id: string
  path: string
  label: string
  icon: string
  /** Sub-modules shown as a card grid at the suite's index route. Omitted for single-module suites, which route straight through to their module. */
  modules?: ModuleDef[]
}

export const SUITES: SuiteDef[] = [
  {
    id: 'personal',
    path: '/personal',
    label: 'Personal',
    icon: '🧑',
    modules: [
      { path: '/personal/habits', label: 'Habits', icon: '✅' },
      { path: '/personal/todos', label: 'Todos', icon: '📋' },
      { path: '/personal/wishlist', label: 'Wishlist', icon: '🎁' },
    ],
  },
  {
    id: 'finance',
    path: '/finance',
    label: 'Finance',
    icon: '💰',
    modules: [
      { path: '/finance/expenses', label: 'Expenses', icon: '🧾' },
      { path: '/finance/subscriptions', label: 'Subscriptions', icon: '🔁' },
      { path: '/finance/bills', label: 'Bills', icon: '💵' },
      { path: '/finance/assets', label: 'Assets', icon: '📈' },
    ],
  },
  {
    id: 'health',
    path: '/health',
    label: 'Health',
    icon: '💊',
  },
  {
    id: 'home',
    path: '/home',
    label: 'Home',
    icon: '🏠',
    modules: [
      { path: '/home/chores', label: 'Chores', icon: '🧹' },
      { path: '/home/household-items', label: 'Household Items', icon: '📦' },
    ],
  },
  {
    id: 'travel',
    path: '/travel',
    label: 'Travel',
    icon: '✈️',
  },
]
