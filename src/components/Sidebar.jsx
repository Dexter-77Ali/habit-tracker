export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">LT</div>
      <div className="sidebar-nav">
        <button
          className={`sidebar-btn ${currentPage === 'dashboard' ? 'sidebar-btn--active' : ''}`}
          onClick={() => onNavigate('dashboard')}
          title="Dashboard"
        >
          <DashboardIcon />
          <span className="sidebar-label">Dashboard</span>
        </button>
        <button
          className={`sidebar-btn ${currentPage === 'goals' ? 'sidebar-btn--active' : ''}`}
          onClick={() => onNavigate('goals')}
          title="Goals"
        >
          <GoalsIcon />
          <span className="sidebar-label">Goals</span>
        </button>
        <button
          className={`sidebar-btn ${currentPage === 'analytics' ? 'sidebar-btn--active' : ''}`}
          onClick={() => onNavigate('analytics')}
          title="Analytics"
        >
          <AnalyticsIcon />
          <span className="sidebar-label">Analytics</span>
        </button>
      </div>
    </nav>
  )
}

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function GoalsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function AnalyticsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
