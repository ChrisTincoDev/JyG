import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header/Header'
import Home from './components/Home/Home'
import Productos from './components/Productos/Productos'
import PuntosVenta from './components/PuntosVenta/PuntosVenta'
import NuevoPuntoVenta from './components/NuevoPuntoVenta/NuevoPuntoVenta'
import ComprobanteGenerado from './components/ComprobanteGenerado/ComprobanteGenerado'
import Login from './components/Login/Login'

function App() {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    // Verificar si hay un usuario en localStorage
    const usuarioGuardado = localStorage.getItem('usuario')
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado))
    }
  }, [])

  const handleLoginSuccess = (user) => {
    setUsuario(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  // Si no hay usuario, mostrar login
  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app">
      <Header usuario={usuario} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/puntos-venta" element={<PuntosVenta />} />
          <Route path="/nuevo-punto-venta/boleta" element={<NuevoPuntoVenta />} />
          <Route path="/nuevo-punto-venta/factura" element={<NuevoPuntoVenta />} />
          <Route path="/comprobante-generado" element={<ComprobanteGenerado />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
