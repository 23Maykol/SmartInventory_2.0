import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import type { DashboardStats, Product } from '../types';

const icons = {
    products: <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    store: <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    users: <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    movements: <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>,
    warning: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
    download: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
}

const WavePath1 = "M0,10 C30,20 60,0 100,10 L100,40 L0,40 Z";
const WavePath2 = "M0,15 C40,-5 60,30 100,10 L100,40 L0,40 Z";
const WavePath3 = "M0,20 C30,30 70,-10 100,15 L100,40 L0,40 Z";
const WavePath4 = "M0,20 C20,-5 40,30 70,10 C85,-5 95,5 100,20 L100,40 L0,40 Z";

const Dashboard: FC = () => {
    const { user, isAdmin, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Employee specific states
    const [products, setProducts] = useState<Product[]>([]);
    const [form, setForm] = useState({
        product_id: '',
        type: 'entrada',
        quantity: '',
        note: ''
    });
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const selectedProduct = products.find(p => p.id.toString() === form.product_id);
    const stockWarning = form.type === 'salida' && form.quantity !== '' && selectedProduct
        ? Number(form.quantity) > selectedProduct.stock
            ? `Stock insuficiente: solo hay ${selectedProduct.stock} unidades disponibles.`
            : null
        : null;

    useEffect(() => {
        if (isSuperAdmin) {
            navigate('/super-dashboard', { replace: true });
        }
    }, [isSuperAdmin, navigate]);

    useEffect(() => {
        if (isAdmin && !isSuperAdmin) {
            api.get('/stats/dashboard')
                .then(res => setStats(res.data.data))
                .catch(() => { })
                .finally(() => setLoading(false));
        } else if (!isSuperAdmin) {
            api.get('/products?limit=100').then(res => setProducts(res.data.data)).finally(() => setLoading(false));
        }
    }, [isAdmin, isSuperAdmin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (stockWarning) {
            setFormError(stockWarning);
            return;
        }
        const qty = Number(form.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 10_000) {
            setFormError('La cantidad debe ser un número entero entre 1 y 10.000.');
            return;
        }
        setFormLoading(true);
        try {
            await api.post('/movements', {
                product_id: Number(form.product_id),
                type: form.type,
                quantity: Number(form.quantity),
                note: form.note || null
            });
            setSuccessMsg('Movimiento registrado exitosamente');
            setForm({ product_id: '', type: 'entrada', quantity: '', note: '' });
            // Actualizar stock
            api.get('/products?limit=100').then(res => setProducts(res.data.data));
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Error al registrar movimiento');
        } finally {
            setFormLoading(false);
        }
    };

    const formatNumber = (num: number) => new Intl.NumberFormat('es-ES').format(num);

    const topCards = [
        { title: 'Productos Activos', value: stats ? formatNumber(stats.products.active_products) : '0', icon: icons.products, badge: '+12.5%', badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-100', wavePath: WavePath1, waveColor: '#e0e7ff' },
        { title: 'Stock Total', value: stats ? formatNumber(stats.products.total_stock) : '0', icon: icons.store, badge: 'Estable', badgeColor: 'text-slate-600 bg-slate-50 border-slate-200', wavePath: WavePath2, waveColor: '#f1f5f9' },
        { title: 'Usuarios Totales', value: stats ? formatNumber(stats.users.total_users) : '0', icon: icons.users, badge: 'Activos', badgeColor: 'text-blue-600 bg-blue-50 border-blue-100', wavePath: WavePath3, waveColor: '#dbeafe' },
        { title: 'Movimientos Totales', value: stats ? formatNumber(stats.movements.total_movements) : '0', icon: icons.movements, badge: 'General', badgeColor: 'text-rose-600 bg-rose-50 border-rose-100', wavePath: WavePath4, waveColor: '#fecdd3' },
    ];

    return (
        <div className="page-container">
            <Navbar />

            <div className="main-content">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">
                            {user?.role === 'admin' ? 'Panel de Admin' : 'Panel de Control'}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Vista general • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {isAdmin && !loading && stats && (
                    <div className="flex flex-col gap-4 flex-1 min-h-0">

                        {/* 4 Cards Grid — height adapts via flex */}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 flex-shrink-0">
                            {topCards.map((card, idx) => (
                                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col hover:shadow-md transition-shadow" style={{ minHeight: '110px' }}>
                                    <div className="p-4 flex-1 flex flex-col justify-between z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
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

                        {/* Main area — stretches to fill remaining space */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">

                            {/* Stock Alerts */}
                            <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0">
                                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                                    <h2 className="text-sm font-bold text-slate-800">Alertas de Stock</h2>
                                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                                        {stats.lowStockProducts.length}
                                    </span>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
                                    {stats.lowStockProducts.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400 text-sm font-medium">
                                            No hay alertas críticas.
                                        </div>
                                    ) : (
                                        stats.lowStockProducts.map((p) => (
                                            <div key={p.id} className="rounded-xl border border-rose-100 bg-white overflow-hidden shadow-sm relative transition-transform hover:-translate-y-0.5">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                                                <div className="p-3 pl-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex items-center gap-1 text-rose-600 text-[9px] font-bold uppercase tracking-wider">
                                                            {icons.warning} STOCK CRÍTICO
                                                        </div>
                                                        <span className="text-slate-400 text-[10px]">Ahora</span>
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-800 mb-1 truncate">{p.name}</h4>
                                                    <p className="text-[10px] text-slate-500 mb-2">
                                                        Actual: {p.stock} uds. | Mín: 10 uds.
                                                    </p>
                                                    <button className="text-rose-600 text-[10px] font-bold flex items-center gap-1 hover:text-rose-700 transition-colors">
                                                        Reabastecer
                                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="px-4 py-2 border-t border-slate-100 text-center flex-shrink-0">
                                    <button className="text-indigo-600 text-xs font-bold hover:text-indigo-700 transition-colors">
                                        Ver todas las alertas
                                    </button>
                                </div>
                            </div>

                            {/* Recent Movements Table */}
                            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0">
                                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">Movimientos Recientes</h2>
                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">Resumen general del sistema</p>
                                    </div>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                        {icons.download} Exportar
                                    </button>
                                </div>

                                <div className="overflow-auto flex-1 min-h-0">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0">
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-4">Producto</th>
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cant.</th>
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider pr-4">Nota</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {stats.recentMovements && stats.recentMovements.slice(0, 8).map((m) => (
                                                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-3 pl-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect></svg>
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{m.product_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold border ${m.type === 'entrada' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                            {m.type === 'entrada' ? '↓ ENT' : '↑ SAL'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-xs font-bold text-slate-800">
                                                        {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                                                    </td>
                                                    <td className="p-3 text-xs font-medium text-slate-500 truncate max-w-[80px]">{m.user_name}</td>
                                                    <td className="p-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                                                        {new Date(m.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="p-3 pr-4">
                                                        <span className="text-[10px] text-slate-500 truncate block max-w-[80px]">
                                                            {m.note || 'Registrado'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!stats.recentMovements || stats.recentMovements.length === 0) && (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                                                        Sin movimientos recientes.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                                    <span className="text-[10px] font-medium text-slate-500">
                                        {stats.recentMovements ? Math.min(stats.recentMovements.length, 8) : 0} de {stats.movements.total_movements} movimientos
                                    </span>
                                    <div className="flex gap-1">
                                        <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50">
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                        </button>
                                        <button className="w-7 h-7 flex items-center justify-center rounded bg-indigo-600 text-white font-bold text-xs">1</button>
                                        <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50">
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vista para Empleados (no admin y no super admin) */}
                {!isAdmin && !isSuperAdmin && !loading && (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
                        {successMsg && (
                            <div className="mb-6 w-full p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-3 transform transition-all animate-fadeIn">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                {successMsg}
                            </div>
                        )}

                        <div className="w-full bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl p-6 md:p-8 transform transition-all animate-fadeIn">
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Registrar Movimiento</h2>
                                <p className="text-slate-500 mt-2 text-sm">Registra una entrada o salida de productos disponibles en el inventario.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Producto *</label>
                                        <select
                                            value={form.product_id}
                                            onChange={e => setForm({ ...form, product_id: e.target.value })}
                                            required
                                            className="appearance-none w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                        >
                                            <option value="">Selecciona un producto...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} (Stock actual: {p.stock})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Movimiento *</label>
                                        <select
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                            required
                                            className="appearance-none w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                        >
                                            <option value="entrada">Entrada al inventario (+)</option>
                                            <option value="salida">Salida del inventario (-)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cantidad *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10000"
                                            step="1"
                                            value={form.quantity}
                                            onChange={e => setForm({ ...form, quantity: e.target.value })}
                                            required
                                            placeholder="Ej. 10"
                                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm ${stockWarning ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200'}`}
                                        />
                                        {stockWarning && (
                                            <span className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                                                {icons.warning} {stockWarning}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nota u Observación</label>
                                        <input
                                            type="text"
                                            value={form.note}
                                            onChange={e => setForm({ ...form, note: e.target.value })}
                                            placeholder="Opcional..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                {formError && (
                                    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100 flex items-center gap-3">
                                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {formError}
                                    </div>
                                )}

                                <div className="mt-4 flex justify-center md:justify-end">
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 transition-all disabled:opacity-70 disabled:hover:shadow-indigo-600/20 flex items-center justify-center gap-2"
                                    >
                                        {formLoading && <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                        {formLoading ? 'Procesando...' : 'Confirmar Registro'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;