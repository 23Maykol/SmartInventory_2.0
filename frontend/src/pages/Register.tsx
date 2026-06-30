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
    { label: 'Muy débil',  color: '#ef4444' },
    { label: 'Débil',      color: '#f97316' },
    { label: 'Regular',    color: '#eab308' },
    { label: 'Buena',      color: '#22c55e' },
    { label: 'Excelente',  color: '#10b981' },
]

// ─── Validation helpers ───────────────────────────────────
const validateName  = (v: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(v.trim()) && v.trim().length >= 2
const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

const Register = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [touched, setTouched] = useState({ name: false, email: false, password: false })
    const [showPwd, setShowPwd] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

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
            setSuccess('¡Cuenta creada exitosamente! Redirigiendo...')
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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

            {/* Navbar */}
            <nav className="w-full px-6 py-6 md:px-12 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <span className="text-xl font-extrabold text-slate-900 tracking-tight">Smart Inventory</span>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500">¿Ya tienes cuenta?</span>
                    <Link to="/login" className="px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition-colors">
                        Inicia sesión
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-6 md:px-12 py-8 lg:py-0 z-10">

                {/* Left Side: Marketing */}
                <div className="flex-1 flex flex-col justify-center mb-12 lg:mb-0 lg:pr-12 xl:pr-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/60 text-emerald-800 text-[10px] font-extrabold tracking-wider w-max mb-8 border border-emerald-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        ÚNETE HOY
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
                        Comienza a <br />
                        <span className="text-indigo-600 italic">gestionar</span> tu <br />
                        inventario hoy.
                    </h1>

                    <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg font-medium">
                        Crea tu cuenta en segundos y empieza a disfrutar de la plataforma de gestión más inteligente del mercado.
                    </p>

                    {/* Feature Bullets */}
                    <div className="flex flex-col gap-4">
                        {[
                            {
                                icon: <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
                                text: 'Configuración en menos de 5 minutos'
                            },
                            {
                                icon: <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
                                text: 'Seguridad y datos 100% protegidos'
                            },
                            {
                                icon: <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
                                text: 'Análisis en tiempo real con IA'
                            },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                    {f.icon}
                                </div>
                                <span className="text-sm font-semibold text-slate-600">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Register Form */}
                <div className="w-full max-w-[480px] mx-auto lg:mx-0 flex items-center justify-center">
                    <div className="w-full bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100/60">

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Crea tu cuenta</h2>
                            <p className="text-sm font-medium text-slate-500">Completa los datos para registrarte en el sistema.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

                            {/* Name */}
                            <div className="flex flex-col gap-1.5">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Nombre completo"
                                        autoComplete="name"
                                        className={`w-full pl-11 pr-4 py-4 bg-transparent border rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all
                                            ${nameError
                                                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                                                : touched.name && form.name
                                                    ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'
                                            }`}
                                    />
                                </div>
                                {nameError && <span className="text-[11px] font-bold text-rose-500 ml-1">{nameError}</span>}
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Correo electrónico"
                                        autoComplete="email"
                                        className={`w-full pl-11 pr-4 py-4 bg-transparent border rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all
                                            ${emailError
                                                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                                                : touched.email && form.email
                                                    ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'
                                            }`}
                                    />
                                </div>
                                {emailError && <span className="text-[11px] font-bold text-rose-500 ml-1">{emailError}</span>}
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                    </div>
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Contraseña segura"
                                        autoComplete="new-password"
                                        className={`w-full pl-11 pr-12 py-4 bg-transparent border rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all
                                            ${pwdError
                                                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                                                : touched.password && strength === 5
                                                    ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        tabIndex={-1}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPwd ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Strength Bar */}
                                {form.password.length > 0 && (
                                    <div className="mt-1">
                                        <div className="flex gap-1 mb-1">
                                            {[1,2,3,4,5].map(i => (
                                                <div
                                                    key={i}
                                                    className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ background: i <= strength ? strengthInfo.color : '#e2e8f0' }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[11px] font-bold" style={{ color: strengthInfo.color }}>
                                            {strengthInfo.label}
                                        </span>
                                    </div>
                                )}

                                {/* Checklist */}
                                {(form.password.length > 0 || touched.password) && (
                                    <ul className="mt-2 flex flex-col gap-1.5">
                                        {rules.map((r, i) => (
                                            <li key={r.id} className={`text-[11px] font-semibold flex items-center gap-2 transition-colors ${passedRules[i] ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 transition-all ${passedRules[i] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                    {passedRules[i] ? '✓' : '○'}
                                                </span>
                                                {r.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {pwdError && <span className="text-[11px] font-bold text-rose-500 ml-1">{pwdError}</span>}
                            </div>

                            {/* Error / Success */}
                            {error && (
                                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className="mt-2 w-full bg-indigo-700 text-white py-4 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-700/20 hover:bg-indigo-800 hover:shadow-indigo-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? 'Creando cuenta...' : 'CREAR CUENTA'}
                                {!loading && (
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <span className="text-sm font-medium text-slate-500">¿Ya tienes cuenta? </span>
                            <Link to="/login" className="text-indigo-600 font-bold text-sm hover:text-indigo-700 transition-colors">Inicia sesión aquí</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register