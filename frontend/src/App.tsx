import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import Products from './pages/Products'
import NotFound from './pages/NotFound'
import InDevelopment from './pages/InDevelopment'
import Users from './pages/Users'
import Movements from './pages/Movements'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />

        {/* Super Admin exclusive dashboard */}
        <Route path="/super-dashboard" element={
          <PrivateRoute superAdminOnly={true}><SuperAdminDashboard /></PrivateRoute>
        } />

        <Route path="/products" element={
          <PrivateRoute excludeSuperAdmin={true}><Products /></PrivateRoute>
        } />
        <Route path="/movements" element={
          <PrivateRoute excludeSuperAdmin={true}><Movements /></PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute adminOnly={true}><Users /></PrivateRoute>
        } />

        <Route path="/development" element={<InDevelopment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App