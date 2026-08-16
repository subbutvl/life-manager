import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Shell from './layout/Shell'
import SuiteGrid from './layout/SuiteGrid'
import { SUITES } from './core/suites'
import Habits from './modules/personal/habits/Habits'
import Todos from './modules/personal/todos/Todos'
import Wishlist from './modules/personal/wishlist/Wishlist'
import Expenses from './modules/finance/expenses/Expenses'
import Subscriptions from './modules/finance/subscriptions/Subscriptions'
import Bills from './modules/finance/bills/Bills'
import Assets from './modules/finance/assets/Assets'
import Health from './modules/health/Health'
import Chores from './modules/home/chores/Chores'
import HouseholdItems from './modules/home/household-items/HouseholdItems'
import Travel from './modules/travel/Travel'

const personalSuite = SUITES.find((s) => s.id === 'personal')!
const financeSuite = SUITES.find((s) => s.id === 'finance')!
const homeSuite = SUITES.find((s) => s.id === 'home')!

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/personal" replace />} />

          <Route path="/personal" element={<SuiteGrid suite={personalSuite} />} />
          <Route path="/personal/habits" element={<Habits />} />
          <Route path="/personal/todos" element={<Todos />} />
          <Route path="/personal/wishlist" element={<Wishlist />} />

          <Route path="/finance" element={<SuiteGrid suite={financeSuite} />} />
          <Route path="/finance/expenses" element={<Expenses />} />
          <Route path="/finance/subscriptions" element={<Subscriptions />} />
          <Route path="/finance/bills" element={<Bills />} />
          <Route path="/finance/assets" element={<Assets />} />

          <Route path="/health" element={<Health />} />

          <Route path="/home" element={<SuiteGrid suite={homeSuite} />} />
          <Route path="/home/chores" element={<Chores />} />
          <Route path="/home/household-items" element={<HouseholdItems />} />

          <Route path="/travel" element={<Travel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
