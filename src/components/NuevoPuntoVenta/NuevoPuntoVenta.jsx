import { useState } from 'react'
import './NuevoPuntoVenta.css'
import dataJson from '../../data/data.json'

// Datos del emisor (desde JSON)
const datosEmisor = dataJson.emisor

// Productos (desde JSON)
const productosAbarrotes = dataJson.productos.map(p => ({
  id: p.id,
  codigo: p.codigo,
  nombre: p.nombre,
  precioBase: p.precioCosto,
  categoria: p.categoria
}))

function NuevoPuntoVenta() {
  const [tipoDocumento, setTipoDocumento] = useState('boleta')
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

  // Datos de clientes desde JSON
  const [clientes, setClientes] = useState(dataJson.clientes)

  // Obtener fecha actual formateada
  const obtenerFechaActual = () => {
    const hoy = new Date()
    return hoy.toISOString().split('T')[0]
  }

  const obtenerFechaFormateada = () => {
    const hoy = new Date()
    return hoy.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  // Serie automática según tipo de documento
  const obtenerSerie = () => {
    return tipoDocumento === 'boleta' ? 'B001' : 'F001'
  }

  const [formData, setFormData] = useState({
    // Datos del documento
    correlativo: '00000001',
    moneda: 'PEN',
    
    // Items
    items: [],
    
    // Totales
    subtotal: 0,
    igv: 0,
    total: 0,
    
    // Observaciones
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

  const handleProductoSelect = (e) => {
    const productoId = e.target.value
    if (!productoId) return

    const producto = productosAbarrotes.find(p => p.id === parseInt(productoId))
    if (producto) {
      const precioConIGV = producto.precioBase * 1.18
      const subtotal = producto.precioBase
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
    }
    // Reset select
    e.target.value = ''
  }

  const handleItemModalChange = (field, value) => {
    setItemModal(prev => {
      const newItem = { ...prev }
      
      if (field === 'precioUnitarioConIGV') {
        const precioConIGV = parseFloat(value) || 0
        // Precio con IGV = Subtotal + IGV = X + 0.18X = 1.18X
        // Por lo tanto: X (subtotal) = Precio con IGV / 1.18
        const subtotal = precioConIGV / 1.18
        const igvLinea = subtotal * 0.18
        
        newItem.precioUnitarioConIGV = precioConIGV
        newItem.subtotal = parseFloat(subtotal.toFixed(2))
        newItem.igvLinea = parseFloat(igvLinea.toFixed(2))
        newItem.total = parseFloat((newItem.cantidad * precioConIGV).toFixed(2))
      } else if (field === 'cantidad') {
        const cantidad = parseFloat(value) || 1
        newItem.cantidad = cantidad
        newItem.total = parseFloat((cantidad * newItem.precioUnitarioConIGV).toFixed(2))
      } else {
        newItem[field] = value
      }
      
      return newItem
    })
  }

  const handleAceptarItem = () => {
    const newItem = {
      ...itemModal,
      id: Date.now() // ID único para el item
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
    const subtotal = items.reduce((acc, item) => acc + (item.subtotal * item.cantidad), 0)
    const igv = items.reduce((acc, item) => acc + (item.igvLinea * item.cantidad), 0)
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

  // Funciones para el modal de nuevo cliente
  const handleNuevoClienteChange = (e) => {
    const { name, value } = e.target
    setNuevoCliente(prev => ({ ...prev, [name]: value }))
    setErrorCliente('') // Limpiar error al escribir
  }

  const validarNuevoCliente = () => {
    const { numeroDoc, nombre, direccion, email, tipoDoc } = nuevoCliente
    
    if (!numeroDoc.trim()) {
      return 'El número de documento es obligatorio'
    }
    
    // Validar longitud del documento
    if (tipoDoc === 'dni' && numeroDoc.length !== 8) {
      return 'El DNI debe tener 8 dígitos'
    }
    if (tipoDoc === 'ruc' && numeroDoc.length !== 11) {
      return 'El RUC debe tener 11 dígitos'
    }
    
    if (!nombre.trim()) {
      return 'El nombre es obligatorio'
    }
    
    if (!direccion.trim()) {
      return 'La dirección es obligatoria'
    }
    
    if (!email.trim()) {
      return 'El email es obligatorio'
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'El formato del email no es válido'
    }
    
    return null // Sin errores
  }

  const handleGuardarNuevoCliente = () => {
    const error = validarNuevoCliente()
    if (error) {
      setErrorCliente(error)
      return
    }

    const nuevoClienteData = {
      id: Date.now(),
      ...nuevoCliente
    }
    setClientes(prev => [...prev, nuevoClienteData])
    setClienteSeleccionado(nuevoClienteData.id.toString())
    setShowNuevoClienteModal(false)
    setErrorCliente('')
    setNuevoCliente({
      tipoDoc: 'dni',
      numeroDoc: '',
      nombre: '',
      direccion: '',
      email: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const clienteData = conDNI ? clientes.find(c => c.id === parseInt(clienteSeleccionado)) : null
    console.log('Documento a generar:', { 
      tipoDocumento, 
      conDNI, 
      cliente: clienteData, 
      serie: obtenerSerie(),
      fechaEmision: obtenerFechaActual(),
      ...formData 
    })
    alert(`${tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'} electrónica generada exitosamente!`)
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
            onClick={() => setTipoDocumento('boleta')}
          >
            <span className="tipo-icon">📋</span>
            Boleta Electrónica
          </button>
          <button 
            type="button"
            className={`tipo-btn ${tipoDocumento === 'factura' ? 'active' : ''}`}
            onClick={() => setTipoDocumento('factura')}
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
            
            {/* Checkbox Con DNI / Sin DNI */}
            <div className="dni-checkbox-container">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={conDNI} 
                  onChange={handleConDNIChange}
                />
                <span className="checkbox-custom"></span>
                Con DNI
              </label>
              <span className="dni-status">
                {conDNI ? '(Se requiere seleccionar cliente)' : '(Venta sin identificación de cliente)'}
              </span>
            </div>

            {/* Dropdown de clientes */}
            <div className="cliente-selector-container">
              <div className="form-group cliente-dropdown">
                <label>Seleccionar Cliente</label>
                <select 
                  value={clienteSeleccionado}
                  onChange={handleClienteChange}
                  disabled={!conDNI}
                  required={conDNI}
                >
                  <option value="">-- Seleccione un cliente --</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.numeroDoc} - {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {conDNI && (
                <button 
                  type="button" 
                  className="btn-nuevo-cliente"
                  onClick={() => setShowNuevoClienteModal(true)}
                >
                  + Nuevo Cliente
                </button>
              )}
            </div>

            {/* Mostrar datos del cliente seleccionado */}
            {conDNI && clienteActual && (
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
              Productos / Servicios
            </h2>
            
            {/* Dropdown para seleccionar producto */}
            <div className="form-group producto-selector">
              <label>Agregar Producto</label>
              <select onChange={handleProductoSelect} defaultValue="">
                <option value="">-- Seleccione un producto --</option>
                {productosAbarrotes.map(producto => (
                  <option key={producto.id} value={producto.id}>
                    {producto.codigo} - {producto.nombre} (S/ {producto.precioBase.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Tabla de items agregados */}
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
        <div className="modal-overlay" onClick={handleEliminarItemModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                    type="number"
                    value={itemModal.cantidad}
                    onChange={(e) => handleItemModalChange('cantidad', e.target.value)}
                    min="1"
                    step="1"
                  />
                </div>
                <div className="form-group">
                  <label>Precio Unitario (Con IGV)</label>
                  <input 
                    type="number"
                    value={itemModal.precioUnitarioConIGV}
                    onChange={(e) => handleItemModalChange('precioUnitarioConIGV', e.target.value)}
                    min="0"
                    step="0.01"
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
        <div className="modal-overlay" onClick={() => setShowNuevoClienteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Cliente</h2>
              <button className="modal-close" onClick={() => setShowNuevoClienteModal(false)}>✕</button>
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

              {/* Mensaje de error */}
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
      {showVistaPreviaModal && (
        <div className="modal-overlay" onClick={() => setShowVistaPreviaModal(false)}>
          <div className="modal-content modal-vista-previa" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Vista Previa del Comprobante</h2>
              <button className="modal-close" onClick={() => setShowVistaPreviaModal(false)}>✕</button>
            </div>
            <div className="modal-body vista-previa-body">
              {/* Comprobante */}
              <div className="comprobante">
                {/* Encabezado del comprobante */}
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

                {/* Info documento */}
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

                {/* Tabla de productos */}
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

                {/* Totales del comprobante */}
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

                {/* Observaciones */}
                {formData.observaciones && (
                  <div className="comprobante-observaciones">
                    <p><strong>Observaciones:</strong> {formData.observaciones}</p>
                  </div>
                )}

                {/* Pie del comprobante */}
                <div className="comprobante-footer">
                  <p>Representación impresa de la {tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'} Electrónica</p>
                  <p>Consulte su comprobante en www.sunat.gob.pe</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-modal-delete" onClick={() => setShowVistaPreviaModal(false)}>
                Cerrar
              </button>
              <button type="button" className="btn-modal-accept" onClick={() => {
                setShowVistaPreviaModal(false)
                document.querySelector('form').requestSubmit()
              }}>
                Generar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NuevoPuntoVenta
