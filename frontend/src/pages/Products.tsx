import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import type { Product, ProductsResponse } from '../types'
import { useAuth } from '../hooks/useAuth'

const emptyForm = {
    name: '', stock: 0, price: 0, category: '', description: ''
}

const Products = () => {
    const { isAdmin } = useAuth()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [formError, setFormError] = useState('')
    const [formLoading, setFormLoading] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<ProductsResponse>('/products', {
                params: { page, limit: 8, search: search || undefined }
            })
            setProducts(res.data.data)
            setTotalPages(res.data.totalPages)
            setTotal(res.data.total)
        } catch {
            setError('Error al cargar productos')
        } finally {
            setLoading(false)
        }
    }, [page, search])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setFormError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)
        try {
            const data = {
                ...form,
                stock: Number(form.stock),
                price: Number(form.price)
            }
            if (editId) {
                await api.put(`/products/${editId}`, data)
            } else {
                await api.post('/products', data)
            }
            setForm(emptyForm)
            setShowForm(false)
            setEditId(null)
            fetchProducts()
        } catch (err: any) {
            const errors = err.response?.data?.errors
            if (errors) {
                setFormError(errors.map((e: any) => e.message).join(', '))
            } else {
                setFormError(err.response?.data?.message || 'Error al guardar producto')
            }
        } finally {
            setFormLoading(false)
        }
    }

    const handleEdit = (product: Product) => {
        setForm({
            name: product.name,
            stock: product.stock,
            price: product.price,
            category: product.category || '',
            description: product.description || ''
        })
        setEditId(product.id)
        setShowForm(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return
        try {
            await api.delete(`/products/${id}`)
            fetchProducts()
        } catch {
            alert('Error al eliminar producto')
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchProducts()
    }

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventario</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                            <p className="text-sm font-semibold text-slate-500">Total: {total} productos registrados</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-auto flex items-center">
                            <svg className="w-4 h-4 absolute left-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2.5 w-full sm:w-64 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            />
                            <button type="submit" className="hidden">Buscar</button>
                        </form>
                        {isAdmin && (
                            <button
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-200 flex items-center gap-2 ${showForm ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-sm' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20'}`}
                                onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm) }}
                            >
                                {showForm ? 'Cancelar' : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                                        Nuevo Producto
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Formulario */}
                {isAdmin && showForm && (
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl p-6 md:p-8 mb-8 transform transition-all animate-fadeIn">
                        <div className="mb-8 flex flex-col items-start border-b border-slate-100 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                                        {editId ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1 font-medium">
                                        {editId ? 'Modifica los detalles del producto seleccionado.' : 'Ingresa la información básica para añadir un producto al inventario.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Producto *</label>
                                    <input 
                                        name="name" 
                                        value={form.name} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Ej. Laptop Dell XPS 13"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
                                    <input 
                                        name="category" 
                                        value={form.category} 
                                        onChange={handleChange} 
                                        placeholder="Ej. Electrónica"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Inicial *</label>
                                    <input 
                                        type="number" 
                                        name="stock" 
                                        value={form.stock} 
                                        onChange={handleChange} 
                                        required min="0" 
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Precio Unitario (S/) *</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="price" 
                                        value={form.price} 
                                        onChange={handleChange} 
                                        required min="0" 
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" 
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción del Producto</label>
                                <textarea 
                                    name="description" 
                                    value={form.description} 
                                    onChange={handleChange} 
                                    rows={3} 
                                    placeholder="Añade detalles adicionales sobre el producto, especificaciones, etc."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-none" 
                                />
                            </div>

                            {formError && (
                                <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100 flex items-center gap-3">
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {formError}
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={formLoading} 
                                    className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 transition-all disabled:opacity-70 disabled:hover:shadow-indigo-600/20 flex items-center justify-center gap-2"
                                >
                                    {formLoading && <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                    {formLoading ? 'Procesando...' : editId ? 'Guardar Cambios' : 'Confirmar Registro'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <svg className="animate-spin h-8 w-8 mb-4 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-sm font-semibold">Cargando catálogo...</p>
                    </div>
                )}
                
                {error && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <p className="text-rose-600 font-semibold">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border border-slate-100 border-dashed">
                                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                </div>
                                <p className="text-slate-500 font-medium text-lg">No hay productos registrados</p>
                                <p className="text-slate-400 text-sm mt-1">Añade un producto para comenzar a gestionar el inventario.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {products.map(product => (
                                    <div key={product.id} className="group bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-[1.5rem] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                        
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                                {product.category || 'Sin categoría'}
                                            </span>
                                            {isAdmin && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(product)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-2">{product.name}</h3>
                                        <p className="text-sm text-slate-500 mb-6 flex-grow line-clamp-3">{product.description || 'Sin descripción'}</p>
                                        
                                        <div className="pt-4 border-t border-slate-100 flex justify-between items-end mt-auto">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Precio</p>
                                                <p className="text-xl font-black text-slate-900">S/ {Number(product.price).toFixed(2)}</p>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-xl flex flex-col items-center justify-center ${product.stock <= 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Stock</span>
                                                <span className="text-base font-bold leading-none">{product.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-10">
                                <button
                                    className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 transition-all shadow-sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                                </button>
                                <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
                                    Página {page} de {totalPages}
                                </span>
                                <button
                                    className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 transition-all shadow-sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Products