import { Link } from 'react-router-dom'

const InDevelopment = () => (
    <div style={styles.container}>
        <h1 style={styles.icon}>🚧</h1>
        <h2 style={styles.title}>Página en desarrollo</h2>
        <p style={styles.desc}>Esta sección estará disponible próximamente.</p>
        <Link to="/dashboard" style={styles.btn}>Volver al Dashboard</Link>
    </div>
)

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
    icon: { fontSize: '5rem', marginBottom: '1rem' },
    title: { fontSize: '1.8rem', marginBottom: '0.8rem' },
    desc: { opacity: 0.8, marginBottom: '2rem' },
    btn: {
        background: 'white',
        color: '#1e3a5f',
        padding: '0.8rem 2rem',
        borderRadius: '8px',
        fontWeight: 600,
        textDecoration: 'none'
    }
}

export default InDevelopment