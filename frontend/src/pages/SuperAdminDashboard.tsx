import { useState, useEffect } from 'react';
import type { FC, CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import NotFound from './NotFound';
import type { SuperAdminStats, BranchStat, MovementPoint } from '../types';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    Legend
} from 'recharts';

// ─── Color palette ──────────────────────────────────────────
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

// ─── SVG Icons ──────────────────────────────────────────────
const icons = {
    box:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    users:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    sync:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
    branch: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    warn:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    up:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    down:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
    eye:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    filter: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
};

// ─── Custom Tooltip ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={tooltipStyle}>
            <p style={{ color: '#1e293b', fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem' }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color, fontSize: '0.82rem', margin: '2px 0' }}>
                    {p.name}: <strong>{p.value?.toLocaleString()}</strong>
                </p>
            ))}
        </div>
    );
};
const tooltipStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.96)',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '10px 14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
};

// ─── KPI Card ────────────────────────────────────────────────
interface KpiProps {
    label: string; value: string | number; sub?: string;
    icon: React.ReactNode; color: string; bg: string; gradient: string;
    large?: boolean;
}
const KpiCard: FC<KpiProps> = ({ label, value, sub, icon, color, bg, gradient, large }) => (
    <div style={{ ...styles.kpiCard, background: gradient, gridColumn: large ? 'span 2' : undefined }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <div style={{ ...styles.kpiValue, color, fontSize: large ? '3rem' : '2.2rem' }}>{value}</div>
                <div style={styles.kpiLabel}>{label}</div>
                {sub && <div style={styles.kpiSub}>{sub}</div>}
            </div>
            <div style={{ ...styles.kpiIcon, color, background: bg, width: large ? '60px' : '48px', height: large ? '60px' : '48px' }}>{icon}</div>
        </div>
    </div>
);

// ─── Branch Card ─────────────────────────────────────────────
interface BranchCardProps { branch: BranchStat; onSelect: (id: number) => void; selected: boolean; }
const BranchCard: FC<BranchCardProps> = ({ branch, onSelect, selected }) => (
    <div
        style={{ ...styles.branchCard, border: selected ? '2px solid #6366f1' : '1px solid #e2e8f0', boxShadow: selected ? '0 0 0 4px rgba(99,102,241,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
        onClick={() => onSelect(branch.id)}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ ...styles.branchIcon, background: branch.is_active ? '#eef2ff' : '#f1f5f9', color: branch.is_active ? '#6366f1' : '#94a3b8' }}>{icons.branch}</div>
                <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{branch.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{branch.address || 'Sin dirección'}</div>
                </div>
            </div>
            <span style={{ ...styles.badge, background: branch.is_active ? '#d1fae5' : '#f1f5f9', color: branch.is_active ? '#047857' : '#64748b' }}>
                {branch.is_active ? 'Activa' : 'Inactiva'}
            </span>
        </div>
        <div style={styles.branchStatsRow}>
            {[
                { label: 'Movimientos', value: Number(branch.total_movements).toLocaleString(), color: '#6366f1' },
                { label: 'Entradas', value: Number(branch.total_entradas).toLocaleString(), color: '#10b981' },
                { label: 'Salidas', value: Number(branch.total_salidas).toLocaleString(), color: '#ef4444' },
                { label: 'Usuarios', value: Number(branch.active_users).toLocaleString(), color: '#f59e0b' },
            ].map(s => (
                <div key={s.label} style={styles.branchStat}>
                    <div style={{ color: s.color, fontWeight: 700, fontSize: '1.1rem' }}>{s.value}</div>
                    <div style={styles.branchStatLabel}>{s.label}</div>
                </div>
            ))}
        </div>
        {branch.admin_name && (
            <div style={styles.adminTag}>
                <div style={styles.adminAvatar}>{branch.admin_name.charAt(0).toUpperCase()}</div>
                <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{branch.admin_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{branch.admin_email}</div>
                </div>
            </div>
        )}
        <button style={styles.viewBtn} onClick={() => onSelect(branch.id)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {icons.eye} {selected ? 'Viendo detalle' : 'Ver detalle'}
            </span>
        </button>
    </div>
);

// ─── Time range selector ─────────────────────────────────────
type TimeRange = 'daily' | 'weekly' | 'monthly';
const TimeSelector: FC<{ value: TimeRange; onChange: (v: TimeRange) => void }> = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
        {(['daily', 'weekly', 'monthly'] as TimeRange[]).map(t => (
            <button
                key={t}
                onClick={() => onChange(t)}
                style={{
                    padding: '5px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.78rem',
                    background: value === t ? '#fff' : 'transparent',
                    color: value === t ? '#6366f1' : '#64748b',
                    boxShadow: value === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                }}
            >
                {t === 'daily' ? 'Diario' : t === 'weekly' ? 'Semanal' : 'Mensual'}
            </button>
        ))}
    </div>
);

// ─── Main Component ──────────────────────────────────────────
const POLL_INTERVAL = 30_000;

const SuperAdminDashboard: FC = () => {
    const [stats, setStats] = useState<SuperAdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [searchParams, setSearchParams] = useSearchParams();

    const tabParam = searchParams.get('tab');
    const validTabs = ['global', 'branches', 'charts'];
    const isInvalidTab = tabParam && !validTabs.includes(tabParam);
    const activeTab = tabParam === 'branches' ? 'branches' : tabParam === 'charts' ? 'charts' : 'global';

    const setActiveTab = (tab: string) => {
        setSearchParams({ tab });
        if (tab === 'global') setSelectedBranch(null);
    };

    const fetchStats = () => {
        api.get('/stats/super-dashboard')
            .then(res => {
                setStats(res.data.data);
                setLastUpdated(new Date());
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const handleBranchSelect = (id: number) => {
        setSelectedBranch(prev => prev === id ? null : id);
        setActiveTab('branches');
    };

    const selectedBranchData = stats?.branchStats.find(b => b.id === selectedBranch);

    // Get the active movement data based on time range
    const activeMovements: MovementPoint[] = stats
        ? (timeRange === 'daily' ? stats.movementsDaily : timeRange === 'weekly' ? stats.movementsWeekly : stats.movementsMonthly)
        : [];

    // Derive category list from lowStockProducts
    const lowStockCategories = stats
        ? [...new Set(stats.lowStockProducts.map(p => p.category))].sort()
        : [];

    const filteredLowStock = stats
        ? (categoryFilter ? stats.lowStockProducts.filter(p => p.category === categoryFilter) : [])
        : [];

    if (isInvalidTab) return <NotFound />;

    if (loading) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <div style={styles.loadingSpinner}>
                        <div style={styles.spinner} />
                        <p style={{ color: '#64748b', marginTop: '1rem', fontWeight: 500 }}>Cargando panel de control...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">

                {/* ── Header ── */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Panel Super Admin</h1>
                        <p style={styles.subtitle}>
                            Vista global del sistema · {new Date().toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {lastUpdated && (
                            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>
                                Actualizado: {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                &nbsp;·&nbsp;
                                <button onClick={fetchStats} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                                    ↻ Actualizar ahora
                                </button>
                            </p>
                        )}
                    </div>
                    <div style={styles.superBadge}>
                        <div style={styles.superBadgeDot} />
                        En vivo · 30s
                    </div>
                </div>

                {/* ── Tab Navigation ── */}
                <div style={styles.tabs}>
                    {[
                        { key: 'global', label: '📊 Global' },
                        { key: 'charts', label: '📈 Gráficos' },
                        { key: 'branches', label: '🏢 Sucursales' },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            style={{ ...styles.tab, ...(activeTab === t.key ? styles.tabActive : {}) }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ════════════ GLOBAL TAB ════════════ */}
                {activeTab === 'global' && stats && (
                    <>
                        {/* ── KPI Grid — Stock Total is the hero ── */}
                        <div style={styles.kpiGrid}>
                            <KpiCard
                                label="Stock Total en Sistema"
                                value={Number(stats.products.total_stock).toLocaleString()}
                                sub={`${Number(stats.products.active_products)} productos activos · ${Number(stats.products.low_stock_count)} con stock crítico`}
                                icon={icons.box}
                                color="#6366f1"
                                bg="#eef2ff"
                                gradient="linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)"
                                large
                            />
                            <KpiCard
                                label="Total Usuarios"
                                value={Number(stats.users.total_users).toLocaleString()}
                                sub={`${Number(stats.users.admins)} admins · ${Number(stats.users.employees)} empleados`}
                                icon={icons.users}
                                color="#8b5cf6"
                                bg="#f5f3ff"
                                gradient="linear-gradient(135deg, #fafafa 60%, #f5f3ff 100%)"
                            />
                            <KpiCard
                                label="Total Movimientos"
                                value={Number(stats.movements.total_movements).toLocaleString()}
                                sub={`${Number(stats.movements.total_entradas).toLocaleString()} ent · ${Number(stats.movements.total_salidas).toLocaleString()} sal`}
                                icon={icons.sync}
                                color="#0ea5e9"
                                bg="#e0f2fe"
                                gradient="linear-gradient(135deg, #fafafa 60%, #e0f2fe 100%)"
                            />
                            <KpiCard
                                label="Sucursales"
                                value={Number(stats.branches.total_branches).toLocaleString()}
                                sub={`${Number(stats.branches.active_branches)} activas`}
                                icon={icons.branch}
                                color="#f59e0b"
                                bg="#fffbeb"
                                gradient="linear-gradient(135deg, #fafafa 60%, #fffbeb 100%)"
                            />
                            {Number(stats.products.low_stock_count) > 0 && (
                                <KpiCard
                                    label="Alertas Stock Crítico"
                                    value={Number(stats.products.low_stock_count).toLocaleString()}
                                    sub="productos bajo umbral"
                                    icon={icons.warn}
                                    color="#ef4444"
                                    bg="#fee2e2"
                                    gradient="linear-gradient(135deg, #fafafa 60%, #fee2e2 100%)"
                                />
                            )}
                        </div>

                        {/* ── Stock por Categoría (pie) ── */}
                        {stats.stockByCategory.length > 0 && (
                            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={styles.chartHeader}>
                                    <h3 style={styles.chartTitle}>🥧 Distribución de Stock por Categoría</h3>
                                    <span style={styles.chartBadge}>Inventario</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={stats.stockByCategory}
                                                dataKey="total_stock"
                                                nameKey="category"
                                                cx="50%" cy="50%"
                                                outerRadius={90} innerRadius={45}
                                                paddingAngle={3}
                                            >
                                                {stats.stockByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v: any) => [Number(v).toLocaleString(), 'Unidades']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {stats.stockByCategory.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.82rem', color: '#475569', flex: 1 }}>{item.category}</span>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{Number(item.total_stock).toLocaleString()} uds</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ════════════ CHARTS TAB ════════════ */}
                {activeTab === 'charts' && stats && (
                    <>
                        {/* ── Time range selector ── */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
                            <TimeSelector value={timeRange} onChange={setTimeRange} />
                        </div>

                        {/* ── Chart: Entradas ── */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={styles.chartHeader}>
                                <h3 style={{ ...styles.chartTitle, color: '#059669' }}>📥 Entradas de Inventario</h3>
                                <span style={{ ...styles.chartBadge, background: '#d1fae5', color: '#065f46' }}>
                                    {timeRange === 'daily' ? 'Últimos 14 días' : timeRange === 'weekly' ? 'Últimas 12 semanas' : 'Últimos 6 meses'}
                                </span>
                            </div>
                            {activeMovements.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={activeMovements} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={styles.empty}>Sin datos de entradas para este período</div>
                            )}
                        </div>

                        {/* ── Chart: Salidas ── */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={styles.chartHeader}>
                                <h3 style={{ ...styles.chartTitle, color: '#dc2626' }}>📤 Salidas de Inventario</h3>
                                <span style={{ ...styles.chartBadge, background: '#fee2e2', color: '#991b1b' }}>
                                    {timeRange === 'daily' ? 'Últimos 14 días' : timeRange === 'weekly' ? 'Últimas 12 semanas' : 'Últimos 6 meses'}
                                </span>
                            </div>
                            {activeMovements.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={activeMovements} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="salidas" name="Salidas" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={styles.empty}>Sin datos de salidas para este período</div>
                            )}
                        </div>

                        {/* ── Chart: Top Productos ── */}
                        {stats.topProducts.length > 0 && (
                            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={styles.chartHeader}>
                                    <h3 style={styles.chartTitle}>🏆 Top Productos por Movimiento</h3>
                                    <span style={styles.chartBadge}>Ranking Global</span>
                                </div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={stats.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#475569' }} width={60} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[0, 4, 4, 0]} stackId="a" />
                                        <Bar dataKey="salidas" name="Salidas" fill="#ef4444" radius={[0, 4, 4, 0]} stackId="b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* ── Stock Crítico por Categoría ── */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={styles.chartHeader}>
                                <h3 style={{ ...styles.chartTitle, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {icons.warn} Stock Crítico por Categoría
                                </h3>
                                <span style={{ ...styles.chartBadge, background: '#fee2e2', color: '#dc2626' }}>
                                    {stats.lowStockProducts.length} alertas
                                </span>
                            </div>

                            {stats.lowStockProducts.length === 0 ? (
                                <div style={{ ...styles.empty, color: '#10b981' }}>
                                    ✅ Todo el stock está en niveles saludables
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                                        <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {icons.filter} Filtrar por categoría:
                                        </span>
                                        <select
                                            value={categoryFilter}
                                            onChange={e => setCategoryFilter(e.target.value)}
                                            style={{
                                                padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
                                                fontSize: '0.85rem', fontWeight: 600, color: '#334155',
                                                background: '#fff', cursor: 'pointer', outline: 'none',
                                            }}
                                        >
                                            <option value="">— Selecciona una categoría —</option>
                                            {lowStockCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {!categoryFilter ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            {lowStockCategories.map(cat => {
                                                const count = stats.lowStockProducts.filter(p => p.category === cat).length;
                                                const i = lowStockCategories.indexOf(cat);
                                                return (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setCategoryFilter(cat)}
                                                        style={{
                                                            padding: '8px 18px', borderRadius: '20px', border: `2px solid ${COLORS[i % COLORS.length]}`,
                                                            background: `${COLORS[i % COLORS.length]}15`, color: COLORS[i % COLORS.length],
                                                            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                                                        }}
                                                    >
                                                        {cat} · {count} producto{count !== 1 ? 's' : ''}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {filteredLowStock.map(p => (
                                                <div key={p.id} style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px 16px', borderRadius: '12px',
                                                    background: p.stock === 0 ? '#fef2f2' : '#fffbeb',
                                                    border: `1px solid ${p.stock === 0 ? '#fecaca' : '#fde68a'}`,
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{p.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{p.category}</div>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.82rem',
                                                        background: p.stock === 0 ? '#fee2e2' : '#fef3c7',
                                                        color: p.stock === 0 ? '#dc2626' : '#d97706',
                                                    }}>
                                                        {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}

                {/* ════════════ BRANCHES TAB ════════════ */}
                {activeTab === 'branches' && stats && (
                    <>
                        <div style={styles.branchesGrid}>
                            {stats.branchStats.map(branch => (
                                <BranchCard key={branch.id} branch={branch} onSelect={handleBranchSelect} selected={selectedBranch === branch.id} />
                            ))}
                            {stats.branchStats.length === 0 && (
                                <div style={{ ...styles.empty, gridColumn: '1/-1', padding: '3rem' }}>
                                    No hay sucursales registradas.
                                </div>
                            )}
                        </div>

                        {selectedBranchData && (
                            <div className="card" style={styles.branchDetail}>
                                <div style={styles.chartHeader}>
                                    <h3 style={styles.chartTitle}>{icons.branch} <span style={{ marginLeft: '8px' }}>Detalle — {selectedBranchData.name}</span></h3>
                                    <button style={styles.closeBtn} onClick={() => setSelectedBranch(null)}>✕ Cerrar</button>
                                </div>
                                <div style={styles.branchDetailGrid}>
                                    {[
                                        { label: 'Movimientos', value: Number(selectedBranchData.total_movements).toLocaleString(), color: '#6366f1' },
                                        { label: 'Entradas', value: Number(selectedBranchData.total_entradas).toLocaleString(), color: '#10b981' },
                                        { label: 'Salidas', value: Number(selectedBranchData.total_salidas).toLocaleString(), color: '#ef4444' },
                                        { label: 'Usuarios activos', value: Number(selectedBranchData.active_users).toLocaleString(), color: '#f59e0b' },
                                    ].map(item => (
                                        <div key={item.label} style={styles.branchDetailKpi}>
                                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                                            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart
                                            data={[
                                                { name: 'Entradas', value: Number(selectedBranchData.total_entradas) },
                                                { name: 'Salidas', value: Number(selectedBranchData.total_salidas) },
                                            ]}
                                            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                                <Cell fill="#10b981" />
                                                <Cell fill="#ef4444" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

// ─── Styles ─────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
    title: { color: '#0f172a', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 },
    subtitle: { color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' },
    superBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '8px 18px', borderRadius: '50px', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' },
    superBadgeDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#a5f3fc', animation: 'pulse 2s infinite' },

    tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' },
    tab: { padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease' },
    tabActive: { background: '#6366f1', color: '#fff', borderColor: '#6366f1', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },

    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' },
    kpiCard: { borderRadius: '16px', padding: '1.4rem 1.5rem', border: '1px solid rgba(226,232,240,0.7)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' },
    kpiValue: { fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 },
    kpiLabel: { fontSize: '0.85rem', color: '#475569', fontWeight: 600, marginTop: '0.4rem' },
    kpiSub: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' },
    kpiIcon: { borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

    chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' },
    chartTitle: { color: '#0f172a', fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center' },
    chartBadge: { background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' },

    branchesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' },
    branchCard: { background: '#fff', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s ease' },
    branchIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 },
    branchStatsRow: { display: 'flex', justifyContent: 'space-between', margin: '1rem 0', padding: '1rem', background: '#f8fafc', borderRadius: '12px' },
    branchStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    branchStatLabel: { fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 },
    adminTag: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', marginBottom: '12px' },
    adminAvatar: { width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' },
    viewBtn: { width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#6366f1', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center' },

    branchDetail: { padding: '1.75rem', borderRadius: '20px', marginBottom: '1.5rem', border: '2px solid #eef2ff' },
    branchDetailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginTop: '1.25rem' },
    branchDetailKpi: { background: '#f8fafc', borderRadius: '14px', padding: '1.2rem 1rem', textAlign: 'center' },
    closeBtn: { background: '#f1f5f9', border: 'none', color: '#475569', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' },

    empty: { textAlign: 'center', color: '#94a3b8', padding: '2rem', fontSize: '0.9rem' },
    loadingSpinner: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    spinner: { width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' },
};

export default SuperAdminDashboard;
