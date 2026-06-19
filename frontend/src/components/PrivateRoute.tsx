import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
    children: React.ReactNode
    adminOnly?: boolean
    superAdminOnly?: boolean
    excludeSuperAdmin?: boolean
}

import NotFound from '../pages/NotFound'

const PrivateRoute = ({ children, adminOnly = false, superAdminOnly = false, excludeSuperAdmin = false }: Props) => {
    const { isAuthenticated, isAdmin, isSuperAdmin, isInitializing } = useAuth()

    // While reading localStorage, show nothing to avoid premature redirect
    if (isInitializing) return null

    if (!isAuthenticated) return <Navigate to="/login" replace />

    // Only super_admin can access superAdminOnly routes
    if (superAdminOnly && !isSuperAdmin) return <NotFound />

    // Block super_admin from specific operational routes if requested
    if (excludeSuperAdmin && isSuperAdmin) return <NotFound />

    // Only admin (includes super_admin) can access adminOnly routes
    if (adminOnly && !isAdmin) return <NotFound />

    return <>{children}</>
}

export default PrivateRoute