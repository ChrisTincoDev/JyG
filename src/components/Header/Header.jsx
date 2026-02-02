import { useState } from 'react'
import './Header.css'

function Header({ onNavigate, currentView }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-container" onClick={() => onNavigate('home')}>
          <div className="logo">
            <span className="logo-text">JyG</span>
            <span className="logo-subtitle">Facturación Electrónica</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <ul className="nav-list">
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${currentView === 'productos' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); onNavigate('productos'); }}
              >
                Productos
              </a>
            </li>
            <li 
              className="nav-item dropdown"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <a 
                href="#" 
                className={`nav-link ${currentView === 'puntos-venta' || currentView === 'nuevo-punto-venta' ? 'active' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                Punto de Venta
                <span className="dropdown-arrow">▼</span>
              </a>
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <a 
                      href="#" 
                      className="dropdown-link"
                      onClick={(e) => { e.preventDefault(); onNavigate('puntos-venta'); setDropdownOpen(false); }}
                    >
                      Ver todos los puntos de venta
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="dropdown-link"
                      onClick={(e) => { e.preventDefault(); onNavigate('nuevo-punto-venta'); setDropdownOpen(false); }}
                    >
                      Nuevo punto de venta
                    </a>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
