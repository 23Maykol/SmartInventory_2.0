import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api/axios'
import Navbar from '../components/Navbar'
import type { UserItem, UsersResponse, UserStats } from '../types'
import { AuthContext } from '../context/AuthContext'

const Users: React.FC = () => {
    const [users, setUsers] = useState<UserItem[]>([])
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [editUser, setEditUser] = useState<UserItem | null>(null)
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '' })
    const [editError, setEditError] = useState('')
    const [editLoading, setEditLoading] = useState(false);
    const { isSuperAdmin } = useContext(AuthContext);

    const fetchStats = async () => {
        try {
            const res = await api.get('/users/stats')
            setStats(res.data.data)
        } catch { }
    }

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<UsersResponse>('/users', {
                params: {
                    page,
                    limit: 10,
                    search: search || undefined,
                    role: roleFilter || undefined
                }
            })
            setUsers(res.data.data)
            setTotalPages(res.data.totalPages)
            setTotal(res.data.total)
        } catch {
            setError('Error al cargar usuarios')
        } finally {
            setLoading(false)
        }
    }, [page, search, roleFilter])

    useEffect(() => {
        fetchStats()
        fetchUsers()
    }, [fetchUsers])

    const handleToggle = async (id: number) => {
        try {
            await api.patch(`/users/${id}/toggle`)
            fetchUsers()
            fetchStats()
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al cambiar estado')
        }
    }

    const handleEditOpen = (user: UserItem) => {
        setEditUser(user)
        setEditForm({ name: user.name, email: user.email, role: user.role })
        setEditError('')
    }

    const handleEditSave = async () => {
        if (!editUser) return
        setEditLoading(true)
        try {
            await api.put(`/users/${editUser.id}`, editForm)
            setEditUser(null)
            fetchUsers()
        } catch (err: any) {
            setEditError(err.response?.data?.message || 'Error al actualizar usuario')
        } finally {
            setEditLoading(false)
        }
    }

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">

                <h2 style={styles.title}>Gestión de Usuarios</h2>

                {/* Stats */}
                {stats && (
                    <div style={styles.statsGrid}>
                        {[
                            { label: 'Total', value: stats.total, color: '#4f46e5', bg: '#eef2ff' },
                            { label: 'Admins', value: stats.admins, color: '#7c3aed', bg: '#f5f3ff' },
                            { label: 'Empleados', value: stats.employees, color: '#059669', bg: '#ecfdf5' },
                            { label: 'Activos', value: stats.active, color: '#10b981', bg: '#d1fae5' },
                            { label: 'Inactivos', value: stats.inactive, color: '#e11d48', bg: '#ffe4e6' },
                        ].map(stat => (
                            <div key={stat.label} className="card" style={{ ...styles.statCard, borderTop: `4px solid ${stat.color}` }}>
                                <div style={{ ...styles.statValue, color: '#0f172a' }}>{stat.value}</div>
                                <div style={styles.statLabel}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filtros */}
                <div className="card" style={styles.filters}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
                        style={styles.searchInput}
                    />
                    <select
                        value={roleFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setRoleFilter(e.target.value); setPage(1); }}
                        style={styles.select}
                    >
                        <option value="">Todos los roles</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Empleado</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                    <span style={styles.totalText}>Total: {total} usuarios</span>
                </div>

                {/* Tabla */}
                {loading && <p style={styles.loading}>Cargando usuarios...</p>}
                {error && <p className="error-msg">{error}</p>}

                {!loading && !error && (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Nombre</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Rol</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Creado</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={styles.empty}>No hay usuarios</td>
                                    </tr>
                                ) : (
                                    users.map((user, i) => (
                                        <tr key={user.id} style={{
                                            background: i % 2 === 0 ? 'white' : '#f8f9fa'
                                        }}>
                                            <td style={styles.td}>{user.id}</td>
                                            <td style={styles.td}>{user.name}</td>
                                            <td style={styles.td}>{user.email}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: user.role === 'admin' ? '#f5f3ff' : user.role === 'super_admin' ? '#ffe4e6' : '#ecfdf5',
                                                    color: user.role === 'admin' ? '#7c3aed' : user.role === 'super_admin' ? '#e11d48' : '#059669'
                                                }}>
                                                    {user.role === 'admin' ? 'Admin' : user.role === 'super_admin' ? 'Super Admin' : 'Empleado'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: user.is_active ? '#d1fae5' : '#ffe4e6',
                                                    color: user.is_active ? '#047857' : '#be123c'
                                                }}>
                                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actions}>
                                                    {isSuperAdmin && (
                                                        <>
                                                            <button
                                                                className="btn-secondary"
                                                                style={styles.actionBtn}
                                                                onClick={() => handleEditOpen(user)}
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                style={{
                                                                    ...styles.actionBtn,
                                                                    background: user.is_active ? '#fff1f2' : '#ecfdf5',
                                                                    color: user.is_active ? '#e11d48' : '#047857',
                                                                    border: user.is_active ? '1px solid #ffe4e6' : '1px solid #d1fae5',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: 600
                                                                }}
                                                                onClick={() => handleToggle(user.id)}
                                                            >
                                                                {user.is_active ? 'Desactivar' : 'Activar'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div style={styles.pagination}>
                        <button
                            className="btn-secondary"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            ← Anterior
                        </button>
                        <span style={styles.pageInfo}>Página {page} de {totalPages}</span>
                        <button
                            className="btn-secondary"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}

                {/* Modal de edición */}
                {editUser && (
                    <div style={styles.overlay}>
                        <div className="card" style={styles.modal}>
                            <h3 style={styles.modalTitle}>Editar Usuario</h3>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Rol</label>
                                <select
                                    value={editForm.role}
                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', color: '#0f172a', backgroundColor: '#fff' }}
                                >
                                     <option value="admin">Admin</option>
                                     <option value="super_admin">Super Admin</option>
                                     <option value="employee">Empleado</option>
                                </select>
                            </div>
                            {editError && <p className="error-msg">{editError}</p>}
                            <div style={styles.modalActions}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setEditUser(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-primary"
                                    style={{ width: 'auto' }}
                                    onClick={handleEditSave}
                                    disabled={editLoading}
                                >
                                    {editLoading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    title: { color: '#0f172a', fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.025em' },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
    },
    statCard: { 
        display: 'flex', 
        flexDirection: 'column',
        padding: '1.5rem',
        border: '1px solid rgba(226, 232, 240, 0.6)'
    },
    statValue: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' },
    statLabel: { color: '#64748b', fontSize: '0.85rem', fontWeight: 500 },
    filters: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
    },
    searchInput: {
        padding: '0.6rem 1rem',
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '0.9rem',
        width: '280px',
        color: '#0f172a'
    },
    select: {
        padding: '0.6rem 1rem',
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '0.9rem',
        color: '#0f172a'
    },
    totalText: { color: '#64748b', fontSize: '0.9rem', fontWeight: 500 },
    loading: { textAlign: 'center', color: '#64748b', padding: '2rem' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    th: {
        padding: '0.8rem 1.5rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        color: '#64748b',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    td: {
        padding: '1rem 1.5rem',
        fontSize: '0.9rem',
        color: '#334155',
        borderBottom: '1px solid #f1f5f9'
    },
    badge: {
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'inline-block'
    },
    actions: { display: 'flex', gap: '0.5rem' },
    actionBtn: { fontSize: '0.85rem', padding: '0.4rem 0.8rem' },
    empty: { textAlign: 'center', padding: '2rem', color: '#64748b' },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '2.5rem'
    },
    pageInfo: { color: '#475569', fontSize: '0.9rem', fontWeight: 500 },
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: { 
        width: '100%', 
        maxWidth: '450px', 
        padding: '2rem',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    modalTitle: { color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 },
    modalActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }
}

export default Users