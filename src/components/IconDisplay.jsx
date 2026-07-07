// Icon is a plain string: emoji ("🎯"), an app icon path ("/icons/x.png"), or an
// uploaded data URL. Render paths/data-URLs as <img>, everything else as text.
// Security: only single-leading-slash app paths and data:image/ URLs are treated as
// images — this blocks protocol-relative URLs like "//evil.com/beacon.png" (an
// image beacon that could ride in via a crafted import) from ever hitting <img src>.
export default function IconDisplay({ icon, size = 20, className = '' }) {
  const isAppPath = typeof icon === 'string' && icon.startsWith('/') && !icon.startsWith('//')
  const isDataImage = typeof icon === 'string' && icon.startsWith('data:image/')
  if (isAppPath || isDataImage)
    return <img src={icon} width={size} height={size} className={className} alt="" style={{ objectFit: 'contain' }} />
  return <span className={className}>{icon}</span>
}
