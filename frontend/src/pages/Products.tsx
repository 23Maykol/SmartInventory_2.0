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
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Productos</h2>
                        <p style={styles.subtitle}>Total: {total} productos</p>
                    </div>
                    <div style={styles.headerActions}>
                        <form onSubmit={handleSearch} style={styles.searchForm}>
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={styles.searchInput}
                            />
                            <button type="submit" className="btn-secondary">Buscar</button>
                        </form>
                        <button
                            className="btn-primary"
                            style={{ width: 'auto' }}
                            onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm) }}
                        >
                            {showForm ? 'Cancelar' : '+ Nuevo Producto'}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="card" style={styles.form}>
                        <h3 style={styles.formTitle}>
                            {editId ? 'Editar Producto' : 'Nuevo Producto'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGrid}>
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input name="name" value={form.name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <input name="category" value={form.category} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Stock *</label>
                                    <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" />
                                </div>
                                <div className="form-group">
                                    <label>Precio *</label>
                                    <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required min="0" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={2} />
                            </div>
                            {formError && <p className="error-msg">{formError}</p>}
                            <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={formLoading}>
                                {formLoading ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Producto'}
                            </button>
                        </form>
                    </div>
                )}

                {loading && <p style={styles.loading}>Cargando productos...</p>}
                {error && <p className="error-msg">{error}</p>}

                {!loading && !error && (
                    <>
                        <div style={styles.grid}>
                            {products.length === 0 ? (
                                <p style={styles.empty}>No hay productos registrados.</p>
                            ) : (
                                products.map(product => (
                                    <div key={product.id} className="card" style={styles.productCard}>
                                        <div style={styles.productCategory}>
                                            {product.category || 'Sin categoría'}
                                        </div>
                                        <h3 style={styles.productName}>{product.name}</h3>
                                        <p style={styles.productDesc}>{product.description || '—'}</p>
                                        <div style={styles.productFooter}>
                                            <span style={styles.productPrice}>
                                                S/ {Number(product.price).toFixed(2)}
                                            </span>
                                            <span style={{
                                                ...styles.productStock,
                                                background: product.stock <= 5 ? '#ffe4e6' : '#ecfdf5',
                                                color: product.stock <= 5 ? '#be123c' : '#047857'
                                            }}>
                                                Stock: {product.stock}
                                            </span>
                                        </div>
                                        {isAdmin && (
                                            <div style={styles.productActions}>
                                                <button
                                                    className="btn-secondary"
                                                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn-danger"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

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
                    </>
                )}
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1.5rem'
    },
    title: { color: '#0f172a', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.025em' },
    subtitle: { color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' },
    headerActions: { display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' },
    searchForm: { display: 'flex', gap: '0.5rem' },
    searchInput: {
        padding: '0.6rem 1rem',
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '0.9rem',
        width: '240px',
        color: '#0f172a'
    },
    form: { marginBottom: '2rem' },
    formTitle: { color: '#0f172a', marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: 700 },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0 1.25rem'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem'
    },
    productCard: { 
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column'
    },
    productCategory: {
        fontSize: '0.75rem',
        color: '#4f46e5',
        background: '#eef2ff',
        padding: '0.2rem 0.6rem',
        borderRadius: '6px',
        fontWeight: 600,
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
        alignSelf: 'flex-start'
    },
    productName: { color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 700 },
    productDesc: { color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem', flexGrow: 1, lineHeight: 1.5 },
    productFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #f1f5f9'
    },
    productPrice: { fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' },
    productStock: {
        fontSize: '0.75rem',
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontWeight: 600
    },
    productActions: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' },
    loading: { textAlign: 'center', color: '#64748b', padding: '2rem' },
    empty: { textAlign: 'center', color: '#64748b', padding: '2rem', gridColumn: '1/-1' },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '2.5rem'
    },
    pageInfo: { color: '#475569', fontSize: '0.9rem', fontWeight: 500 }
}

export default Products