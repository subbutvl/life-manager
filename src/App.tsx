import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Shell from './layout/Shell'
import Dashboard from './modules/dashboard/Dashboard'
import Health from './modules/health/Health'
import Vehicles from './modules/vehicles/Vehicles'
import Bills from './modules/bills/Bills'
import Habits from './modules/habits/Habits'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/health" element={<Health />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/habits" element={<Habits />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
