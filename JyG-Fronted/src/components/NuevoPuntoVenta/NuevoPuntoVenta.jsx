import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './NuevoPuntoVenta.css'
import { getProductos, getClientes, createCliente, createComprobante, getEmpresa, getSiguienteCorrelativo, consultarDNI, consultarRUC } from '../../api'

function NuevoPuntoVenta() {
  const navigate = useNavigate()
  const location = useLocation()
  const tipoDocumento = location.pathname.includes('/factura') ? 'factura' : 'boleta'
  const [conDNI, setConDNI] = useState(true)
  const [clienteSeleccionado, setClienteSeleccionado] = useState('')
  const [showNuevoClienteModal, setShowNuevoClienteModal] = useState(false)
  const [showProductoModal, setShowProductoModal] = useState(false)
  const [showVistaPreviaModal, setShowVistaPreviaModal] = useState(false)
  const [itemModal, setItemModal] = useState({
    productoId: '',
    codigo: '',
    nombre: '',
    detalleAdicional: '',
    cantidad: 1,
    precioUnitarioConIGV: 0,
    subtotal: 0,
    igvLinea: 0,
    total: 0
  })
  const [nuevoCliente, setNuevoCliente] = useState({
    tipoDoc: 'dni',
    numeroDoc: '',
    nombre: '',
    direccion: '',
    email: ''
  })
  const [errorCliente, setErrorCliente] = useState('')
  const [buscandoDoc, setBuscandoDoc] = useState(false)
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [mostrarResultados, setMostrarResultados] = useState(false)

  const [clientes, setClientes] = useState([])
  const [productosApi, setProductosApi] = useState([])
  const [datosEmisor, setDatosEmisor] = useState(null)

  // Cargar datos del backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [prodRes, cliRes, empRes, corrRes] = await Promise.all([
          getProductos(),
          getClientes(),
          getEmpresa(),
          getSiguienteCorrelativo(tipoDocumento)
        ])
        setProductosApi(prodRes.results)
        setClientes(cliRes.results.map(c => ({
          id: c.id,
          tipoDoc: c.tipo_documento,
          numeroDoc: c.numero_documento,
          nombre: c.nombre,
          direccion: c.direccion,
          email: c.email
        })))
        if (empRes.results && empRes.results.length > 0) {
          const e = empRes.results[0]
          setDatosEmisor({
            ruc: e.ruc,
            razonSocial: e.razon_social,
            nombreComercial: e.nombre_comercial,
            direccion: e.direccion,
            telefono: e.telefono,
            encargado: e.encargado
          })
        }
        setFormData(prev => ({ ...prev, correlativo: corrRes.correlativo }))
      } catch (err) {
        console.error('Error cargando datos:', err)
      }
    }
    cargarDatos()
  }, [tipoDocumento])

  const obtenerFechaActual = () => {
    const hoy = new Date()
    const año = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')
    return `${año}-${mes}-${dia}`
  }

  const obtenerFechaFormateada = () => {
    const hoy = new Date()
    return hoy.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const obtenerSerie = () => {
    return tipoDocumento === 'boleta' ? 'B001' : 'F001'
  }

  const [formData, setFormData] = useState({
    correlativo: '00000001',
    moneda: 'PEN',
    items: [],
    subtotal: 0,
    igv: 0,
    total: 0,
    observaciones: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleConDNIChange = (e) => {
    setConDNI(e.target.checked)
    if (!e.target.checked) {
      setClienteSeleccionado('')
    }
  }

  const handleClienteChange = (e) => {
    setClienteSeleccionado(e.target.value)
  }

  // Filtrar productos por código o nombre
  const productosFiltrados = busquedaProducto.trim()
    ? productosApi.filter(p =>
        p.codigo.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
      )
    : []

  const handleBusquedaChange = (e) => {
    setBusquedaProducto(e.target.value)
    setMostrarResultados(true)
  }

  const handleProductoSelect = (producto) => {
    const precioConIGV = parseFloat(producto.precio_venta)
    const subtotal = precioConIGV / 1.18
    const igvLinea = subtotal * 0.18

    setItemModal({
      productoId: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      detalleAdicional: '',
      cantidad: 1,
      precioUnitarioConIGV: parseFloat(precioConIGV.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      igvLinea: parseFloat(igvLinea.toFixed(2)),
      total: parseFloat(precioConIGV.toFixed(2))
    })
    setShowProductoModal(true)
    setBusquedaProducto('')
    setMostrarResultados(false)
  }

  const handleInputNumerico = (e, field) => {
    let value = e.target.value
    value = value.replace(/[^0-9.]/g, '')
    if (value.startsWith('.')) {
      value = value.substring(1)
    }
    const puntos = value.split('.').length - 1
    if (puntos > 1) {
      value = value.substring(0, value.lastIndexOf('.'))
    }
    handleItemModalChange(field, value)
  }

  const recalcularTotalesLinea = (precioConIGV, cantidad) => {
    const cantidadNum = parseFloat(cantidad) || 0
    const precioNum = parseFloat(precioConIGV) || 0
    const subtotalUnitario = precioNum / 1.18
    const subtotalTotal = subtotalUnitario * cantidadNum
    const igvLinea = subtotalTotal * 0.18
    const total = cantidadNum * precioNum

    return {
      subtotal: parseFloat(subtotalTotal.toFixed(2)),
      igvLinea: parseFloat(igvLinea.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }
  }

  const handleItemModalChange = (field, value) => {
    setItemModal(prev => {
      const newItem = { ...prev }

      if (field === 'precioUnitarioConIGV') {
        newItem.precioUnitarioConIGV = value
        const totales = recalcularTotalesLinea(value, newItem.cantidad)
        newItem.subtotal = totales.subtotal
        newItem.igvLinea = totales.igvLinea
        newItem.total = totales.total
      } else if (field === 'cantidad') {
        newItem.cantidad = value
        const totales = recalcularTotalesLinea(newItem.precioUnitarioConIGV, value)
        newItem.subtotal = totales.subtotal
        newItem.igvLinea = totales.igvLinea
        newItem.total = totales.total
      } else {
        newItem[field] = value
      }

      return newItem
    })
  }

  const handleAceptarItem = () => {
    const cantidadNum = parseFloat(itemModal.cantidad) || 0
    const precioNum = parseFloat(itemModal.precioUnitarioConIGV) || 0

    if (cantidadNum < 1) {
      alert('La cantidad debe ser al menos 1')
      return
    }
    if (precioNum <= 0) {
      alert('El precio unitario debe ser mayor a 0')
      return
    }

    const newItem = {
      ...itemModal,
      cantidad: cantidadNum,
      precioUnitarioConIGV: precioNum,
      id: Date.now()
    }

    const newItems = [...formData.items, newItem]
    const totales = calcularTotales(newItems)

    setFormData(prev => ({
      ...prev,
      items: newItems,
      ...totales
    }))

    setShowProductoModal(false)
  }

  const handleEliminarItemModal = () => {
    setShowProductoModal(false)
  }

  const calcularTotales = (items) => {
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0)
    const igv = items.reduce((acc, item) => acc + item.igvLinea, 0)
    const total = subtotal + igv

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      igv: parseFloat(igv.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }
  }

  const removeItem = (itemId) => {
    const newItems = formData.items.filter(item => item.id !== itemId)
    const totales = calcularTotales(newItems)

    setFormData(prev => ({
      ...prev,
      items: newItems,
      ...totales
    }))
  }

  const handleNuevoClienteChange = (e) => {
    const { name, value } = e.target
    setNuevoCliente(prev => ({ ...prev, [name]: value }))
    setErrorCliente('')
  }

  const handleBuscarDocumento = async () => {
    const { tipoDoc, numeroDoc } = nuevoCliente
    if (tipoDoc === 'dni' && numeroDoc.length !== 8) {
      setErrorCliente('El DNI debe tener 8 dígitos')
      return
    }
    if (tipoDoc === 'ruc' && numeroDoc.length !== 11) {
      setErrorCliente('El RUC debe tener 11 dígitos')
      return
    }

    setBuscandoDoc(true)
    setErrorCliente('')

    try {
      if (tipoDoc === 'dni') {
        const res = await consultarDNI(numeroDoc)
        if (res.success && res.data) {
          setNuevoCliente(prev => ({
            ...prev,
            nombre: res.data.nombre_completo || ''
          }))
        } else {
          setErrorCliente('No se encontraron datos para este DNI')
        }
      } else if (tipoDoc === 'ruc') {
        const res = await consultarRUC(numeroDoc)
        if (res.success && res.data) {
          setNuevoCliente(prev => ({
            ...prev,
            nombre: res.data.nombre_o_razon_social || '',
            direccion: res.data.direccion_completa || res.data.direccion || ''
          }))
        } else {
          setErrorCliente('No se encontraron datos para este RUC')
        }
      } else {
        setErrorCliente('La búsqueda solo está disponible para DNI y RUC')
      }
    } catch (err) {
      setErrorCliente('Error al consultar documento: ' + err.message)
    } finally {
      setBuscandoDoc(false)
    }
  }

  const validarNuevoCliente = () => {
    const { numeroDoc, nombre, direccion, email, tipoDoc } = nuevoCliente

    if (!numeroDoc.trim()) return 'El número de documento es obligatorio'
    if (tipoDoc === 'dni' && numeroDoc.length !== 8) return 'El DNI debe tener 8 dígitos'
    if (tipoDoc === 'ruc' && numeroDoc.length !== 11) return 'El RUC debe tener 11 dígitos'
    if (!nombre.trim()) return 'El nombre es obligatorio'
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) return 'El formato del email no es válido'
    }

    return null
  }

  const handleGuardarNuevoCliente = async () => {
    const error = validarNuevoCliente()
    if (error) {
      setErrorCliente(error)
      return
    }

    try {
      const res = await createCliente({
        tipo_documento: nuevoCliente.tipoDoc,
        numero_documento: nuevoCliente.numeroDoc,
        nombre: nuevoCliente.nombre,
        direccion: nuevoCliente.direccion,
        email: nuevoCliente.email
      })
      const nuevoClienteLocal = {
        id: res.id,
        tipoDoc: res.tipo_documento,
        numeroDoc: res.numero_documento,
        nombre: res.nombre,
        direccion: res.direccion,
        email: res.email
      }
      setClientes(prev => [...prev, nuevoClienteLocal])
      setClienteSeleccionado(res.id.toString())
      setShowNuevoClienteModal(false)
      setErrorCliente('')
      setNuevoCliente({ tipoDoc: 'dni', numeroDoc: '', nombre: '', direccion: '', email: '' })
    } catch (err) {
      setErrorCliente('Error al guardar cliente: ' + err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.items.length === 0) {
      alert('Debe agregar al menos un producto')
      return
    }

    if (tipoDocumento === 'factura' && !clienteSeleccionado) {
      alert('Para generar una factura es obligatorio seleccionar un cliente con DNI/RUC')
      return
    }

    const clienteData = conDNI ? clientes.find(c => c.id === parseInt(clienteSeleccionado)) : null

    try {
      const comprobanteApi = {
        cliente: clienteData ? clienteData.id : null,
        tipo_comprobante: tipoDocumento,
        serie: obtenerSerie(),
        correlativo: formData.correlativo,
        fecha_emision: new Date().toISOString(),
        moneda: formData.moneda,
        observaciones: formData.observaciones,
        items: formData.items.map(item => ({
          producto: item.productoId,
          cantidad: item.cantidad,
          descripcion: item.nombre,
          detalle_adicional: item.detalleAdicional || '',
          precio_unitario: item.precioUnitarioConIGV,
          valor_unitario: 0,
          importe: 0
        }))
      }

      const res = await createComprobante(comprobanteApi)

      // Pasar datos al componente de comprobante generado
      const comprobanteData = {
        id: res.id,
        tipoDocumento,
        serie: res.serie,
        correlativo: res.correlativo,
        fechaEmision: obtenerFechaActual(),
        moneda: res.moneda,
        cliente: clienteData,
        items: formData.items,
        subtotal: parseFloat(res.gravada),
        igv: parseFloat(res.igv),
        total: parseFloat(res.total),
        observaciones: res.observaciones
      }

      navigate('/comprobante-generado', { state: { comprobante: comprobanteData } })
    } catch (err) {
      alert('Error al generar comprobante: ' + err.message)
    }
  }

  const handleVistaPrevia = () => {
    setShowVistaPreviaModal(true)
  }

  const clienteActual = clientes.find(c => c.id === parseInt(clienteSeleccionado))

  return (
    <div className="nuevo-punto-venta">
      <div className="form-container">
        <div className="form-header">
          <h1>Nuevo Comprobante Electrónico</h1>
          <p>Complete los datos para generar su boleta o factura electrónica</p>
        </div>

        {/* Selector de tipo de documento */}
        <div className="tipo-documento-selector">
          <button
            type="button"
            className={`tipo-btn ${tipoDocumento === 'boleta' ? 'active' : ''}`}
            onClick={() => navigate('/nuevo-punto-venta/boleta')}
          >
            <span className="tipo-icon">📋</span>
            Boleta Electrónica
          </button>
          <button
            type="button"
            className={`tipo-btn ${tipoDocumento === 'factura' ? 'active' : ''}`}
            onClick={() => navigate('/nuevo-punto-venta/factura')}
          >
            <span className="tipo-icon">📄</span>
            Factura Electrónica
          </button>
        </div>

        <form onSubmit={handleSubmit} className="documento-form">
          {/* Sección: Datos del Cliente */}
          <section className="form-section">
            <h2 className="section-title">
              <span className="section-icon">👤</span>
              Datos del Cliente
            </h2>

            <div className="dni-checkbox-container">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={tipoDocumento === 'factura' ? true : conDNI}
                  onChange={handleConDNIChange}
                  disabled={tipoDocumento === 'factura'}
                />
                <span className="checkbox-custom"></span>
                Con DNI/RUC
              </label>
              <span className="dni-status">
                {tipoDocumento === 'factura'
                  ? '(Obligatorio para facturas)'
                  : conDNI
                    ? '(Se requiere seleccionar cliente)'
                    : '(Venta sin identificacion de cliente)'}
              </span>
            </div>

            <div className="cliente-selector-container">
              <div className="form-group cliente-dropdown">
                <label>Seleccionar Cliente {tipoDocumento === 'factura' && <span style={{color: '#dc2626'}}>*</span>}</label>
                <select
                  value={clienteSeleccionado}
                  onChange={handleClienteChange}
                  disabled={tipoDocumento === 'factura' ? false : !conDNI}
                  required={tipoDocumento === 'factura' || conDNI}
                >
                  <option value="">-- Seleccione un cliente --</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.numeroDoc} - {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {(tipoDocumento === 'factura' || conDNI) && (
                <button
                  type="button"
                  className="btn-nuevo-cliente"
                  onClick={() => setShowNuevoClienteModal(true)}
                >
                  + Nuevo Cliente
                </button>
              )}
            </div>

            {(tipoDocumento === 'factura' || conDNI) && clienteActual && (
              <div className="cliente-info">
                <div className="cliente-info-row">
                  <span className="label">Documento:</span>
                  <span>{clienteActual.tipoDoc.toUpperCase()}: {clienteActual.numeroDoc}</span>
                </div>
                <div className="cliente-info-row">
                  <span className="label">Nombre:</span>
                  <span>{clienteActual.nombre}</span>
                </div>
                <div className="cliente-info-row">
                  <span className="label">Dirección:</span>
                  <span>{clienteActual.direccion}</span>
                </div>
                <div className="cliente-info-row">
                  <span className="label">Email:</span>
                  <span>{clienteActual.email}</span>
                </div>
              </div>
            )}
          </section>

          {/* Sección: Datos del Documento */}
          <section className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📝</span>
              Datos del Documento
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Serie</label>
                <input
                  type="text"
                  value={obtenerSerie()}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Correlativo</label>
                <input
                  type="text"
                  name="correlativo"
                  value={formData.correlativo}
                  onChange={handleInputChange}
                  placeholder="00000001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha de Emisión</label>
                <input
                  type="date"
                  value={obtenerFechaActual()}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Moneda</label>
                <select
                  name="moneda"
                  value={formData.moneda}
                  onChange={handleInputChange}
                >
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Sección: Items/Productos */}
          <section className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📦</span>
              Productos
            </h2>

            <div className="form-group producto-selector">
              <label>Buscar Producto</label>
              <div className="busqueda-container">
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={handleBusquedaChange}
                  onFocus={() => setMostrarResultados(true)}
                  onBlur={() => setTimeout(() => setMostrarResultados(false), 200)}
                  placeholder="Buscar por código o nombre..."
                  className="busqueda-input"
                />
                {mostrarResultados && busquedaProducto.trim() && (
                  <div className="busqueda-resultados">
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map(producto => (
                        <div
                          key={producto.id}
                          className="busqueda-item"
                          onClick={() => handleProductoSelect(producto)}
                        >
                          <span className="busqueda-codigo">{producto.codigo}</span>
                          <span className="busqueda-nombre">{producto.nombre}</span>
                          <span className="busqueda-precio">S/ {parseFloat(producto.precio_venta).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="busqueda-sin-resultados">
                        No se encontraron productos
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {formData.items.length > 0 && (
              <div className="items-table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Detalle</th>
                      <th>Cant.</th>
                      <th>P.U. (con IGV)</th>
                      <th>Total</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nombre}</td>
                        <td>{item.detalleAdicional || '-'}</td>
                        <td className="center">{item.cantidad}</td>
                        <td className="right">
                          {formData.moneda === 'PEN' ? 'S/ ' : '$ '}
                          {item.precioUnitarioConIGV.toFixed(2)}
                        </td>
                        <td className="right total-cell">
                          {formData.moneda === 'PEN' ? 'S/ ' : '$ '}
                          {item.total.toFixed(2)}
                        </td>
                        <td className="center">
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeItem(item.id)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {formData.items.length === 0 && (
              <div className="no-items-message">
                <span>📦</span>
                <p>No hay productos agregados. Seleccione un producto del dropdown.</p>
              </div>
            )}
          </section>

          {/* Sección: Totales */}
          <section className="form-section totales-section">
            <div className="totales-container">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formData.moneda === 'PEN' ? 'S/ ' : '$ '}{formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>IGV (18%):</span>
                <span>{formData.moneda === 'PEN' ? 'S/ ' : '$ '}{formData.igv.toFixed(2)}</span>
              </div>
              <div className="total-row total-final">
                <span>TOTAL:</span>
                <span>{formData.moneda === 'PEN' ? 'S/ ' : '$ '}{formData.total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Observaciones */}
          <section className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📌</span>
              Observaciones
            </h2>
            <div className="form-group full-width">
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                placeholder="Observaciones adicionales..."
                rows="3"
              />
            </div>
          </section>

          {/* Botones de acción */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleVistaPrevia}>
              Vista Previa
            </button>
            <button type="submit" className="btn-primary">
              Generar {tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Producto */}
      {showProductoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Agregar Producto</h2>
              <button className="modal-close" onClick={handleEliminarItemModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="producto-nombre-modal">
                <span className="label">Producto:</span>
                <span className="value">{itemModal.nombre}</span>
              </div>

              <div className="form-group">
                <label>Detalle Adicional</label>
                <input
                  type="text"
                  value={itemModal.detalleAdicional}
                  onChange={(e) => handleItemModalChange('detalleAdicional', e.target.value)}
                  placeholder="Descripción adicional (opcional)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cantidad</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={itemModal.cantidad}
                    onChange={(e) => handleInputNumerico(e, 'cantidad')}
                  />
                </div>
                <div className="form-group">
                  <label>Precio Unitario (Con IGV)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={itemModal.precioUnitarioConIGV}
                    onChange={(e) => handleInputNumerico(e, 'precioUnitarioConIGV')}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subtotal (Valor Venta)</label>
                  <input
                    type="text"
                    value={`S/ ${itemModal.subtotal.toFixed(2)}`}
                    disabled
                    className="disabled-input"
                  />
                </div>
                <div className="form-group">
                  <label>IGV de la Línea (18%)</label>
                  <input
                    type="text"
                    value={`S/ ${itemModal.igvLinea.toFixed(2)}`}
                    disabled
                    className="disabled-input"
                  />
                </div>
              </div>

              <div className="total-linea">
                <span className="label">Total de la Línea:</span>
                <span className="value">S/ {itemModal.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-modal-delete" onClick={handleEliminarItemModal}>
                Eliminar
              </button>
              <button type="button" className="btn-modal-accept" onClick={handleAceptarItem}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nuevo Cliente */}
      {showNuevoClienteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nuevo Cliente</h2>
              <button className="modal-close" onClick={() => {
                setShowNuevoClienteModal(false)
                setErrorCliente('')
                setNuevoCliente({ tipoDoc: 'dni', numeroDoc: '', nombre: '', direccion: '', email: '' })
              }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Documento</label>
                  <select
                    name="tipoDoc"
                    value={nuevoCliente.tipoDoc}
                    onChange={handleNuevoClienteChange}
                  >
                    <option value="dni">DNI</option>
                    <option value="ruc">RUC</option>
                    <option value="ce">Carnet de Extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Número de Documento</label>
                  <input
                    type="text"
                    name="numeroDoc"
                    value={nuevoCliente.numeroDoc}
                    onChange={handleNuevoClienteChange}
                    placeholder={nuevoCliente.tipoDoc === 'dni' ? '12345678' : '20123456789'}
                    required
                  />
                </div>
              </div>

              {(nuevoCliente.tipoDoc === 'dni' || nuevoCliente.tipoDoc === 'ruc') && (
                <div className="doc-busqueda-action">
                  <button
                    type="button"
                    className="btn-buscar-doc"
                    onClick={handleBuscarDocumento}
                    disabled={buscandoDoc || !nuevoCliente.numeroDoc.trim()}
                  >
                    {buscandoDoc ? 'Buscando...' : `Buscar por ${nuevoCliente.tipoDoc.toUpperCase()}`}
                  </button>
                </div>
              )}

              <div className="form-group">
                <label>{nuevoCliente.tipoDoc === 'ruc' ? 'Razón Social' : 'Nombre Completo'}</label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoCliente.nombre}
                  onChange={handleNuevoClienteChange}
                  placeholder={nuevoCliente.tipoDoc === 'ruc' ? 'Empresa S.A.C.' : 'Juan Pérez García'}
                  required
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={nuevoCliente.direccion}
                  onChange={handleNuevoClienteChange}
                  placeholder="Av. Principal 123, Lima"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={nuevoCliente.email}
                  onChange={handleNuevoClienteChange}
                  placeholder="cliente@email.com"
                />
              </div>

              {errorCliente && (
                <div className="error-mensaje">
                  {errorCliente}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-modal-delete" onClick={() => {
                setShowNuevoClienteModal(false)
                setErrorCliente('')
                setNuevoCliente({ tipoDoc: 'dni', numeroDoc: '', nombre: '', direccion: '', email: '' })
              }}>
                Cancelar
              </button>
              <button type="button" className="btn-modal-accept" onClick={handleGuardarNuevoCliente}>
                Guardar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa */}
      {showVistaPreviaModal && datosEmisor && (
        <div className="modal-overlay">
          <div className="modal-content modal-vista-previa">
            <div className="modal-header">
              <h2>Vista Previa del Comprobante</h2>
              <button className="modal-close" onClick={() => setShowVistaPreviaModal(false)}>✕</button>
            </div>
            <div className="modal-body vista-previa-body">
              <div className="comprobante">
                <div className="comprobante-header">
                  <div className="empresa-info">
                    <h3 className="empresa-nombre">{datosEmisor.razonSocial}</h3>
                    <p className="empresa-direccion">{datosEmisor.direccion}</p>
                    <p className="empresa-telefono">Tel: {datosEmisor.telefono}</p>
                    <p className="empresa-encargado">Atendido por: {datosEmisor.encargado}</p>
                  </div>
                  <div className="documento-info">
                    <p className="ruc-label">RUC: {datosEmisor.ruc}</p>
                    <h4 className="documento-tipo">
                      {tipoDocumento === 'boleta' ? 'BOLETA DE VENTA' : 'FACTURA'} ELECTRÓNICA
                    </h4>
                    <p className="documento-numero">{obtenerSerie()}-{formData.correlativo}</p>
                  </div>
                </div>

                <div className="comprobante-info">
                  <div className="info-row">
                    <span className="info-label">Fecha de Emisión:</span>
                    <span className="info-value">{obtenerFechaFormateada()}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Moneda:</span>
                    <span className="info-value">{formData.moneda === 'PEN' ? 'Soles (S/)' : 'Dólares ($)'}</span>
                  </div>
                  {conDNI && clienteActual && (
                    <>
                      <div className="info-row">
                        <span className="info-label">Cliente:</span>
                        <span className="info-value">{clienteActual.nombre}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">{clienteActual.tipoDoc.toUpperCase()}:</span>
                        <span className="info-value">{clienteActual.numeroDoc}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="comprobante-items">
                  <table className="items-preview-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Cant.</th>
                        <th>P.Unit.</th>
                        <th>Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.length > 0 ? (
                        formData.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.codigo}</td>
                            <td>{item.nombre}{item.detalleAdicional ? ` - ${item.detalleAdicional}` : ''}</td>
                            <td className="center">{item.cantidad}</td>
                            <td className="right">{item.precioUnitarioConIGV.toFixed(2)}</td>
                            <td className="right">{item.total.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="center no-items">No hay productos agregados</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="comprobante-totales">
                  <div className="total-line">
                    <span>Op. Gravada:</span>
                    <span>{formData.moneda === 'PEN' ? 'S/' : '$'} {formData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-line">
                    <span>IGV (18%):</span>
                    <span>{formData.moneda === 'PEN' ? 'S/' : '$'} {formData.igv.toFixed(2)}</span>
                  </div>
                  <div className="total-line total-final-comprobante">
                    <span>TOTAL:</span>
                    <span>{formData.moneda === 'PEN' ? 'S/' : '$'} {formData.total.toFixed(2)}</span>
                  </div>
                </div>

                {formData.observaciones && (
                  <div className="comprobante-observaciones">
                    <p><strong>Observaciones:</strong> {formData.observaciones}</p>
                  </div>
                )}

                <div className="comprobante-footer">
                  <p>Representación impresa de la {tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'} Electrónica</p>
                  <p>Consulte su comprobante en www.sunat.gob.pe</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-modal-accept" onClick={() => setShowVistaPreviaModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NuevoPuntoVenta
