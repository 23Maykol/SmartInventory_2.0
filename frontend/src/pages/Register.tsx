import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

// ─── Password strength helpers ────────────────────────────
const rules = [
    { id: 'len',     label: 'Al menos 8 caracteres',       test: (p: string) => p.length >= 8 },
    { id: 'upper',   label: 'Una letra mayúscula (A-Z)',    test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lower',   label: 'Una letra minúscula (a-z)',    test: (p: string) => /[a-z]/.test(p) },
    { id: 'number',  label: 'Un número (0-9)',               test: (p: string) => /[0-9]/.test(p) },
    { id: 'special', label: 'Un carácter especial (!@#$%)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

const strengthConfig = [
    { label: 'Muy débil',  color: '#ef4444', bg: '#fee2e2' },
    { label: 'Débil',      color: '#f97316', bg: '#ffedd5' },
    { label: 'Regular',    color: '#eab308', bg: '#fef9c3' },
    { label: 'Buena',      color: '#22c55e', bg: '#dcfce7' },
    { label: 'Excelente',  color: '#10b981', bg: '#d1fae5' },
]

// ─── Validation helpers ───────────────────────────────────
const validateName  = (v: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(v.trim()) && v.trim().length >= 2
const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

// ─── Component ────────────────────────────────────────────
const Register = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [touched, setTouched] = useState({ name: false, email: false, password: false })
    const [showPwd, setShowPwd] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    // Password strength (0-5)
    const passedRules = useMemo(() => rules.map(r => r.test(form.password)), [form.password])
    const strength = useMemo(() => passedRules.filter(Boolean).length, [passedRules])
    const strengthInfo = strengthConfig[Math.max(0, strength - 1)]

    const nameError  = touched.name  && !validateName(form.name)   ? 'Solo letras, espacios y guiones. Mín. 2 caracteres.' : ''
    const emailError = touched.email && !validateEmail(form.email)  ? 'Ingresa un email válido.' : ''
    const pwdError   = touched.password && strength < 5             ? 'La contraseña no cumple todos los requisitos.' : ''

    const isFormValid = validateName(form.name) && validateEmail(form.email) && strength === 5

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched({ ...touched, [e.target.name]: true })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setTouched({ name: true, email: true, password: true })
        if (!isFormValid) return

        setLoading(true)
        try {
            await api.post('/auth/register', form)
            setSuccess('Usuario registrado exitosamente. Redirigiendo...')
            setTimeout(() => navigate('/login'), 2000)
        } catch (err: any) {
            const errors = err.response?.data?.errors
            if (errors) {
                setError(errors.map((e: any) => e.message).join(', '))
            } else {
                setError(err.response?.data?.message || 'Error al registrarse')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
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
                    <p style={styles.subtitle}>Crea tu cuenta de acceso</p>
                </header>

                <form onSubmit={handleSubmit} style={styles.form}>

                    {/* ── Nombre ── */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nombre completo</label>
                        <input
                            type="text"
                            name="name"
                            style={{ ...styles.input, ...(nameError ? styles.inputError : touched.name && form.name ? styles.inputOk : {}) }}
                            value={form.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Ej: María García"
                            autoComplete="name"
                        />
                        {nameError && <span style={styles.fieldError}>{nameError}</span>}
                    </div>

                    {/* ── Email ── */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Correo electrónico</label>
                        <input
                            type="email"
                            name="email"
                            style={{ ...styles.input, ...(emailError ? styles.inputError : touched.email && form.email ? styles.inputOk : {}) }}
                            value={form.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="correo@ejemplo.com"
                            autoComplete="email"
                        />
                        {emailError && <span style={styles.fieldError}>{emailError}</span>}
                    </div>

                    {/* ── Contraseña ── */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPwd ? 'text' : 'password'}
                                name="password"
                                style={{
                                    ...styles.input,
                                    paddingRight: '3rem',
                                    ...(pwdError ? styles.inputError : touched.password && strength === 5 ? styles.inputOk : {})
                                }}
                                value={form.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Contraseña segura"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(!showPwd)}
                                style={styles.eyeBtn}
                                tabIndex={-1}
                                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPwd ? (
                                    // Eye-off icon
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    // Eye icon
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* ── Barra de fortaleza ── */}
                        {form.password.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={styles.strengthBarTrack}>
                                    {[1,2,3,4,5].map(i => (
                                        <div
                                            key={i}
                                            style={{
                                                ...styles.strengthBarSegment,
                                                background: i <= strength ? strengthInfo.color : '#e2e8f0',
                                                transition: 'background 0.3s ease'
                                            }}
                                        />
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: strengthInfo.color }}>
                                    {strengthInfo.label}
                                </span>
                            </div>
                        )}

                        {/* ── Checklist de requisitos ── */}
                        {(form.password.length > 0 || touched.password) && (
                            <ul style={styles.reqList}>
                                {rules.map((r, i) => (
                                    <li key={r.id} style={{ ...styles.reqItem, color: passedRules[i] ? '#059669' : '#94a3b8' }}>
                                        <span style={{ marginRight: '6px', fontSize: '0.9rem' }}>
                                            {passedRules[i] ? '✓' : '○'}
                                        </span>
                                        {r.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* ── Mensajes globales ── */}
                    {error && (
                        <div style={styles.errorBadge}>
                            <span style={{ marginRight: '8px' }}>⚠️</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={styles.successBadge}>
                            <span style={{ marginRight: '8px' }}>✅</span>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        style={loading || !isFormValid ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                        disabled={loading || !isFormValid}
                    >
                        {loading ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                </form>

                <footer style={styles.footer}>
                    <p style={styles.footerText}>
                        ¿Ya tienes cuenta? <Link to="/login" style={styles.link}>Inicia sesión aquí</Link>
                    </p>
                </footer>
            </div>
        </div>
    )
}

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
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(10px)',
        padding: '2.5rem',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.5)'
    },
    header: { textAlign: 'center', marginBottom: '2rem' },
    logoSquare: {
        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
        margin: '0 auto 1.25rem auto'
    },
    title: { color: '#1e293b', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', margin: 0 },
    subtitle: { color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    label: { fontSize: '0.83rem', fontWeight: 600, color: '#475569', marginLeft: '2px' },
    input: {
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        border: '1.5px solid #e2e8f0',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        backgroundColor: '#f8fafc',
        width: '100%',
        boxSizing: 'border-box'
    },
    inputError: { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
    inputOk:    { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
    fieldError: { fontSize: '0.75rem', color: '#dc2626', marginLeft: '2px' },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '2px'
    },
    strengthBarTrack: { display: 'flex', gap: '4px', marginBottom: '4px' },
    strengthBarSegment: { flex: 1, height: '5px', borderRadius: '4px' },
    reqList: { listStyle: 'none', padding: 0, margin: '6px 0 0 0', display: 'flex', flexDirection: 'column', gap: '4px' },
    reqItem: { fontSize: '0.78rem', fontWeight: 500, display: 'flex', alignItems: 'center', transition: 'color 0.2s ease' },
    button: {
        marginTop: '0.25rem',
        padding: '0.85rem',
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
    buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    errorBadge: {
        backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem',
        borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #fee2e2',
        display: 'flex', alignItems: 'center'
    },
    successBadge: {
        backgroundColor: '#ecfdf5', color: '#047857', padding: '0.75rem',
        borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #d1fae5',
        display: 'flex', alignItems: 'center'
    },
    footer: { marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' },
    footerText: { fontSize: '0.9rem', color: '#64748b' },
    link: { color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }
}

export default Register