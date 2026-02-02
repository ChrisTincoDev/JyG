import { useState } from 'react'
import './App.css'
import Header from './components/Header/Header'
import Home from './components/Home/Home'
import Productos from './components/Productos/Productos'
import PuntosVenta from './components/PuntosVenta/PuntosVenta'
import NuevoPuntoVenta from './components/NuevoPuntoVenta/NuevoPuntoVenta'

function App() {
  const [currentView, setCurrentView] = useState('home')

  const handleNavigate = (view) => {
    setCurrentView(view)
  }

  const renderView = () => {
    switch (currentView) {
      case 'productos':
        return <Productos />
      case 'puntos-venta':
        return <PuntosVenta onNavigate={handleNavigate} />
      case 'nuevo-punto-venta':
        return <NuevoPuntoVenta />
      case 'home':
      default:
        return <Home onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="app">
      <Header onNavigate={handleNavigate} currentView={currentView} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  )
}

export default App
