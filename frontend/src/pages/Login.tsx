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
    const [showPassword, setShowPassword] = useState(false)

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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

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
                    <span className="text-sm font-medium text-slate-500">¿Aún no tienes cuenta?</span>
                    <Link to="/register" className="px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition-colors">
                        Regístrate
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-6 md:px-12 py-8 lg:py-0 z-10">
                
                {/* Left Side: Marketing */}
                <div className="flex-1 flex flex-col justify-center mb-12 lg:mb-0 lg:pr-12 xl:pr-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/60 text-indigo-800 text-[10px] font-extrabold tracking-wider w-max mb-8 border border-indigo-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                        NUEVAS FUNCIONES IA
                    </div>
                    
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
                        Optimiza tu <br />
                        <span className="text-indigo-600 italic">logística</span> con el <br />
                        poder de la IA.
                    </h1>
                    
                    <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg font-medium">
                        Descubre una nueva era en la gestión de inventarios. Precisión milimétrica y eficiencia impulsada por algoritmos inteligentes.
                    </p>

                    <div className="flex items-center gap-4 mt-auto lg:mt-0">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-slate-50 bg-blue-100"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-50 bg-indigo-100"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-50 bg-purple-100"></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">+500 empresas ya confían</span>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full max-w-[480px] mx-auto lg:mx-0 flex items-center justify-center">
                    <div className="w-full bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100/60">
                        
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Bienvenido</h2>
                            <p className="text-sm font-medium text-slate-500">Ingresa para gestionar tu ecosistema inteligente.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            
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
                                    placeholder="Correo Electrónico"
                                    required
                                    className="w-full pl-11 pr-4 py-4 bg-transparent border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Contraseña"
                                    required
                                    className="w-full pl-11 pr-12 py-4 bg-transparent border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? (
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

                            <div className="flex justify-end">
                                <Link to="#" className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 uppercase tracking-wider transition-colors">
                                    ¿Olvidaste tu clave?
                                </Link>
                            </div>

                            {error && (
                                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 w-full bg-indigo-700 text-white py-4 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-700/20 hover:bg-indigo-800 hover:shadow-indigo-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
                            >
                                {loading ? 'Verificando...' : 'INICIAR SESIÓN'}
                                {!loading && (
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                )}
                            </button>
                        </form>

                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-slate-100"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">o continúa con</span>
                            <div className="flex-1 h-px bg-slate-100"></div>
                        </div>

                        <div className="flex justify-center w-full [&>div]:w-full [&>div>div]:!w-full [&>div>div]:!justify-center [&>div>div>iframe]:!w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('El inicio de sesión con Google falló')}
                                useOneTap
                                shape="rectangular"
                                size="large"
                                width="100%"
                            />
                        </div>

                        <div className="mt-8 text-center md:hidden">
                            <span className="text-sm font-medium text-slate-500">¿Aún no tienes cuenta? </span>
                            <Link to="/register" className="text-indigo-600 font-bold text-sm">Regístrate</Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Login