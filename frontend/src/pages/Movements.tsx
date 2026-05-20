import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import type { Movement, MovementsResponse, Product } from '../types'

const Movements = () => {
    const [movements, setMovements] = useState<Movement[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [typeFilter, setTypeFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        product_id: '',
        type: 'entrada',
        quantity: '',
        note: ''
    })
    const [formError, setFormError] = useState('')
    const [formLoading, setFormLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    const fetchMovements = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<MovementsResponse>('/movements', {
                params: {
                    page,
                    limit: 10,
                    type: typeFilter || undefined
                }
            })
            setMovements(res.data.data)
            setTotalPages(res.data.totalPages)
            setTotal(res.data.total)
        } catch {
        } finally {
            setLoading(false)
        }
    }, [page, typeFilter])

    useEffect(() => {
        fetchMovements()
        api.get('/products?limit=100').then(res => setProducts(res.data.data))
    }, [fetchMovements])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)
        setFormError('')
        try {
            await api.post('/movements', {
                product_id: Number(form.product_id),
                type: form.type,
                quantity: Number(form.quantity),
                note: form.note || null
            })
            setSuccessMsg('Movimiento registrado exitosamente')
            setForm({ product_id: '', type: 'entrada', quantity: '', note: '' })
            setShowForm(false)
            fetchMovements()
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Error al registrar movimiento')
        } finally {
            setFormLoading(false)
        }
    }

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Movimientos de Inventario</h2>
                        <p style={styles.subtitle}>Total: {total} movimientos</p>
                    </div>
                    <div style={styles.headerActions}>
                        <select
                            value={typeFilter}
                            onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
                            style={styles.select}
                        >
                            <option value="">Todos los tipos</option>
                            <option value="entrada">Entradas</option>
                            <option value="salida">Salidas</option>
                        </select>
                        <button
                            className="btn-primary"
                            style={{ width: 'auto' }}
                            onClick={() => { setShowForm(!showForm); setFormError('') }}
                        >
                            {showForm ? 'Cancelar' : '+ Registrar Movimiento'}
                        </button>
                    </div>
                </div>

                {successMsg && (
                    <div style={styles.successBanner}>{successMsg}</div>
                )}

                {/* Formulario */}
                {showForm && (
                    <div className="card" style={styles.form}>
                        <h3 style={styles.formTitle}>Registrar Movimiento</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGrid}>
                                <div className="form-group">
                                    <label>Producto *</label>
                                    <select
                                        value={form.product_id}
                                        onChange={e => setForm({ ...form, product_id: e.target.value })}
                                        style={styles.formSelect}
                                        required
                                    >
                                        <option value="">Seleccionar producto...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Stock: {p.stock})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tipo *</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                        style={styles.formSelect}
                                        required
                                    >
                                        <option value="entrada">Entrada</option>
                                        <option value="salida">Salida</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Cantidad *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.quantity}
                                        onChange={e => setForm({ ...form, quantity: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nota</label>
                                    <input
                                        type="text"
                                        value={form.note}
                                        onChange={e => setForm({ ...form, note: e.target.value })}
                                        placeholder="Opcional..."
                                    />
                                </div>
                            </div>
                            {formError && <p className="error-msg">{formError}</p>}
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ width: 'auto' }}
                                disabled={formLoading}
                            >
                                {formLoading ? 'Registrando...' : 'Registrar Movimiento'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Tabla */}
                {loading && <p style={styles.loading}>Cargando movimientos...</p>}

                {!loading && (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHead}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Producto</th>
                                    <th style={styles.th}>Tipo</th>
                                    <th style={styles.th}>Cantidad</th>
                                    <th style={styles.th}>Usuario</th>
                                    <th style={styles.th}>Nota</th>
                                    <th style={styles.th}>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={styles.empty}>
                                            No hay movimientos registrados
                                        </td>
                                    </tr>
                                ) : (
                                    movements.map((m, i) => (
                                        <tr key={m.id} style={{ background: i % 2 === 0 ? 'white' : '#f8f9fa' }}>
                                            <td style={styles.td}>{m.id}</td>
                                            <td style={styles.td}><strong>{m.product_name}</strong></td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: m.type === 'entrada' ? '#d1fae5' : '#ffe4e6',
                                                    color: m.type === 'entrada' ? '#047857' : '#be123c'
                                                }}>
                                                    {m.type === 'entrada' ? 'Entrada' : 'Salida'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <strong style={{ color: m.type === 'entrada' ? '#047857' : '#be123c' }}>
                                                    {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                                                </strong>
                                            </td>
                                            <td style={styles.td}>{m.user_name}</td>
                                            <td style={styles.td}>{m.note || '—'}</td>
                                            <td style={styles.td}>
                                                {new Date(m.created_at).toLocaleString()}
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
    headerActions: { display: 'flex', gap: '1rem', alignItems: 'center' },
    select: {
        padding: '0.6rem 1rem',
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '0.9rem',
        color: '#0f172a',
        backgroundColor: '#fff'
    },
    successBanner: {
        background: '#ecfdf5',
        color: '#047857',
        padding: '0.8rem 1.2rem',
        borderRadius: '10px',
        marginBottom: '1.5rem',
        fontWeight: 500,
        border: '1px solid #d1fae5'
    },
    form: { marginBottom: '2rem' },
    formTitle: { color: '#0f172a', marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: 700 },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0 1.25rem'
    },
    formSelect: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '0.95rem',
        color: '#0f172a',
        backgroundColor: '#fff'
    },
    loading: { textAlign: 'center', color: '#64748b', padding: '2rem' },
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
    empty: { textAlign: 'center', padding: '2rem', color: '#64748b' },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '2.5rem'
    },
    pageInfo: { color: '#475569', fontSize: '0.9rem', fontWeight: 500 }
}

export default Movements