import { NavLink, Outlet } from 'react-router-dom'
import { SUITES } from '../core/suites'
import './Shell.css'

export default function Shell() {
  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="sidebar-title">Life OS</div>
        <ul>
          {SUITES.map((suite) => (
            <li key={suite.path}>
              <NavLink
                to={suite.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="icon">{suite.icon}</span>
                <span className="label">{suite.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {SUITES.map((suite) => (
          <NavLink
            key={suite.path}
            to={suite.path}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span className="icon">{suite.icon}</span>
            <span className="label">{suite.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
