/**
 * Avatar Bileşeni
 * 
 * Props:
 * - src: string - Resim URL
 * - alt: string
 * - name: string - İsimden baş harf
 * - size: 'sm' | 'md' | 'lg' | 'xl'
 * - status: 'online' | 'offline' | 'away' | 'busy'
 * - shape: 'circle' | 'square'
 */
const Avatar = ({
    src,
    alt = '',
    name = '',
    size = 'md',
    status,
    shape = 'circle',
    className = ''
}) => {
    const getInitials = (name) => {
        if (!name) return '?'
        const parts = name.trim().split(' ')
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'var(--bbva-green)'
            case 'offline': return 'var(--bbva-gray-400)'
            case 'away': return 'var(--bbva-orange)'
            case 'busy': return 'var(--status-danger)'
            default: return null
        }
    }

    return (
        <div className={`avatar avatar-${size} avatar-${shape} ${className}`}>
            {src ? (
                <img src={src} alt={alt || name} className="avatar-image" />
            ) : (
                <span className="avatar-initials">{getInitials(name)}</span>
            )}

            {status && (
                <span
                    className="avatar-status"
                    style={{ background: getStatusColor(status) }}
                />
            )}
        </div>
    )
}

// Avatar Group - Birden fazla avatar için
export const AvatarGroup = ({
    avatars = [],
    max = 4,
    size = 'md',
    className = ''
}) => {
    const visible = avatars.slice(0, max)
    const remaining = avatars.length - max

    return (
        <div className={`avatar-group ${className}`}>
            {visible.map((avatar, index) => (
                <Avatar
                    key={avatar.id || index}
                    src={avatar.src}
                    name={avatar.name}
                    size={size}
                    status={avatar.status}
                />
            ))}
            {remaining > 0 && (
                <div className={`avatar avatar-${size} avatar-more`}>
                    <span>+{remaining}</span>
                </div>
            )}
        </div>
    )
}

export default Avatar
