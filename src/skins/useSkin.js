import { useSyncExternalStore } from 'react'

// Reactive read of the current skin (html[data-skin]) — set by App.jsx from
// settings.skin. MutationObserver keeps consumers in sync on live switches
// without prop-drilling settings through Pocket.
function subscribe(cb) {
  const obs = new MutationObserver(cb)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] })
  return () => obs.disconnect()
}
function getSnapshot() {
  return document.documentElement.getAttribute('data-skin') || 'classic'
}

export function useSkin() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
