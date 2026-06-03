import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NotFound = () => {
    const { isAuthenticated, isSuperAdmin } = useAuth()
    const navigate = useNavigate()

    const handleBack = () => {
        if (!isAuthenticated) {
            navigate('/login')
        } else if (isSuperAdmin) {
            navigate('/super-dashboard')
        } else {
            navigate('/dashboard')
        }
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.code}>404</h1>
            <h2 style={styles.title}>Página no encontrada</h2>
            <p style={styles.desc}>La página que buscas no existe o fue movida.</p>
            <button onClick={handleBack} style={styles.btn}>Volver al inicio</button>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a5f, #2d6a4f)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
    },
    code: { fontSize: '6rem', fontWeight: 900, marginBottom: '1rem' },
    title: { fontSize: '1.8rem', marginBottom: '0.8rem' },
    desc: { opacity: 0.8, marginBottom: '2rem' },
    btn: {
        background: 'white',
        color: '#1e3a5f',
        padding: '0.8rem 2rem',
        borderRadius: '8px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        textDecoration: 'none'
    }
}

export default NotFound