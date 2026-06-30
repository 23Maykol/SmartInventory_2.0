import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import type { Movement, MovementsResponse } from '../types'
import { useAuth } from '../hooks/useAuth'

const Movements = () => {
    const { isAdmin, user } = useAuth()
    const [movements, setMovements] = useState<Movement[]>([])
    const [branchUsers, setBranchUsers] = useState<{ id: number; name: string; role: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [typeFilter, setTypeFilter] = useState('')
    const [userFilter, setUserFilter] = useState('')

    const fetchMovements = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<MovementsResponse>('/movements', {
                params: {
                    page,
                    limit: 10,
                    type: typeFilter || undefined,
                    user_id: isAdmin ? (userFilter || undefined) : user?.id
                }
            })
            setMovements(res.data.data)
            setTotalPages(res.data.totalPages)
            setTotal(res.data.total)
        } catch {
        } finally {
            setLoading(false)
        }
    }, [page, typeFilter, userFilter])

    useEffect(() => {
        fetchMovements()
        api.get('/users/branch-users').then(res => setBranchUsers(res.data.data)).catch(() => {})
    }, [fetchMovements])

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Movimientos</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                            <p className="text-sm font-semibold text-slate-500">Historial: {total} registros</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                        {/* Type filter */}
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={typeFilter}
                                onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
                                className="appearance-none w-full sm:w-44 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="entrada">Solo Entradas</option>
                                <option value="salida">Solo Salidas</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        {/* User filter — only for admins */}
                        {isAdmin && branchUsers.length > 0 && (
                            <div className="relative w-full sm:w-auto">
                                <select
                                    value={userFilter}
                                    onChange={e => { setUserFilter(e.target.value); setPage(1) }}
                                    className="appearance-none w-full sm:w-52 pl-9 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                >
                                    <option value="">Todos los usuarios</option>
                                    {branchUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Tabla */}

                {/* Tabla */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <svg className="animate-spin h-8 w-8 mb-4 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-sm font-semibold">Cargando movimientos...</p>
                    </div>
                )}

                {!loading && (
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cantidad</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {movements.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                                                No se encontraron movimientos registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        movements.map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-slate-400 font-medium">#{m.id}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-800">{m.product_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase inline-block ${m.type === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {m.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-base font-black ${m.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 font-medium">{m.user_name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{m.note || <span className="text-slate-300 italic">Sin nota</span>}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                                    {new Date(m.created_at).toLocaleString('es-ES', { 
                                                        day: '2-digit', month: 'short', year: 'numeric', 
                                                        hour: '2-digit', minute: '2-digit' 
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 transition-all shadow-sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 transition-all shadow-sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Movements