import { useState } from 'react'
import './NuevoPuntoVenta.css'

function NuevoPuntoVenta() {
  const [tipoDocumento, setTipoDocumento] = useState('boleta')
  const [formData, setFormData] = useState({
    // Datos del emisor
    rucEmisor: '',
    razonSocialEmisor: '',
    direccionEmisor: '',
    
    // Datos del cliente
    tipoDocCliente: 'dni',
    numeroDocCliente: '',
    nombreCliente: '',
    direccionCliente: '',
    emailCliente: '',
    
    // Datos del documento
    serie: '',
    correlativo: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    moneda: 'PEN',
    
    // Items
    items: [{ descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }],
    
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

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    
    // Calcular subtotal del item
    if (field === 'cantidad' || field === 'precioUnitario') {
      const cantidad = field === 'cantidad' ? parseFloat(value) || 0 : parseFloat(newItems[index].cantidad) || 0
      const precio = field === 'precioUnitario' ? parseFloat(value) || 0 : parseFloat(newItems[index].precioUnitario) || 0
      newItems[index].subtotal = cantidad * precio
    }
    
    // Calcular totales
    const subtotal = newItems.reduce((acc, item) => acc + (item.subtotal || 0), 0)
    const igv = subtotal * 0.18
    const total = subtotal + igv
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      subtotal: subtotal.toFixed(2),
      igv: igv.toFixed(2),
      total: total.toFixed(2)
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }]
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      const subtotal = newItems.reduce((acc, item) => acc + (item.subtotal || 0), 0)
      const igv = subtotal * 0.18
      const total = subtotal + igv
      
      setFormData(prev => ({
        ...prev,
        items: newItems,
        subtotal: subtotal.toFixed(2),
        igv: igv.toFixed(2),
        total: total.toFixed(2)
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Documento a generar:', { tipoDocumento, ...formData })
    alert(`${tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'} electrónica generada exitosamente!`)
  }

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
          {/* Sección: Datos del Emisor */}
          <section className="form-section">
            <h2 className="section-title">
              <span className="section-icon">🏢</span>
              Datos del Emisor
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label>RUC del Emisor</label>
                <input 
                  type="text" 
                  name="rucEmisor" 
                  value={formData.rucEmisor}
                  onChange={handleInputChange}
                  placeholder="20123456789"
                  maxLength="11"
                  required
                />
              </div>
              <div className="form-group">
                <label>Razón Social</label>
                <input 
                  type="text" 
                  name="razonSocialEmisor" 
                  value={formData.razonSocialEmisor}
                  onChange={handleInputChange}
                  placeholder="JyG Empresa S.A.C."
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Dirección</label>
                <input 
                  type="text" 
                  name="direccionEmisor" 
                  value={formData.direccionEmisor}
                  onChange={handleInputChange}
                  placeholder="Av. Principal 123, Lima"
                  required
                />
              </div>
            </div>
          </section>

          {/* Sección: Datos del Cliente */}
          <section className="form-section">
            <h2 className="section-title">
              <span className="section-icon">👤</span>
              Datos del Cliente
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Tipo de Documento</label>
                <select 
                  name="tipoDocCliente" 
                  value={formData.tipoDocCliente}
                  onChange={handleInputChange}
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
                  name="numeroDocCliente" 
                  value={formData.numeroDocCliente}
                  onChange={handleInputChange}
                  placeholder={formData.tipoDocCliente === 'dni' ? '12345678' : '20123456789'}
                  required
                />
              </div>
              <div className="form-group">
                <label>{tipoDocumento === 'factura' ? 'Razón Social' : 'Nombre Completo'}</label>
                <input 
                  type="text" 
                  name="nombreCliente" 
                  value={formData.nombreCliente}
                  onChange={handleInputChange}
                  placeholder={tipoDocumento === 'factura' ? 'Empresa Cliente S.A.C.' : 'Juan Pérez García'}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="emailCliente" 
                  value={formData.emailCliente}
                  onChange={handleInputChange}
                  placeholder="cliente@email.com"
                />
              </div>
              <div className="form-group full-width">
                <label>Dirección del Cliente</label>
                <input 
                  type="text" 
                  name="direccionCliente" 
                  value={formData.direccionCliente}
                  onChange={handleInputChange}
                  placeholder="Dirección del cliente"
                />
              </div>
            </div>
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
                  name="serie" 
                  value={formData.serie}
                  onChange={handleInputChange}
                  placeholder={tipoDocumento === 'boleta' ? 'B001' : 'F001'}
                  maxLength="4"
                  required
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
                  name="fechaEmision" 
                  value={formData.fechaEmision}
                  onChange={handleInputChange}
                  required
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
            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input 
                          type="text"
                          value={item.descripcion}
                          onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                          placeholder="Descripción del producto"
                          required
                        />
                      </td>
                      <td>
                        <input 
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                          min="1"
                          required
                        />
                      </td>
                      <td>
                        <input 
                          type="number"
                          value={item.precioUnitario}
                          onChange={(e) => handleItemChange(index, 'precioUnitario', e.target.value)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="subtotal-cell">
                        {formData.moneda === 'PEN' ? 'S/ ' : '$ '}
                        {item.subtotal.toFixed(2)}
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="btn-add-item" onClick={addItem}>
                + Agregar Item
              </button>
            </div>
          </section>

          {/* Sección: Totales */}
          <section className="form-section totales-section">
            <div className="totales-container">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formData.moneda === 'PEN' ? 'S/ ' : '$ '}{formData.subtotal}</span>
              </div>
              <div className="total-row">
                <span>IGV (18%):</span>
                <span>{formData.moneda === 'PEN' ? 'S/ ' : '$ '}{formData.igv}</span>
              </div>
              <div className="total-row total-final">
                <span>TOTAL:</span>
                <span>{formData.moneda === 'PEN' ? 'S/ ' : '$ '}{formData.total}</span>
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
            <button type="button" className="btn-secondary">
              Vista Previa
            </button>
            <button type="submit" className="btn-primary">
              Generar {tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NuevoPuntoVenta
