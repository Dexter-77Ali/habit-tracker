import { useState, useEffect, useRef } from 'react'
import { formatFullDate } from '../utils/dateUtils'
import { getLevel } from '../utils/levelUtils'
import { supabase } from '../lib/supabase'
import { canNotify } from '../utils/notificationUtils'
import IconDisplay from './IconDisplay'

const THEMES = [
  { id: 'matrix', label: 'Matrix', color: '#00ff41' },
  { id: 'cyberpunk', label: 'Cyber', color: '#ff2a6d' },
  { id: 'midnight', label: 'Night', color: '#7c6cff' },
  { id: 'crimson', label: 'Blood', color: '#dc143c' },
  { id: 'arctic', label: 'Arctic', color: '#0066ff' },
]

export default function Header({ streak, dayComplete, allTimeXP, onExport, onImport, theme, onSetTheme, shortcutsOpen, onToggleShortcuts, user, onSignOut, settingsOpen, onSetSettingsOpen, reminderTime, onSetReminderTime }) {
  const level = getLevel(allTimeXP)
  const setSettingsOpen = onSetSettingsOpen // lifted to App so the mobile "More" nav button can open it
  const settingsRef = useRef(null)

  useEffect(() => {
    if (!settingsOpen) return
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [settingsOpen])

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="app-title">Life Tracker</h1>
        <p className="header-date">{formatFullDate()}</p>
      </div>
      <div className="header-right">
        {dayComplete && (
          <span className="day-complete-badge">All Done ✓</span>
        )}

        <div className="level-badge-header" title={`${allTimeXP.toLocaleString()} all-time XP`}>
          <IconDisplay icon={level.icon} size={18} className="level-icon-sm" />
          <span className="level-title-sm">Lv.{level.level}</span>
        </div>

        <div className={`streak-badge ${streak > 0 ? 'streak-badge--active' : ''} ${streak >= 7 ? 'streak-badge--hot' : ''}`}>
          <span className="streak-flame">🔥</span>
          <span className="streak-count">{streak}</span>
        </div>

        <div className="settings-wrapper" ref={settingsRef}>
          <button
            className="icon-btn settings-trigger"
            onClick={() => setSettingsOpen(!settingsOpen)}
            aria-label="Settings"
            title="Settings"
          >
            <GearIcon />
          </button>
          {settingsOpen && (
            <div className="settings-dropdown">
              <button className="settings-item" onClick={() => { onToggleShortcuts(); setSettingsOpen(false) }}>
                ⌨️ Keyboard shortcuts
              </button>
              <button className="settings-item" onClick={() => { onExport(); setSettingsOpen(false) }}>
                📥 Export data
              </button>
              <label className="settings-item settings-item--label">
                📤 Import data
                <input type="file" accept=".json" onChange={(e) => { onImport(e); setSettingsOpen(false) }} hidden />
              </label>
              {canNotify() && (
                <div className="settings-reminder">
                  <span className="settings-reminder-label">🔔 Daily reminder</span>
                  <div className="settings-reminder-row">
                    <input
                      type="time"
                      className="settings-reminder-input"
                      value={reminderTime || ''}
                      onChange={(e) => onSetReminderTime(e.target.value || null)}
                    />
                    {reminderTime && (
                      <button className="settings-reminder-off" onClick={() => onSetReminderTime(null)} title="Turn off reminder">✕</button>
                    )}
                  </div>
                </div>
              )}
              <div className="theme-picker">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className="theme-pill"
                    style={{ '--pill-color': t.color }}
                    data-active={theme === t.id ? 'true' : 'false'}
                    onClick={() => onSetTheme(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {user && onSignOut && (
                <>
                  <div className="settings-divider" />
                  <div className="settings-user">{user.email}</div>
                  <PasswordChange />
                  <button className="settings-item settings-item--danger" onClick={() => { onSignOut(); setSettingsOpen(false) }}>
                    🚪 Sign out
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {shortcutsOpen && (
          <div className="shortcuts-panel">
            <div className="shortcuts-title">Keyboard Shortcuts</div>
            <div className="shortcut-row"><kbd className="shortcut-key">N</kbd> New habit</div>
            <div className="shortcut-row"><kbd className="shortcut-key">T</kbd> New task</div>
            <div className="shortcut-row"><kbd className="shortcut-key">R</kbd> New reward</div>
            <div className="shortcut-row"><kbd className="shortcut-key">←</kbd> Previous day</div>
            <div className="shortcut-row"><kbd className="shortcut-key">→</kbd> Next day</div>
            <div className="shortcut-row"><kbd className="shortcut-key">Esc</kbd> Close modal</div>
            <div className="shortcut-row"><kbd className="shortcut-key">?</kbd> Toggle this panel</div>
          </div>
        )}
      </div>
    </header>
  )
}

function PasswordChange() {
  const [open, setOpen] = useState(false)
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState(null)

  if (!open) return (
    <button className="settings-item" onClick={() => setOpen(true)}>
      🔑 Change password
    </button>
  )

  const handleChange = async () => {
    if (pw.length < 6) { setMsg('Min 6 characters'); return }
    const { error } = await supabase.auth.updateUser({ password: pw })
    setMsg(error ? error.message : 'Password updated!')
    if (!error) { setPw(''); setTimeout(() => { setOpen(false); setMsg(null) }, 1500) }
  }

  return (
    <div style={{ padding: '0.5rem 0.75rem' }}>
      <input
        type="password"
        value={pw}
        onChange={e => setPw(e.target.value)}
        placeholder="new password"
        className="auth-input"
        style={{ fontSize: '0.75rem', padding: '0.4rem', marginBottom: '0.3rem' }}
      />
      <button className="settings-item" onClick={handleChange} style={{ textAlign: 'center' }}>
        Save password
      </button>
      {msg && <div style={{ fontSize: '0.7rem', color: 'var(--accent)', padding: '0.2rem 0' }}>{msg}</div>}
    </div>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
