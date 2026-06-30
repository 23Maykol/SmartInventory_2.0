import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import type { AuthResponse } from '../types'
import { GoogleLogin } from '@react-oauth/google'

const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await api.post<AuthResponse>('/auth/login', form)
            login(res.data.data.token, res.data.data.user)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Credenciales inválidas')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true)
        try {
            const res = await api.post<AuthResponse>('/auth/google', { credential: credentialResponse.credential })
            login(res.data.data.token, res.data.data.user)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al autenticar con Google')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            {/* Círculos decorativos de fondo para profundidad */}
            <div style={styles.bgCircle1}></div>
            <div style={styles.bgCircle2}></div>

            <div style={styles.card}>
                <header style={styles.header}>
                    <div style={styles.logoSquare}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h1 style={styles.title}>Smart Inventory</h1>
                    <p style={styles.subtitle}>Gestiona tus activos con inteligencia</p>
                </header>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Correo Electrónico</label>
                        <input
                            type="email"
                            name="email"
                            style={styles.input}
                            value={form.email}
                            onChange={handleChange}
                            placeholder="nombre@empresa.com"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            style={styles.input}
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div style={styles.errorBadge}>
                            <span style={{ marginRight: '8px' }}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div style={styles.divider}>
                    <div style={styles.dividerLine}></div>
                    <span style={styles.dividerText}>o continúa con</span>
                    <div style={styles.dividerLine}></div>
                </div>

                <div style={styles.googleContainer}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('El inicio de sesión con Google falló')}
                        useOneTap
                        shape="pill"
                        width="100%"
                    />
                </div>

                <footer style={styles.footer}>
                    <p style={styles.footerText}>
                        ¿Nuevo aquí? <Link to="/register" style={styles.link}>Crea una cuenta</Link>
                    </p>
                </footer>
            </div>
        </div>
    )
}

// Estilos modernos con enfoque UI/UX
const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f4f8',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden'
    },
    bgCircle1: {
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(55, 48, 163, 0.05))',
        top: '-100px',
        right: '-100px',
        zIndex: 0
    },
    bgCircle2: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(55, 48, 163, 0.05), rgba(79, 70, 229, 0.08))',
        bottom: '-50px',
        left: '-50px',
        zIndex: 0
    },
    card: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '2.5rem',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.5)'
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    logoSquare: {
        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.1)',
        margin: '0 auto 1.5rem auto'
    },
    title: {
        color: '#1e293b',
        fontSize: '1.75rem',
        fontWeight: 800,
        letterSpacing: '-0.025em',
        margin: 0
    },
    subtitle: {
        color: '#64748b',
        fontSize: '0.9rem',
        marginTop: '0.5rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#475569',
        marginLeft: '4px'
    },
    input: {
        padding: '0.8rem 1rem',
        borderRadius: '12px',
        border: '1.5px solid #e2e8f0',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        backgroundColor: '#f8fafc'
    },
    button: {
        marginTop: '0.5rem',
        padding: '0.8rem',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.1s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
    },
    buttonDisabled: {
        opacity: 0.7,
        cursor: 'not-allowed',
        transform: 'none'
    },
    errorBadge: {
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        padding: '0.75rem',
        borderRadius: '10px',
        fontSize: '0.85rem',
        border: '1px solid #fee2e2',
        display: 'flex',
        alignItems: 'center'
    },
    footer: {
        marginTop: '2rem',
        textAlign: 'center',
        borderTop: '1px solid #f1f5f9',
        paddingTop: '1.5rem'
    },
    footerText: {
        fontSize: '0.9rem',
        color: '#64748b'
    },
    link: {
        color: '#4f46e5',
        textDecoration: 'none',
        fontWeight: 600
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1.5rem 0',
        width: '100%',
        gap: '10px'
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#e2e8f0'
    },
    dividerText: {
        color: '#94a3b8',
        fontSize: '0.85rem',
        fontWeight: 500
    },
    googleContainer: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
    }
}

export default Login