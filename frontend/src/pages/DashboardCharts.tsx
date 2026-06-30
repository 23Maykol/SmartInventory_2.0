import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, AreaChart, Area
} from 'recharts';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import type { DashboardStats } from '../types';

const infoIcon = (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const DashboardCharts: FC = () => {
    const { isAdmin, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
        }
    }, [isAdmin, isSuperAdmin]);


    if (loading) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="main-content flex items-center justify-center">
                    <p className="text-slate-400 text-sm font-medium">Cargando gráficos...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin || !stats) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="main-content flex items-center justify-center">
                    <p className="text-slate-400 text-sm font-medium">Sin acceso a esta sección.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Navbar />

            <div className="main-content">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">
                            Análisis y Gráficos
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Métricas visuales del inventario • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 pb-2">

                    {/* BarChart: Tendencia por Producto */}
                    <div className="lg:col-span-2 bg-white rounded-[1.25rem] shadow-sm border border-slate-100 p-5 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Tendencia por Producto</h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">Movimientos totales de los productos más activos</p>
                            </div>
                            <div className="text-right">
                                <div className="text-indigo-600 font-bold text-lg leading-none">{stats.movements.total_movements}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1 mt-1">
                                    <svg className="w-3 h-3 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                        <polyline points="17 6 23 6 23 12"></polyline>
                                    </svg>
                                    Movs Totales
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.topProducts.map(item => ({ ...item, total_movimientos: Number(item.total_movimientos) }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.2"/>
                                        </filter>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '…' : val}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}
                                    />
                                    <Line type="bump" dataKey="total_movimientos" name="Movimientos" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} filter="url(#shadow)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AreaChart: Movimientos Mensuales */}
                    <div className="lg:col-span-1 bg-white rounded-[1.25rem] shadow-sm border border-slate-100 p-5 flex flex-col justify-between">
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-base font-bold text-slate-800">Tendencia Diaria</h3>
                                {infoIcon}
                            </div>
                            <div className="flex-1 min-h-0">
                                {stats.monthlyMovements?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.monthlyMovements.map(item => ({ ...item, total: Number(item.total) }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                                            <Area type="bump" dataKey="total" name="Total Movs" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center py-10 text-slate-400 text-sm">Sin datos suficientes</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Balance de Operaciones – LineChart claro */}
                    <div className="lg:col-span-2 bg-white rounded-[1.25rem] shadow-sm p-5 relative overflow-hidden flex flex-col border border-slate-100">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 mb-0.5">Balance de Operaciones</h3>
                                <p className="text-[11px] text-slate-500">Evolución de entradas y salidas</p>
                            </div>
                            <div className="flex gap-5">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Entradas</span>
                                    <span className="text-lg font-black text-slate-800 leading-none">{stats.movements.total_entradas}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">Salidas</span>
                                    <span className="text-lg font-black text-slate-800 leading-none">{stats.movements.total_salidas}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                            {stats.monthlyMovements?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.monthlyMovements.map(item => ({ ...item, entradas: Number(item.entradas), salidas: Number(item.salidas) }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                                        <Line type="bump" dataKey="entradas" name="Entradas" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                                        <Line type="bump" dataKey="salidas" name="Salidas" stroke="#f43f5e" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-10 text-slate-400 text-sm">Sin datos suficientes</div>
                            )}
                        </div>
                    </div>

                    {/* Asignación por Categoría */}
                    <div className="lg:col-span-1 bg-white rounded-[1.25rem] shadow-sm border border-slate-100 p-5 flex flex-col justify-between">
                        <h3 className="text-base font-bold text-slate-800 mb-3">Asignación por Categoría</h3>

                        <div className="flex-1 min-h-0 flex items-center justify-center w-full">
                            {stats.stockByCategory?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.stockByCategory.map(item => ({ ...item, total_stock: Number(item.total_stock) }))}
                                            dataKey="total_stock"
                                            nameKey="category"
                                            cx="50%" cy="50%"
                                            innerRadius={50} outerRadius={70}
                                            paddingAngle={4}
                                        >
                                            {stats.stockByCategory.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'][index % 6]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-6 text-sm text-slate-400">Sin datos de categorías.</div>
                            )}
                        </div>

                        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center text-center">
                            <div>
                                <div className="text-sm font-black text-slate-800">{stats.products.active_products}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Activos</div>
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-800">{stats.products.total_stock}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Stock</div>
                            </div>
                            <div>
                                <div className="text-sm font-black text-rose-500">{stats.products.low_stock_count}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Bajo Stock</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
