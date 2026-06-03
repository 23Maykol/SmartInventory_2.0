import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
    children: React.ReactNode
    adminOnly?: boolean
    superAdminOnly?: boolean
    excludeSuperAdmin?: boolean
}

const PrivateRoute = ({ children, adminOnly = false, superAdminOnly = false, excludeSuperAdmin = false }: Props) => {
    const { isAuthenticated, isAdmin, isSuperAdmin, isInitializing } = useAuth()

    // While reading localStorage, show nothing to avoid premature redirect
    if (isInitializing) return null

    if (!isAuthenticated) return <Navigate to="/login" replace />

    // Only super_admin can access superAdminOnly routes
    if (superAdminOnly && !isSuperAdmin) return <Navigate to="/dashboard" replace />

    // Block super_admin from specific operational routes if requested
    if (excludeSuperAdmin && isSuperAdmin) return <Navigate to="/super-dashboard" replace />

    // Only admin (includes super_admin) can access adminOnly routes
    if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />

    return <>{children}</>
}

export default PrivateRoute