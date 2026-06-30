import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DashboardCharts from './pages/DashboardCharts'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import SuperAdminCharts from './pages/SuperAdminCharts'
import SuperAdminBranches from './pages/SuperAdminBranches'
import Products from './pages/Products'
import NotFound from './pages/NotFound'
import InDevelopment from './pages/InDevelopment'
import Users from './pages/Users'
import Movements from './pages/Movements'
import Traceability from './pages/Traceability'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '732878725249-ji0si7douqtdko97k73bksss3pngsdki.apps.googleusercontent.com'

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />

        <Route path="/dashboard/charts" element={
          <PrivateRoute adminOnly={true}><DashboardCharts /></PrivateRoute>
        } />

        {/* Super Admin exclusive dashboard */}
        <Route path="/super-dashboard" element={
          <PrivateRoute superAdminOnly={true}><SuperAdminDashboard /></PrivateRoute>
        } />
        <Route path="/super-dashboard/charts" element={
          <PrivateRoute superAdminOnly={true}><SuperAdminCharts /></PrivateRoute>
        } />
        <Route path="/super-dashboard/branches" element={
          <PrivateRoute superAdminOnly={true}><SuperAdminBranches /></PrivateRoute>
        } />

        <Route path="/products" element={
          <PrivateRoute excludeSuperAdmin={true}><Products /></PrivateRoute>
        } />
        <Route path="/movements" element={
          <PrivateRoute excludeSuperAdmin={true}><Movements /></PrivateRoute>
        } />
        <Route path="/traceability" element={
          <PrivateRoute excludeSuperAdmin={true}><Traceability /></PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute adminOnly={true}><Users /></PrivateRoute>
        } />

        <Route path="/development" element={<InDevelopment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App