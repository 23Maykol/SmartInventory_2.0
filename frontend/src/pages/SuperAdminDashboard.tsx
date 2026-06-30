import { useState, useEffect } from 'react';
import type { FC } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import type { SuperAdminStats } from '../types';

const icons = {
    products: <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    store: <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    users: <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    movements: <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>,
    warning: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
}

const WavePath1 = "M0,10 C30,20 60,0 100,10 L100,40 L0,40 Z";
const WavePath2 = "M0,15 C40,-5 60,30 100,10 L100,40 L0,40 Z";
const WavePath3 = "M0,20 C30,30 70,-10 100,15 L100,40 L0,40 Z";
const WavePath4 = "M0,20 C20,-5 40,30 70,10 C85,-5 95,5 100,20 L100,40 L0,40 Z";

const SuperAdminDashboard: FC = () => {
    const [stats, setStats] = useState<SuperAdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/stats/super-dashboard')
            .then(res => setStats(res.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const formatNumber = (num: number) => new Intl.NumberFormat('es-ES').format(num);

    const topCards = stats ? [
        { title: 'Sucursales', value: formatNumber(stats.branches.total_branches), icon: icons.store, badge: `${stats.branches.active_branches} Activas`, badgeColor: 'text-amber-600 bg-amber-50 border-amber-100', wavePath: WavePath1, waveColor: '#fef3c7' },
        { title: 'Stock Global', value: formatNumber(stats.products.total_stock), icon: icons.products, badge: 'General', badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-100', wavePath: WavePath2, waveColor: '#ecfdf5' },
        { title: 'Usuarios', value: formatNumber(stats.users.total_users), icon: icons.users, badge: `${stats.users.admins} Admins`, badgeColor: 'text-blue-600 bg-blue-50 border-blue-100', wavePath: WavePath3, waveColor: '#dbeafe' },
        { title: 'Movimientos', value: formatNumber(stats.movements.total_movements), icon: icons.movements, badge: 'Global', badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-100', wavePath: WavePath4, waveColor: '#e0e7ff' },
    ] : [];

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">Panel de Súper Administrador</h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Vista general de sucursales • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {!loading && stats && (
                    <div className="flex flex-col gap-4 flex-1 min-h-0">

                        {/* 4 Cards Grid */}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 flex-shrink-0">
                            {topCards.map((card, idx) => (
                                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col hover:shadow-md transition-shadow" style={{ minHeight: '110px' }}>
                                    <div className="p-4 flex-1 flex flex-col justify-between z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                                                {card.icon}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${card.badgeColor}`}>
                                                {card.badge}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-0.5">{card.title}</p>
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                                                {card.value}
                                            </h3>
                                        </div>
                                    </div>
                                    <svg className="absolute bottom-0 left-0 w-full h-[50px]" viewBox="0 0 100 40" preserveAspectRatio="none">
                                        <path d={card.wavePath} fill={card.waveColor} />
                                    </svg>
                                </div>
                            ))}
                        </div>

                        {/* Main area */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">

                            {/* Stock Alerts Global */}
                            <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0">
                                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                                    <h2 className="text-sm font-bold text-slate-800">Alertas Críticas Globales</h2>
                                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                                        {stats.lowStockProducts.length}
                                    </span>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
                                    {stats.lowStockProducts.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400 text-sm font-medium">
                                            No hay alertas críticas en ninguna sucursal.
                                        </div>
                                    ) : (
                                        stats.lowStockProducts.map((p) => (
                                            <div key={p.id} className="rounded-xl border border-rose-100 bg-white overflow-hidden shadow-sm relative transition-transform hover:-translate-y-0.5">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                                                <div className="p-3 pl-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex items-center gap-1 text-rose-600 text-[9px] font-bold uppercase tracking-wider">
                                                            {icons.warning} STOCK BAJO
                                                        </div>
                                                        <span className="text-slate-400 text-[10px]">Alerta global</span>
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-800 mb-1 truncate">{p.name}</h4>
                                                    <p className="text-[10px] text-slate-500 mb-2">
                                                        Stock: {p.stock} uds. (Cat: {p.category || 'N/A'})
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Branches Table */}
                            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0">
                                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">Resumen de Sucursales</h2>
                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">Métricas de operación por sucursal</p>
                                    </div>
                                </div>

                                <div className="overflow-auto flex-1 min-h-0">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 z-10">
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-4">Sucursal</th>
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Movimientos</th>
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ent/Sal</th>
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider pr-4">Admin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {stats.branchStats.map((b) => (
                                                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-3 pl-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                                                                {icons.store}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-700">{b.name}</h4>
                                                                <p className="text-[10px] text-slate-400">{b.address || 'Sin dirección'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${b.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {b.is_active ? 'Activa' : 'Inactiva'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-xs font-bold text-slate-800">
                                                        {formatNumber(Number(b.total_movements))}
                                                    </td>
                                                    <td className="p-3 text-[10px] font-bold">
                                                        <span className="text-emerald-500">{formatNumber(Number(b.total_entradas))}</span>
                                                        <span className="text-slate-300 mx-1">/</span>
                                                        <span className="text-rose-500">{formatNumber(Number(b.total_salidas))}</span>
                                                    </td>
                                                    <td className="p-3 pr-4">
                                                        {b.admin_name ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">
                                                                    {b.admin_name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="text-xs font-medium text-slate-600">{b.admin_name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400">Sin admin</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {stats.branchStats.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-slate-400 text-sm font-medium">
                                                        No hay sucursales registradas.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
