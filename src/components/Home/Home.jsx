import './Home.css'

function Home({ onNavigate }) {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Sistema de Facturación Electrónica</h1>
          <p>Genera boletas y facturas electrónicas de manera rápida y sencilla</p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => onNavigate('nuevo-punto-venta')}>
              Generar Comprobante
            </button>
            <button className="btn-hero-secondary" onClick={() => onNavigate('productos')}>
              Ver Productos
            </button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Características del Sistema</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">📋</span>
            <h3>Boletas Electrónicas</h3>
            <p>Genera boletas electrónicas válidas ante SUNAT de forma rápida y segura.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📄</span>
            <h3>Facturas Electrónicas</h3>
            <p>Emite facturas electrónicas con todos los datos fiscales requeridos.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📦</span>
            <h3>Gestión de Productos</h3>
            <p>Administra tu catálogo de productos y servicios de manera eficiente.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🏪</span>
            <h3>Múltiples Puntos de Venta</h3>
            <p>Configura y gestiona varios puntos de venta para tu negocio.</p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-item">
          <span className="stat-number">100%</span>
          <span className="stat-label">Compatible con SUNAT</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">24/7</span>
          <span className="stat-label">Disponibilidad</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">Seguro</span>
          <span className="stat-label">Datos Protegidos</span>
        </div>
      </div>
    </div>
  )
}

export default Home
