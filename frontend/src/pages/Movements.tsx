import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import type { Movement, MovementsResponse } from '../types'
import { useAuth } from '../hooks/useAuth'

interface TicketUnit { serial_code: string; status: string }
interface TicketData {
    movement: {
        id: number; type: string; quantity: number; note: string | null;
        created_at: string; product_name: string; category: string; user_name: string;
    };
    units: TicketUnit[];
}

// ── Ticket Modal ──────────────────────────────────────────────────────────────
const TicketModal = ({ ticket, onClose }: { ticket: TicketData; onClose: () => void }) => {
    const { movement, units } = ticket;
    const isEntry = movement.type === 'entrada';

    const handlePrint = () => window.print();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* Modal Header (screen-only) */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 print:hidden">
                    <h3 className="text-base font-black text-slate-800 tracking-tight">Comprobante de Movimiento</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                {/* Ticket Body */}
                <div id="ticket-print-area" className="p-6">

                    {/* Ticket Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                                    </svg>
                                </div>
                                <span className="text-base font-black text-slate-900 tracking-tight">Smart Inventory</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium ml-10">Sistema de Gestión de Inventario</p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isEntry ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {movement.type}
                            </span>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">Mov. #{movement.id}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-slate-200 my-4"></div>

                    {/* Movement Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Producto</p>
                            <p className="text-sm font-bold text-slate-800">{movement.product_name}</p>
                            {movement.category && <p className="text-[11px] text-slate-400 font-medium">{movement.category}</p>}
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Cantidad</p>
                            <p className={`text-sm font-black ${isEntry ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isEntry ? '+' : '-'}{movement.quantity} unidades
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Responsable</p>
                            <p className="text-sm font-semibold text-slate-700">{movement.user_name}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fecha y Hora</p>
                            <p className="text-sm font-semibold text-slate-700">
                                {new Date(movement.created_at).toLocaleString('es-ES', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                        {movement.note && (
                            <div className="col-span-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Observación</p>
                                <p className="text-sm font-semibold text-slate-700">{movement.note}</p>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-slate-200 my-4"></div>

                    {/* Serial Codes */}
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            Códigos de Serie ({units.length} unidades)
                        </p>
                        {units.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Sin unidades serializadas registradas.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                                {units.map((u, i) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                        <span className="text-xs font-mono font-bold text-slate-700 tracking-wider">{u.serial_code}</span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${u.status === 'en_stock' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {u.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer note */}
                    <div className="border-t border-dashed border-slate-200 mt-5 pt-4">
                        <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
                            Este comprobante es válido para futuras consultas y reclamaciones.<br/>
                            Conserve los códigos de serie para su trazabilidad.
                        </p>
                    </div>
                </div>

                {/* Actions (screen-only) */}
                <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 print:hidden">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                        Imprimir Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
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

    // Ticket state
    const [ticket, setTicket] = useState<TicketData | null>(null)
    const [ticketLoading, setTicketLoading] = useState<number | null>(null)

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

    const handleOpenTicket = async (movementId: number) => {
        setTicketLoading(movementId)
        try {
            const res = await api.get(`/movements/${movementId}/ticket`)
            setTicket(res.data.data)
        } catch {
        } finally {
            setTicketLoading(null)
        }
    }

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

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <svg className="animate-spin h-8 w-8 mb-4 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-sm font-semibold">Cargando movimientos...</p>
                    </div>
                )}

                {/* Table */}
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
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {movements.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
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
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleOpenTicket(m.id)}
                                                        disabled={ticketLoading === m.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                                        title="Ver ticket de unidades"
                                                    >
                                                        {ticketLoading === m.id ? (
                                                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                                            </svg>
                                                        )}
                                                        Ticket
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination */}
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

            {/* Ticket Modal */}
            {ticket && <TicketModal ticket={ticket} onClose={() => setTicket(null)} />}
        </div>
    )
}

export default Movements