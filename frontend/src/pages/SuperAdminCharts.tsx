import { useState, useEffect } from 'react';
import type { FC } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import type { SuperAdminStats } from '../types';
import {
    LineChart, Line, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, AreaChart, Area
} from 'recharts';

const infoIcon = (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const SuperAdminCharts: FC = () => {
    const [stats, setStats] = useState<SuperAdminStats | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('global');

    useEffect(() => {
        setIsFetching(true);
        const url = selectedBranchId === 'global' ? '/stats/super-dashboard' : `/stats/super-dashboard?branch_id=${selectedBranchId}`;
        
        api.get(url)
            .then(res => setStats(res.data.data))
            .catch(() => {})
            .finally(() => {
                setInitialLoading(false);
                setIsFetching(false);
            });
    }, [selectedBranchId]);

    if (initialLoading) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="main-content flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
                        <p className="text-slate-500 mt-4 font-bold">Cargando gráficos...</p>
                    </div>
                </div>
            </div>
        );
    }

    const selectedBranchName = selectedBranchId === 'global' 
        ? 'Global' 
        : stats?.branchStats.find(b => b.id.toString() === selectedBranchId)?.name || 'Desconocida';

    const globalMovementsCount = stats?.movements.total_movements || 0;
    const globalEntradas = stats?.movements.total_entradas || 0;
    const globalSalidas = stats?.movements.total_salidas || 0;

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">
                            Análisis y Gráficos Globales
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Métricas visuales • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    
                    {/* Branch Selector */}
                    {stats && stats.branchStats.length > 0 && (
                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-[1rem] p-1.5 shadow-sm">
                            <label className="text-xs font-bold text-slate-500 pl-3 uppercase tracking-wider">Filtrar:</label>
                            <div className="relative">
                                <select 
                                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg pl-3 pr-8 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-shadow"
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                    disabled={isFetching}
                                >
                                    <option value="global">Todas (Global)</option>
                                    {stats.branchStats.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 pb-2 relative">
                        {isFetching && (
                            <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] rounded-3xl flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                            </div>
                        )}

                        {/* BarChart/LineChart: Tendencia por Producto */}
                        <div className="lg:col-span-2 bg-white rounded-[1.25rem] shadow-sm border border-slate-100 p-5 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Tendencia por Producto</h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Top 5 productos más movidos</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-indigo-600 font-bold text-lg leading-none">{globalMovementsCount}</div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1 mt-1">
                                        <svg className="w-3 h-3 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                            <polyline points="17 6 23 6 23 12"></polyline>
                                        </svg>
                                        Movs Totales
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-h-[200px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.topProducts.map(item => ({ ...item, total_movimientos: Number(item.total_movimientos) }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <filter id="shadowProduct" x="-20%" y="-20%" width="140%" height="140%">
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
                                        <Line type="bump" dataKey="total_movimientos" name="Movimientos" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} filter="url(#shadowProduct)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* AreaChart: Tendencia Diaria de Movimientos */}
                        <div className="lg:col-span-1 bg-white rounded-[1.25rem] shadow-sm border border-slate-100 p-5 flex flex-col justify-between">
                            <div className="flex-1 flex flex-col min-h-[200px]">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex flex-col">
                                        <h3 className="text-base font-bold text-slate-800">Tendencia Diaria</h3>
                                        <span className={`text-[9px] mt-0.5 font-bold uppercase tracking-wider ${selectedBranchId === 'global' ? 'text-indigo-500' : 'text-emerald-500'}`}>
                                            {selectedBranchName}
                                        </span>
                                    </div>
                                    {infoIcon}
                                </div>
                                <div className="flex-1 min-h-0">
                                    {stats.monthlyMovements?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.monthlyMovements.map(item => ({ ...item, total: Number(item.total) }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorTotalGlobal" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                                                <Area type="bump" dataKey="total" name="Total Movs" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotalGlobal)" />
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
                                    <p className="text-[11px] text-slate-500">
                                        Evolución de entradas y salidas ({selectedBranchId === 'global' ? 'Global' : `Sucursal: ${selectedBranchName}`})
                                    </p>
                                </div>
                                {/* Solo mostramos totales si es global, o si queremos calcularlo desde monthlyMovements para la sucursal actual */}
                                {selectedBranchId === 'global' && (
                                    <div className="flex gap-5">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Entradas</span>
                                            <span className="text-lg font-black text-slate-800 leading-none">{globalEntradas}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">Salidas</span>
                                            <span className="text-lg font-black text-slate-800 leading-none">{globalSalidas}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-h-[220px] w-full flex items-center justify-center">
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
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-base font-bold text-slate-800">Asignación por Categoría</h3>
                                <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase">Global</span>
                            </div>

                            <div className="flex-1 min-h-[180px] flex items-center justify-center w-full">
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
                )}
            </div>
        </div>
    );
};

export default SuperAdminCharts;
