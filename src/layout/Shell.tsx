import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS } from '../core/navConfig'
import './Shell.css'

export default function Shell() {
  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="sidebar-title">Life OS</div>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
