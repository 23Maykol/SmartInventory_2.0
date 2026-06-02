import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import NotFound from './pages/NotFound'
import InDevelopment from './pages/InDevelopment'
import Users from './pages/Users'
import Movements from './pages/Movements'



function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/movements" element={
          <PrivateRoute><Movements /></PrivateRoute>
        } />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/products" element={
          <PrivateRoute><Products /></PrivateRoute>
        } />
        <Route path="/development" element={<InDevelopment />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/users" element={
          <PrivateRoute adminOnly={true}><Users /></PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App