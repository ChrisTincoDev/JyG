import { useState, useEffect } from 'react'
import './Productos.css'
import { getProductos, createProducto, updateProducto, deleteProducto, getCategorias } from '../../api'

function Productos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [editandoId, setEditandoId] = useState(null)
  const [editandoData, setEditandoData] = useState({})
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nuevoProducto, setNuevoProducto] = useState({
    codigo: '',
    nombre: '',
    precioCosto: '',
    precioVenta: '',
    stock: '',
    unidad: 'UNI',
    categoria: '',
  })
  const [busqueda, setBusqueda] = useState('')
  const [productoAEliminar, setProductoAEliminar] = useState(null)

  const cargarProductos = async () => {
    try {
      const data = await getProductos()
      setProductos(data.results)
    } catch (err) {
      console.error('Error cargando productos:', err)
    }
  }

  const cargarCategorias = async () => {
    try {
      const data = await getCategorias()
      setCategorias(data.results)
    } catch (err) {
      console.error('Error cargando categorías:', err)
    }
  }

  useEffect(() => {
    cargarProductos()
    cargarCategorias()
  }, [])

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  )

  const calcularPrecioVenta = (precioCosto) => {
    return +(precioCosto * 1.18).toFixed(2)
  }

  const handleEditar = (producto) => {
    setEditandoId(producto.id)
    setEditandoData({
      precio_costo: producto.precio_costo,
      precio_venta: producto.precio_venta,
    })
  }

  const handleGuardar = async () => {
    try {
      await updateProducto(editandoId, editandoData)
      setEditandoId(null)
      setEditandoData({})
      cargarProductos()
    } catch (err) {
      console.error('Error actualizando producto:', err)
    }
  }

  const handleCancelar = () => {
    setEditandoId(null)
    setEditandoData({})
  }

  const handlePrecioCostoChange = (valor) => {
    setEditandoData(prev => ({
      ...prev,
      precio_costo: valor,
      precio_venta: valor ? calcularPrecioVenta(+valor) : '',
    }))
  }

  const handlePrecioVentaChange = (valor) => {
    setEditandoData(prev => ({ ...prev, precio_venta: valor }))
  }

  const handleNuevoChange = (campo, valor) => {
    if (campo === 'precioCosto') {
      setNuevoProducto(prev => ({ ...prev, precioCosto: valor, precioVenta: '' }))
    } else {
      setNuevoProducto(prev => ({ ...prev, [campo]: valor }))
    }
  }

  const handleAgregarProducto = async () => {
    if (!nuevoProducto.codigo || !nuevoProducto.nombre || nuevoProducto.precioCosto === '' || !nuevoProducto.categoria) return

    const costoNum = +nuevoProducto.precioCosto
    const ventaNum = nuevoProducto.precioVenta !== '' ? +nuevoProducto.precioVenta : null

    try {
      await createProducto({
        codigo: nuevoProducto.codigo,
        nombre: nuevoProducto.nombre,
        precio_costo: costoNum,
        precio_venta: ventaNum,
        stock: nuevoProducto.stock === '' ? 0 : +nuevoProducto.stock,
        unidad_medida: nuevoProducto.unidad,
        categoria: +nuevoProducto.categoria,
      })
      setNuevoProducto({ codigo: '', nombre: '', precioCosto: '', precioVenta: '', stock: '', unidad: 'UNI', categoria: '' })
      setModalAbierto(false)
      cargarProductos()
    } catch (err) {
      console.error('Error creando producto:', err)
    }
  }

  const handleEliminar = (producto) => {
    setProductoAEliminar(producto)
  }

  const confirmarEliminar = async () => {
    try {
      await deleteProducto(productoAEliminar.id)
      setProductoAEliminar(null)
      cargarProductos()
    } catch (err) {
      console.error('Error eliminando producto:', err)
    }
  }

  return (
    <div className="productos-page">
      <div className="productos-container">
        <div className="page-header">
          <div className="header-content">
            <h1>Productos y Servicios</h1>
            <p>Gestiona tu catálogo de productos y servicios</p>
          </div>
          <button className="btn-nuevo" onClick={() => setModalAbierto(true)}>
            + Nuevo Producto
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar producto por nombre o código..."
            className="search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className="btn-limpiar" onClick={() => setBusqueda('')}>Limpiar</button>
          )}
        </div>

        <div className="productos-table-container">
          <table className="productos-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Precio Costo</th>
                <th>P.U/Venta</th>
                <th>Stock</th>
                <th>Ud. Medida</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(producto => {
                const editando = editandoId === producto.id
                const costoNum = editando ? +editandoData.precio_costo : +producto.precio_costo
                const precioVentaMostrado = editando
                  ? editandoData.precio_venta
                  : producto.precio_venta

                return (
                  <tr key={producto.id} className={editando ? 'fila-editando' : ''}>
                    <td><span className="codigo">{producto.codigo}</span></td>
                    <td>{producto.nombre}</td>
                    <td className="precio">
                      {editando ? (
                        <div className="precio-input">
                          <span className="moneda">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            value={editandoData.precio_costo}
                            onChange={(e) => handlePrecioCostoChange(e.target.value)}
                          />
                        </div>
                      ) : (
                        <>S/ {costoNum.toFixed(2)}</>
                      )}
                    </td>
                    <td className="precio-venta">
                      {editando ? (
                        <div className="precio-input">
                          <span className="moneda">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            value={editandoData.precio_venta}
                            onChange={(e) => handlePrecioVentaChange(e.target.value)}
                          />
                        </div>
                      ) : (
                        <>S/ {(+precioVentaMostrado).toFixed(2)}</>
                      )}
                    </td>
                    <td>
                      <span className={`stock ${producto.stock === '-' ? 'servicio' : producto.stock < 50 ? 'bajo' : 'normal'}`}>
                        {producto.stock}
                      </span>
                    </td>
                    <td>
                      <span className="unidad">{producto.unidad_medida}</span>
                    </td>
                    <td>
                      <div className="acciones">
                        {editando ? (
                          <>
                            <button className="btn-action guardar" onClick={handleGuardar}>Guardar</button>
                            <button className="btn-action cancelar" onClick={handleCancelar}>Cancelar</button>
                          </>
                        ) : (
                          <>
                            <button className="btn-action edit" onClick={() => handleEditar(producto)}>Editar</button>
                            <button className="btn-action delete" onClick={() => handleEliminar(producto)}>Eliminar</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {modalAbierto && (
          <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nuevo Producto</h2>
                <button className="modal-cerrar" onClick={() => setModalAbierto(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="modal-campo">
                  <label>Código Producto</label>
                  <input
                    type="text"
                    placeholder="Ej: PROD006"
                    value={nuevoProducto.codigo}
                    onChange={(e) => handleNuevoChange('codigo', e.target.value)}
                  />
                </div>
                <div className="modal-campo">
                  <label>Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={nuevoProducto.nombre}
                    onChange={(e) => handleNuevoChange('nombre', e.target.value)}
                  />
                </div>
                <div className="modal-campo">
                  <label>Categoría</label>
                  <select
                    value={nuevoProducto.categoria}
                    onChange={(e) => handleNuevoChange('categoria', e.target.value)}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-fila">
                  <div className="modal-campo">
                    <label>Precio Costo</label>
                    <div className="precio-input">
                      <span className="moneda">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={nuevoProducto.precioCosto}
                        onChange={(e) => handleNuevoChange('precioCosto', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="modal-campo">
                    <label>P.U/Venta</label>
                    <div className="precio-input">
                      <span className="moneda">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={nuevoProducto.precioCosto !== '' ? calcularPrecioVenta(+nuevoProducto.precioCosto).toFixed(2) : '0.00'}
                        value={nuevoProducto.precioVenta}
                        onChange={(e) => handleNuevoChange('precioVenta', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-fila">
                  <div className="modal-campo">
                    <label>Stock</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={nuevoProducto.stock}
                      onChange={(e) => handleNuevoChange('stock', e.target.value)}
                    />
                  </div>
                  <div className="modal-campo">
                    <label>Unidad</label>
                    <select
                      value={nuevoProducto.unidad}
                      onChange={(e) => handleNuevoChange('unidad', e.target.value)}
                    >
                      <option value="UNI">Unidad</option>
                      <option value="KG">Kilogramo</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-action cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button className="btn-nuevo" onClick={handleAgregarProducto}>Agregar Producto</button>
              </div>
            </div>
          </div>
        )}

        {productoAEliminar && (
          <div className="modal-overlay" onClick={() => setProductoAEliminar(null)}>
            <div className="modal modal-eliminar" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Confirmar Eliminación</h2>
                <button className="modal-cerrar" onClick={() => setProductoAEliminar(null)}>×</button>
              </div>
              <div className="modal-body">
                <p className="mensaje-eliminar">
                  ¿Estás seguro de que deseas eliminar el producto <strong>{productoAEliminar.nombre}</strong> ({productoAEliminar.codigo})?
                </p>
                <p className="mensaje-advertencia">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button className="btn-action cancelar" onClick={() => setProductoAEliminar(null)}>Cancelar</button>
                <button className="btn-action delete" onClick={confirmarEliminar}>Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Productos
