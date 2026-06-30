import { useState, useEffect, useCallback, useContext } from 'react';
import type { FC } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import type { UserItem, UsersResponse, UserStats, Branch } from '../types';
import { AuthContext } from '../context/AuthContext';

type BranchStatus = 'all' | 'assigned' | 'unassigned';

const roleBadge = (role: string) => {
    if (role === 'super_admin') return { label: 'Super Admin', cls: 'bg-rose-50 text-rose-600 border border-rose-100' };
    if (role === 'admin') return { label: 'Admin', cls: 'bg-violet-50 text-violet-600 border border-violet-100' };
    return { label: 'Empleado', cls: 'bg-slate-100 text-slate-600 border border-slate-200' };
};

const avatarColor = (role: string) => {
    if (role === 'super_admin') return 'bg-rose-100 text-rose-700';
    if (role === 'admin') return 'bg-violet-100 text-violet-700';
    return 'bg-slate-200 text-slate-700';
};

const Users: FC = () => {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [branchStatus, setBranchStatus] = useState<BranchStatus>('all');
    const [editUser, setEditUser] = useState<UserItem | null>(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '', branch_id: '' as string | null });
    const [editError, setEditError] = useState('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [editLoading, setEditLoading] = useState(false);
    const { user: currentUser, isSuperAdmin } = useContext(AuthContext);

    const fetchStats = async () => {
        try {
            const res = await api.get('/users/stats');
            setStats(res.data.data);
        } catch { }
    };

    const fetchBranches = useCallback(async () => {
        if (!isSuperAdmin) return;
        try {
            const res = await api.get('/branches');
            setBranches(res.data.data || res.data);
        } catch { }
    }, [isSuperAdmin]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<UsersResponse>('/users', {
                params: {
                    page,
                    limit: 10,
                    search: search || undefined,
                    role: roleFilter || undefined,
                    ...(isSuperAdmin && branchStatus !== 'all' ? { branch_status: branchStatus } : {})
                }
            });
            setUsers(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.total);
        } catch {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, [page, search, roleFilter, branchStatus, isSuperAdmin]);

    useEffect(() => {
        fetchStats();
        fetchUsers();
        fetchBranches();
    }, [fetchUsers, fetchBranches]);

    const handleToggle = async (id: number) => {
        try {
            await api.patch(`/users/${id}/toggle`);
            fetchUsers();
            fetchStats();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al cambiar estado');
        }
    };

    const handleEditOpen = (user: UserItem) => {
        setEditUser(user);
        setEditForm({ name: user.name, email: user.email, role: user.role, branch_id: user.branch_id?.toString() || '' });
        setEditError('');
    };

    const handleEditSave = async () => {
        if (!editUser) return;
        setEditLoading(true);
        try {
            const payload = {
                ...editForm,
                branch_id: editForm.branch_id ? Number(editForm.branch_id) : null
            };
            await api.put(`/users/${editUser.id}`, payload);
            setEditUser(null);
            fetchUsers();
        } catch (err: any) {
            setEditError(err.response?.data?.message || 'Error al actualizar usuario');
        } finally {
            setEditLoading(false);
        }
    };

    const handleTabChange = (tab: BranchStatus) => {
        setBranchStatus(tab);
        setPage(1);
    };

    const statCards = stats ? [
        { label: 'Total', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '👥' },
        { label: 'Admins', value: stats.admins, color: 'text-violet-600', bg: 'bg-violet-50', icon: '🛡️' },
        { label: 'Empleados', value: stats.employees, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '👤' },
        { label: 'Activos', value: stats.active, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
        { label: 'Inactivos', value: stats.inactive, color: 'text-rose-600', bg: 'bg-rose-50', icon: '❌' },
    ] : [];

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">Gestión de Usuarios</h1>
                        <p className="text-xs text-slate-500 font-medium">
                            {isSuperAdmin ? 'Panel global · Todos los usuarios del sistema' : 'Usuarios de tu sucursal'}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                        {statCards.map(stat => (
                            <div key={stat.label} className="bg-white border border-slate-100 rounded-[1.25rem] shadow-sm p-4 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center text-lg shrink-0`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters + Tabs */}
                <div className="bg-white border border-slate-100 rounded-[1.25rem] shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input
                                type="text"
                                placeholder="Buscar usuario..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/40 w-56"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500/40 bg-white cursor-pointer"
                            >
                                <option value="">Todos los roles</option>
                                <option value="admin">Admin</option>
                                <option value="employee">Empleado</option>
                                {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Branch Status Tabs — Super Admin only */}
                        {isSuperAdmin && (
                            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                                {([
                                    { key: 'all', label: 'Todos' },
                                    { key: 'assigned', label: 'Con Sucursal' },
                                    { key: 'unassigned', label: 'Sin Sucursal' },
                                ] as const).map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${branchStatus === tab.key
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{total} usuarios</span>
                    </div>
                </div>

                {/* Table */}
                {loading && (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
                    </div>
                )}
                {error && <p className="error-msg">{error}</p>}

                {!loading && !error && (
                    <div className="bg-white border border-slate-100 rounded-[1.25rem] shadow-sm overflow-hidden">
                        {/* Header row */}
                        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100">
                            {['Usuario', 'Email', 'Rol', 'Sucursal', 'Estado', 'Acciones'].map(col => (
                                <span key={col} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col}</span>
                            ))}
                        </div>

                        {users.length === 0 ? (
                            <div className="text-center py-14 text-slate-400">
                                <div className="text-4xl mb-3">🔍</div>
                                <p className="font-bold text-sm">No se encontraron usuarios</p>
                                <p className="text-xs mt-1">Intenta ajustar los filtros o la búsqueda</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {users.map(user => {
                                    const rb = roleBadge(user.role);
                                    const ac = avatarColor(user.role);
                                    return (
                                        <div key={user.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-slate-50/60 transition-colors">
                                            {/* User */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${ac}`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-800 truncate">{user.name}</span>
                                            </div>
                                            {/* Email */}
                                            <span className="text-sm text-slate-500 truncate">{user.email}</span>
                                            {/* Role */}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${rb.cls}`}>{rb.label}</span>
                                            {/* Branch */}
                                            <span className={`text-xs font-medium truncate ${user.branch_name ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                                {user.branch_name || '— Sin asignar'}
                                            </span>
                                            {/* Status */}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${user.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                            {/* Actions */}
                                            <div className="flex gap-2 justify-end">
                                                {isSuperAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditOpen(user)}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggle(user.id)}
                                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${user.is_active
                                                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                        >
                                                            {user.is_active ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-6">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            ← Anterior
                        </button>
                        <span className="text-sm font-bold text-slate-500">Página {page} de {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            Siguiente →
                        </button>
                    </div>
                )}

                {/* Edit Modal */}
                {editUser && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
                            {/* Modal Header */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${avatarColor(editUser.role)}`}>
                                    {editUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Editar Usuario</h3>
                                    <p className="text-xs text-slate-400 font-medium">{editUser.email}</p>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre</label>
                                <input
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/40"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/40"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rol</label>
                                {editUser && currentUser && editUser.id === currentUser.id ? (
                                    <div className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-400">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                        No puedes cambiar tu propio rol
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={editForm.role}
                                            onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                            className="appearance-none w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/40 bg-white cursor-pointer"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="employee">Empleado</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Branch (SuperAdmin only) */}
                            {isSuperAdmin && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sucursal Asignada</label>
                                    <div className="relative">
                                        <select
                                            value={editForm.branch_id || ''}
                                            onChange={e => setEditForm({ ...editForm, branch_id: e.target.value })}
                                            className="appearance-none w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/40 bg-white cursor-pointer"
                                        >
                                            <option value="">— Sin Sucursal</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editError && (
                                <p className="text-xs font-bold text-rose-500 bg-rose-50 rounded-xl px-4 py-2.5">{editError}</p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    onClick={() => setEditUser(null)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleEditSave}
                                    disabled={editLoading}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Users;