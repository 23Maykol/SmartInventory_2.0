import { useState, useEffect } from 'react';
import type { FC } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import type { SuperAdminStats, User } from '../types';

const SuperAdminBranches: FC = () => {
    const [stats, setStats] = useState<SuperAdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [branchUsers, setBranchUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        api.get('/stats/super-dashboard')
            .then(res => setStats(res.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSelectBranch = (branchId: number) => {
        if (selectedBranchId === branchId) {
            setSelectedBranchId(null);
            setBranchUsers([]);
            return;
        }
        setSelectedBranchId(branchId);
        setLoadingUsers(true);
        api.get(`/users?limit=100&branch_id=${branchId}`)
            .then(res => setBranchUsers(res.data.data))
            .catch(() => {})
            .finally(() => setLoadingUsers(false));
    };

    if (loading) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="main-content flex items-center justify-center">
                    <p className="text-slate-400 text-sm font-bold">Cargando sucursales...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                        Gestión de Sucursales
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Visualiza estadísticas clave y miembros por cada sucursal de la red.
                    </p>
                </div>

                {stats && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Branches List */}
                        <div className="xl:col-span-2 flex flex-col gap-4">
                            {stats.branchStats.map(branch => {
                                const isSelected = selectedBranchId === branch.id;
                                return (
                                    <div 
                                        key={branch.id} 
                                        onClick={() => handleSelectBranch(branch.id)}
                                        className={`bg-white rounded-[1.25rem] border ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'} shadow-sm p-5 cursor-pointer hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800 leading-tight">{branch.name}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">{branch.address || 'Sin dirección'}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${branch.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {branch.is_active ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                                        {branch.active_users} Usuarios
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 sm:text-right mt-2 sm:mt-0">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Movimientos</p>
                                                <p className="text-xl font-black text-slate-800">{Number(branch.total_movements).toLocaleString()}</p>
                                            </div>
                                            <div className="flex flex-col gap-0.5 text-xs font-bold">
                                                <span className="text-emerald-600 flex items-center gap-1 justify-end">
                                                    ↓ {Number(branch.total_entradas).toLocaleString()}
                                                </span>
                                                <span className="text-rose-600 flex items-center gap-1 justify-end">
                                                    ↑ {Number(branch.total_salidas).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {stats.branchStats.length === 0 && (
                                <div className="text-center py-10 text-slate-400 font-medium border border-dashed border-slate-300 rounded-[1.25rem]">
                                    No hay sucursales registradas.
                                </div>
                            )}
                        </div>

                        {/* Selected Branch Detail / Members */}
                        <div className="xl:col-span-1">
                            <div className="bg-white rounded-[1.25rem] shadow-sm border border-slate-100 sticky top-6 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 40px)' }}>
                                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                    <h3 className="text-sm font-bold text-slate-800">Integrantes de Sucursal</h3>
                                </div>
                                
                                <div className="flex-1 overflow-auto p-4">
                                    {!selectedBranchId ? (
                                        <div className="h-40 flex items-center justify-center text-center text-slate-400 text-xs font-bold">
                                            Selecciona una sucursal para ver a sus integrantes.
                                        </div>
                                    ) : loadingUsers ? (
                                        <div className="h-40 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        </div>
                                    ) : branchUsers.length === 0 ? (
                                        <div className="h-40 flex items-center justify-center text-center text-slate-400 text-xs font-bold">
                                            No hay integrantes activos en esta sucursal.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {branchUsers.map(user => (
                                                <div key={user.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                                                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminBranches;
