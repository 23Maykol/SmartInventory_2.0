import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation() // Para saber qué link está activo

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Función para aplicar estilo al link activo
    const getLinkStyle = (path: string) => ({
        ...styles.link,
        ...(location.pathname === path ? styles.activeLink : {})
    })

    return (
        <nav style={styles.nav}>
            <div style={styles.brandContainer}>
                <div style={styles.logoSquare}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                </div>
                <Link to="/dashboard" style={styles.brandLink}>Smart Inventory</Link>
            </div>

            <div style={styles.navLinks}>
                <Link to="/dashboard" style={getLinkStyle('/dashboard')}>Dashboard</Link>
                <Link to="/products" style={getLinkStyle('/products')}>Productos</Link>
                <Link to="/movements" style={getLinkStyle('/movements')}>Movimientos</Link>
                {isAdmin && <Link to="/users" style={getLinkStyle('/users')}>Usuarios</Link>}
            </div>

            <div style={styles.userSection}>
                <div style={styles.userInfo}>
                    <span style={styles.userName}>{user?.name}</span>
                    <span style={styles.userRole}>{user?.role}</span>
                </div>

                {/* Avatar circular visual */}
                <div style={styles.avatar}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>

                <button onClick={handleLogout} style={styles.logoutBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Salir
                </button>
            </div>
        </nav>
    )
}

const styles: Record<string, React.CSSProperties> = {
    nav: {
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '0 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '72px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
    },
    brandContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    logoSquare: {
        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)'
    },
    brandLink: {
        color: '#0f172a',
        fontWeight: 800,
        textDecoration: 'none',
        fontSize: '1.25rem',
        letterSpacing: '-0.03em'
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    link: {
        color: '#64748b',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: 500,
        padding: '8px 16px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
    },
    activeLink: {
        color: '#4f46e5',
        backgroundColor: '#eef2ff',
        fontWeight: 600
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem'
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    userName: {
        color: '#0f172a',
        fontSize: '0.9rem',
        fontWeight: 600
    },
    userRole: {
        color: '#64748b',
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        fontWeight: 500
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '1rem',
        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff1f2',
        border: '1px solid #ffe4e6',
        color: '#e11d48',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 600,
        transition: 'all 0.2s ease'
    }
}

export default Navbar