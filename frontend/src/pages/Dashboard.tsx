import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import NotFound from './NotFound';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { DashboardStats } from '../types';

// SVGs helper
const icons = {
    products: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    store: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    warning: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    sync: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>,
    up: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
    down: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>,
    check: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    report: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
}

const Dashboard: FC = () => {
    const { user, isAdmin, isSuperAdmin } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    const tabParam = searchParams.get('tab')
    const isInvalidTab = tabParam && !['global', 'charts'].includes(tabParam)
    const activeTab = tabParam || 'global'

    // Super admin has their own dedicated dashboard
    useEffect(() => {
        if (isSuperAdmin) {
            navigate('/super-dashboard', { replace: true })
        }
    }, [isSuperAdmin, navigate])

    useEffect(() => {
        if (isAdmin && !isSuperAdmin) {
            api.get('/stats/dashboard')
                .then(res => setStats(res.data.data))
                .catch(() => { })
                .finally(() => setLoading(false))
        } else if (!isSuperAdmin) {
            setLoading(false)
        }
    }, [isAdmin, isSuperAdmin])

    if (isInvalidTab) {
        return <NotFound />
    }

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">
                <div style={styles.welcome}>
                    <h1 style={styles.title}>Bienvenido, {user?.name}</h1>
                    <p style={styles.subtitle}>
                        Rol: <strong style={{ color: '#0f172a' }}>{user?.role === 'admin'
                            ? 'Administrador'
                            : user?.role === 'super_admin'
                                ? 'Super Admin'
                                : 'Empleado'
                        }
                        </strong>

                    </p>
                </div>

                {/* Stats para admin */}
                {isAdmin && !loading && stats && activeTab === 'global' && (
                    <>
                        {/* Métricas principales */}
                        <div style={styles.statsGrid}>
                            {[
                                { label: 'Productos Activos', value: stats.products.active_products, icon: icons.products, color: '#4f46e5', bg: '#eef2ff' },
                                { label: 'Stock Total', value: stats.products.total_stock, icon: icons.store, color: '#059669', bg: '#ecfdf5' },
                                { label: 'Stock Bajo', value: stats.products.low_stock_count, icon: icons.warning, color: '#d97706', bg: '#fffbeb' },
                                { label: 'Total Usuarios', value: stats.users.total_users, icon: icons.users, color: '#7c3aed', bg: '#f5f3ff' },
                                { label: 'Total Movimientos', value: stats.movements.total_movements, icon: icons.sync, color: '#2563eb', bg: '#eff6ff' },
                                { label: 'Entradas', value: stats.movements.total_entradas, icon: icons.up, color: '#10b981', bg: '#d1fae5' },
                                { label: 'Salidas', value: stats.movements.total_salidas, icon: icons.down, color: '#e11d48', bg: '#ffe4e6' },
                                { label: 'Usuarios Activos', value: stats.users.active_users, icon: icons.check, color: '#0d9488', bg: '#ccfbf1' },
                            ].map(stat => (
                                <div key={stat.label} className="card" style={styles.statCard}>
                                    <div style={{ ...styles.statIconWrapper, color: stat.color, background: stat.bg }}>
                                        {stat.icon}
                                    </div>
                                    <div style={{ ...styles.statValue, color: '#0f172a' }}>{stat.value}</div>
                                    <div style={styles.statLabel}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {isAdmin && !loading && stats && activeTab === 'charts' && (
                    <>
                        <div style={styles.twoCol}>
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <h3 style={styles.cardTitle}>Movimientos</h3>
                                </div>
                                <div style={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart
                                            data={[
                                                { name: 'Entradas', value: stats?.movements?.total_entradas ?? 0 },
                                                { name: 'Salidas', value: stats?.movements?.total_salidas ?? 0 }
                                            ]}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#4f46e5" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Stock bajo */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#d97706', display: 'flex' }}>{icons.warning}</span>
                                    <h3 style={{ ...styles.cardTitle, marginBottom: 0 }}>
                                        Productos con Stock Bajo
                                    </h3>
                                </div>
{stats.lowStockProducts.length > 0 && (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={stats.lowStockProducts.map(p => ({ name: p.name, stock: p.stock }))}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="stock" fill="#ef4444" />
    </BarChart>
  </ResponsiveContainer>
)}

                                {stats.lowStockProducts.length === 0 ? (
                                    <p style={styles.empty}>No hay productos con stock bajo</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHead}>
                                                <th style={styles.th}>Producto</th>
                                                <th style={styles.th}>Categoría</th>
                                                <th style={styles.th}>Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.lowStockProducts.map(p => (
                                                <tr key={p.id} style={styles.tr}>
                                                    <td style={styles.td}><strong>{p.name}</strong></td>
                                                    <td style={styles.td}>
                                                        <span style={{ ...styles.categoryBadge }}>
                                                            {p.category || '—'}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <span style={{
                                                            ...styles.badge,
                                                            background: p.stock === 0 ? '#ffe4e6' : '#fef3c7',
                                                            color: p.stock === 0 ? '#e11d48' : '#d97706'
                                                        }}>
                                                            {p.stock === 0 ? 'Agotado' : p.stock}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Top productos */}
                        {stats && stats.topProducts.length > 0 && (
                            <div className="card" style={{ marginTop: '1.5rem', padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <h3 style={{ ...styles.cardTitle, marginBottom: 0 }}>Top Productos más Movidos</h3>
                                </div>
<ResponsiveContainer width="100%" height={250}>
  <BarChart data={stats.topProducts.map(p => ({ name: p.name, movimientos: p.total_movimientos }))}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="movimientos" fill="#4f46e5" />
  </BarChart>
</ResponsiveContainer>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHead}>
                                            <th style={styles.th}>#</th>
                                            <th style={styles.th}>Producto</th>
                                            <th style={styles.th}>Categoría</th>
                                            <th style={styles.th}>Total Movimientos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.topProducts.map((p, i) => (
                                            <tr key={p.id} style={styles.tr}>
                                                <td style={styles.td}>
                                                    <div style={styles.rankBadge}>{i + 1}</div>
                                                </td>
                                                <td style={styles.td}><strong>{p.name}</strong></td>
                                                <td style={styles.td}>
                                                    <span style={styles.categoryBadge}>{p.category || '—'}</span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{ ...styles.badge, background: '#eef2ff', color: '#4f46e5' }}>
                                                        {p.total_movimientos} movs
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}



            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    welcome: { marginBottom: '2rem' },
    title: { color: '#0f172a', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.025em' },
    subtitle: { color: '#64748b', fontSize: '1rem' },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
    },
    statCard: {
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        border: '1px solid rgba(226, 232, 240, 0.6)'
    },
    statIconWrapper: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
    },
    statValue: { fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.2rem' },
    statLabel: { color: '#64748b', fontSize: '0.85rem', fontWeight: 500 },
    twoCol: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
    },
    cardTitle: { color: '#0f172a', marginBottom: '0', fontSize: '1.1rem', fontWeight: 700 },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    th: {
        padding: '0.8rem 1.5rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        color: '#64748b',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    tr: {
        transition: 'background-color 0.2s ease',
        borderBottom: '1px solid #f1f5f9'
    },
    td: {
        padding: '1rem 1.5rem',
        fontSize: '0.9rem',
        color: '#334155'
    },
    badge: {
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'inline-block'
    },
    categoryBadge: {
        background: '#f1f5f9',
        color: '#475569',
        padding: '0.3rem 0.8rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 500
    },
    rankBadge: {
        background: '#f1f5f9',
        color: '#64748b',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.8rem'
    },
    empty: { color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1.25rem'
    },
    cardLink: { textDecoration: 'none' },
    quickCard: {
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        border: '1px solid rgba(226, 232, 240, 0.8)'
    },
    quickIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
        transition: 'transform 0.2s ease'
    },
    quickTitle: { color: '#0f172a', marginBottom: '0.4rem', fontSize: '1.1rem', fontWeight: 600 },
    quickDesc: { color: '#64748b', fontSize: '0.85rem' }
}

export default Dashboard;