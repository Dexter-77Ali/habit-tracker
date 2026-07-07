import { Component } from 'react'

// Last line of defense: if a render throws (e.g. corrupt imported/synced data),
// show a recovery screen instead of a permanent white screen that survives reload.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="error-boundary">
        <div className="error-boundary-card">
          <h1>&gt; SYSTEM FAULT</h1>
          <p>Something in your saved data made the app crash. You can retry, or reset local data (this device only — synced data on the server is untouched).</p>
          <div className="error-boundary-actions">
            <button className="btn btn-ghost" onClick={() => window.location.reload()}>Retry</button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (confirm('Clear this device’s local data and reload? Server-synced data is not affected.')) {
                  try { window.localStorage.clear() } catch { /* ignore */ }
                  window.location.reload()
                }
              }}
            >
              Reset local data
            </button>
          </div>
          <pre className="error-boundary-detail">{String(this.state.error?.message || this.state.error)}</pre>
        </div>
      </div>
    )
  }
}
