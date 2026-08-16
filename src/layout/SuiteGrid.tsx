import { Link } from 'react-router-dom'
import type { SuiteDef } from '../core/suites'
import './SuiteGrid.css'

export default function SuiteGrid({ suite }: { suite: SuiteDef }) {
  return (
    <div className="page">
      <h1>{suite.label}</h1>
      <div className="suite-grid">
        {suite.modules?.map((module) => (
          <Link key={module.path} to={module.path} className="suite-card">
            <span className="icon">{module.icon}</span>
            <span className="label">{module.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
