import './Productos.css'

function Productos() {
  const productosDemo = [
    { id: 1, codigo: 'PROD001', nombre: 'Producto de ejemplo 1', precio: 50.00, stock: 100 },
    { id: 2, codigo: 'PROD002', nombre: 'Producto de ejemplo 2', precio: 75.50, stock: 50 },
    { id: 3, codigo: 'PROD003', nombre: 'Producto de ejemplo 3', precio: 120.00, stock: 30 },
    { id: 4, codigo: 'SERV001', nombre: 'Servicio de consultoría', precio: 200.00, stock: '-' },
    { id: 5, codigo: 'PROD004', nombre: 'Producto de ejemplo 4', precio: 45.00, stock: 200 },
  ]

  return (
    <div className="productos-page">
      <div className="productos-container">
        <div className="page-header">
          <div className="header-content">
            <h1>Productos y Servicios</h1>
            <p>Gestiona tu catálogo de productos y servicios</p>
          </div>
          <button className="btn-nuevo">
            + Nuevo Producto
          </button>
        </div>

        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Buscar producto por nombre o código..."
            className="search-input"
          />
          <button className="btn-search">Buscar</button>
        </div>

        <div className="productos-table-container">
          <table className="productos-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosDemo.map(producto => (
                <tr key={producto.id}>
                  <td><span className="codigo">{producto.codigo}</span></td>
                  <td>{producto.nombre}</td>
                  <td className="precio">S/ {producto.precio.toFixed(2)}</td>
                  <td>
                    <span className={`stock ${producto.stock === '-' ? 'servicio' : producto.stock < 50 ? 'bajo' : 'normal'}`}>
                      {producto.stock}
                    </span>
                  </td>
                  <td>
                    <div className="acciones">
                      <button className="btn-action edit" title="Editar">✏️</button>
                      <button className="btn-action delete" title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Productos
