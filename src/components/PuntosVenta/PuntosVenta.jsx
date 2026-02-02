import './PuntosVenta.css'

function PuntosVenta({ onNavigate }) {
  const puntosVentaDemo = [
    { 
      id: 1, 
      nombre: 'Punto de Venta Central', 
      direccion: 'Av. Principal 123, Lima',
      estado: 'activo',
      ultimaVenta: '2026-02-02'
    },
    { 
      id: 2, 
      nombre: 'Sucursal Norte', 
      direccion: 'Jr. Las Flores 456, Independencia',
      estado: 'activo',
      ultimaVenta: '2026-02-01'
    },
    { 
      id: 3, 
      nombre: 'Sucursal Sur', 
      direccion: 'Av. Los Héroes 789, San Juan de Miraflores',
      estado: 'inactivo',
      ultimaVenta: '2026-01-28'
    },
  ]

  return (
    <div className="puntos-venta-page">
      <div className="puntos-venta-container">
        <div className="page-header">
          <div className="header-content">
            <h1>Puntos de Venta</h1>
            <p>Administra todos tus puntos de venta</p>
          </div>
          <button className="btn-nuevo" onClick={() => onNavigate('nuevo-punto-venta')}>
            + Nuevo Punto de Venta
          </button>
        </div>

        <div className="puntos-grid">
          {puntosVentaDemo.map(punto => (
            <div key={punto.id} className="punto-card">
              <div className="punto-header">
                <span className={`estado ${punto.estado}`}>
                  {punto.estado === 'activo' ? '● Activo' : '○ Inactivo'}
                </span>
              </div>
              <div className="punto-body">
                <h3>{punto.nombre}</h3>
                <p className="direccion">
                  <span className="icon">📍</span>
                  {punto.direccion}
                </p>
                <p className="ultima-venta">
                  <span className="icon">📅</span>
                  Última venta: {punto.ultimaVenta}
                </p>
              </div>
              <div className="punto-actions">
                <button className="btn-action-card" onClick={() => onNavigate('nuevo-punto-venta')}>
                  Generar Comprobante
                </button>
                <button className="btn-action-secondary">
                  Ver Historial
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PuntosVenta
