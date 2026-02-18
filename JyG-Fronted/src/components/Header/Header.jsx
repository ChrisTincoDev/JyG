import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import './Header.css'

function Header({ usuario, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo-container">
          <div className="logo">
            <span className="logo-text">JyG</span>
            <span className="logo-subtitle">Facturación Electrónica</span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink
                to="/productos"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Productos
              </NavLink>
            </li>
            <li
              className="nav-item dropdown"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <NavLink
                to="/puntos-venta"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                Punto de Venta
                <span className="dropdown-arrow">▼</span>
              </NavLink>
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      to="/puntos-venta"
                      className="dropdown-link"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Mostrar todas
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/nuevo-punto-venta/boleta"
                      className="dropdown-link"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Nueva Boleta
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/nuevo-punto-venta/factura"
                      className="dropdown-link"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Nueva Factura
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* Usuario y Logout */}
        <div className="user-section">
          <span className="user-name">{usuario?.nombre || usuario?.username}</span>
          <button className="btn-logout" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
