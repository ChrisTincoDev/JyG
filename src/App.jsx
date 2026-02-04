import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header/Header'
import Home from './components/Home/Home'
import Productos from './components/Productos/Productos'
import PuntosVenta from './components/PuntosVenta/PuntosVenta'
import NuevoPuntoVenta from './components/NuevoPuntoVenta/NuevoPuntoVenta'
import ComprobanteGenerado from './components/ComprobanteGenerado/ComprobanteGenerado'

function App() {
  return (
    <div className="app">
      <Header />
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
