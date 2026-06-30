import { useState } from 'react';
import type { FC } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

interface TraceUnit {
    id: number;
    product_id: number;
    serial_code: string;
    status: string;
    product_name: string;
    category: string;
}

interface TraceMovement {
    id: number;
    type: 'entrada' | 'salida';
    quantity: number;
    created_at: string;
    user_name: string;
}

interface TraceResponse {
    unit: TraceUnit;
    history: TraceMovement[];
}

const Traceability: FC = () => {
    const [searchCode, setSearchCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<TraceResponse | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchCode.trim()) return;
        
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await api.get(`/products/trace/${searchCode.trim()}`);
            setResult(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al buscar el código de serie');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <Navbar />

            <div className="main-content">
                <div className="flex justify-between items-center mb-8 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">
                            Trazabilidad de Unidades
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Busca el historial completo de un producto usando su número de serie
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 transform transition-all">
                    
                    <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                placeholder="Ingresa el número de serie (ej. SN-P1-A1B2-0)"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center gap-2"
                        >
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </form>

                    {error && (
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100 flex items-center gap-3 mb-6">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Información del Producto</p>
                                    <h3 className="text-lg font-black text-slate-800 mb-1">{result.unit.product_name}</h3>
                                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                                        {result.unit.category || 'Sin categoría'}
                                    </span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado de Unidad</p>
                                    <h3 className="text-lg font-black text-slate-800 mb-1">{result.unit.serial_code}</h3>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                        result.unit.status === 'en_stock' ? 'bg-emerald-100 text-emerald-700' :
                                        result.unit.status === 'despachado' ? 'bg-indigo-100 text-indigo-700' :
                                        'bg-rose-100 text-rose-700'
                                    }`}>
                                        {result.unit.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-slate-800 mb-4 px-1">Línea de Tiempo (Movimientos)</h3>
                            <div className="relative pl-4 border-l-2 border-indigo-100 space-y-6">
                                {result.history.map((mov) => (
                                    <div key={mov.id} className="relative">
                                        <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 border-white ${
                                            mov.type === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}></div>
                                        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 ml-2 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border ${
                                                    mov.type === 'entrada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                    {mov.type === 'entrada' ? 'ENTRADA' : 'SALIDA'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500">
                                                    {new Date(mov.created_at).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-700">
                                                Operación realizada por <span className="font-bold text-indigo-600">{mov.user_name}</span>.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Traceability;
