import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import React from 'react'

const Icons = {
  dashboard: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
      <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
    </svg>
  ),
  charts: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  products: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  movements: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"></polyline>
      <polyline points="23 20 23 14 17 14"></polyline>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
    </svg>
  ),
  users: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  branches: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  )
}

const Navbar = () => {
    const { user, logout, isAdmin, isSuperAdmin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const currentPath = location.pathname;

    const renderLink = (path: string, label: string, iconRenderer: (color: string) => React.ReactNode) => {
        const isActive = currentPath === path;
        const color = isActive ? '#4f46e5' : '#64748b';
        
        return (
            <Link 
                to={path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all duration-200 group
                    ${isActive 
                        ? 'bg-indigo-50/80 text-indigo-600 shadow-[0_0_0_1px_rgba(79,70,229,0.1)]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
            >
                <div className={`flex items-center justify-center transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {iconRenderer(color)}
                </div>
                {label}
            </Link>
        )
    }

    const dashboardPath = isSuperAdmin ? '/super-dashboard' : '/dashboard'

    return (
        <aside className="w-[260px] min-w-[260px] h-screen bg-white/80 backdrop-blur-xl border-r border-slate-100/60 flex flex-col sticky top-0 p-5 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
            {/* Top Logo */}
            <div className="flex items-center gap-3 px-2 pb-8 pt-2">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                </div>
                <Link to={dashboardPath} className="text-slate-800 font-extrabold text-[1.15rem] tracking-tight truncate hover:text-indigo-600 transition-colors">
                    Smart Inventory
                </Link>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-1.5 flex-1">
                <div className="px-3 pb-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">General</div>
                {!isSuperAdmin && (
                    <>
                        {renderLink('/dashboard', 'Vista Global', Icons.dashboard)}
                        {isAdmin && renderLink('/dashboard/charts', 'Análisis Gráfico', Icons.charts)}
                    </>
                )}
                {isSuperAdmin && (
                    <>
                        {renderLink('/super-dashboard', 'Vista Global', Icons.dashboard)}
                        {renderLink('/super-dashboard/charts', 'Análisis Gráfico', Icons.charts)}
                        {renderLink('/super-dashboard/branches', 'Sucursales', Icons.branches)}
                    </>
                )}
                
                {!isSuperAdmin && (
                    <>
                        <div className="px-3 pt-4 pb-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Gestión</div>
                        {renderLink('/products', 'Inventario', Icons.products)}
                        {renderLink('/movements', 'Movimientos', Icons.movements)}
                    </>
                )}
                
                {isAdmin && (
                    <>
                        <div className="px-3 pt-4 pb-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Administración</div>
                        {renderLink('/users', 'Usuarios', Icons.users)}
                    </>
                )}
            </div>

            {/* Bottom User Area */}
            <div className="flex items-center justify-between p-3 mt-auto bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm
                        ${isSuperAdmin 
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500' 
                            : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                        }`}
                    >
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-slate-800 text-[13px] font-bold truncate">{user?.name}</span>
                        <span className="text-slate-500 text-[11px] font-semibold truncate">
                            {user?.email || (user?.role === 'admin' ? 'admin@smartinventory.com' : 'user@smartinventory.com')}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={handleLogout} 
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
                    title="Cerrar sesión"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </aside>
    )
}

export default Navbar