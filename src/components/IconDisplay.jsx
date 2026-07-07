export default function IconDisplay({ icon, size = 20, className = '' }) {
  if (icon?.startsWith('/') || icon?.startsWith('data:'))
    return <img src={icon} width={size} height={size} className={className} alt="" style={{ objectFit: 'contain' }} />
  return <span className={className}>{icon}</span>
}
