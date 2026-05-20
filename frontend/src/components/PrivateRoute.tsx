import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
    children: React.ReactNode
    adminOnly?: boolean
}

const PrivateRoute = ({ children, adminOnly = false }: Props) => {
    const { isAuthenticated, isAdmin } = useAuth()

    if (!isAuthenticated) return <Navigate to="/login" replace />
    if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />

    return <>{children}</>
}

export default PrivateRoute