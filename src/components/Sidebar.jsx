import { useState, useEffect } from 'react'

export default function Sidebar({ currentPage, onNavigate, onAddHabit, onAddTask, onOpenSettings }) {
  const [isMobile, setIsMobile] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (isMobile) {
    return (
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-btn ${currentPage === 'dashboard' ? 'bottom-nav-btn--active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <DashboardIcon />
          <span className="bottom-nav-label">Home</span>
        </button>
        <button
          className={`bottom-nav-btn ${currentPage === 'goals' ? 'bottom-nav-btn--active' : ''}`}
          onClick={() => onNavigate('goals')}
        >
          <GoalsIcon />
          <span className="bottom-nav-label">Goals</span>
        </button>
        <div className="fab-wrapper">
          {fabOpen && (
            <div className="fab-menu">
              <button className="fab-menu-item" onClick={() => { setFabOpen(false); onAddHabit() }}>
                ⚡ New Habit
              </button>
              <button className="fab-menu-item" onClick={() => { setFabOpen(false); onAddTask() }}>
                🔧 New Task
              </button>
            </div>
          )}
          <button
            className={`bottom-nav-fab ${fabOpen ? 'bottom-nav-fab--open' : ''}`}
            onClick={() => setFabOpen(!fabOpen)}
            aria-label="Add new item"
          >
            <PlusIcon />
          </button>
        </div>
        <button
          className={`bottom-nav-btn ${currentPage === 'analytics' ? 'bottom-nav-btn--active' : ''}`}
          onClick={() => onNavigate('analytics')}
        >
          <AnalyticsIcon />
          <span className="bottom-nav-label">Stats</span>
        </button>
        <button className="bottom-nav-btn" onClick={onOpenSettings}>
          <SettingsIcon />
          <span className="bottom-nav-label">More</span>
        </button>
      </nav>
    )
  }

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
        <button
          className={`sidebar-btn ${currentPage === 'pocket' ? 'sidebar-btn--active' : ''}`}
          onClick={() => onNavigate('pocket')}
          title="Pocket Tracker"
        >
          <WalletIcon />
          <span className="sidebar-label">Pocket</span>
        </button>
      </div>
    </nav>
  )
}

function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
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
