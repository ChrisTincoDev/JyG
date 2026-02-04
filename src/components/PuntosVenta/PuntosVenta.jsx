import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './PuntosVenta.css'
import dataJson from '../../data/data.json'

const datosEmisor = dataJson.emisor

function PuntosVenta() {
  const [comprobantes, setComprobantes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null)

  // Cargar comprobantes desde localStorage
  useEffect(() => {
    const comprobantesGuardados = JSON.parse(localStorage.getItem('comprobantes') || '[]')
    setComprobantes(comprobantesGuardados)
  }, [])

  // Formatear fecha de YYYY-MM-DD a DD/MM/YYYY
  const formatearFecha = (fecha) => {
    if (!fecha) return ''
    const [año, mes, dia] = fecha.split('-')
    return `${dia}/${mes}/${año}`
  }

  const [filtroTipo, setFiltroTipo] = useState('todos')

  const comprobantesFiltrados = filtroTipo === 'todos'
    ? comprobantes
    : comprobantes.filter(c => c.tipoDocumento === filtroTipo)

  const handleVerPDF = (comprobante) => {
    setComprobanteSeleccionado(comprobante)
    setShowModal(true)
  }

  const [comprobanteParaImprimir, setComprobanteParaImprimir] = useState(null)

  const handleImprimir = (comprobante) => {
    setComprobanteParaImprimir(comprobante)
    // Esperar a que el comprobante se renderice y luego imprimir
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const handleImprimirDesdeModal = () => {
    window.print()
  }

  return (
    <div className="puntos-venta-page">
      <div className="puntos-venta-container">
        <div className="page-header">
          <div className="header-content">
            <h1>Punto de Venta (POS)</h1>
            <p>Lista de comprobantes electronicos generados</p>
          </div>
          <Link to="/nuevo-punto-venta/boleta" className="btn-nuevo">
            + Agregar Nuevo
          </Link>
        </div>

        {/* Filtros */}
        <div className="filtros-container">
          <div className="filtro-group">
            <label>Tipo:</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="boleta">Boletas</option>
              <option value="factura">Facturas</option>
            </select>
          </div>
          <div className="filtro-group">
            <label>Desde:</label>
            <input type="date" defaultValue="2026-02-01" />
          </div>
          <div className="filtro-group">
            <label>Hasta:</label>
            <input type="date" defaultValue="2026-02-03" />
          </div>
        </div>

        {/* Tabla de comprobantes */}
        <div className="tabla-container">
          <table className="tabla-comprobantes">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>TIPO</th>
                <th>SERIE</th>
                <th>N°</th>
                <th>CLIENTE</th>
                <th>#</th>
                <th>TOTAL</th>
                <th>IGV</th>
                <th>IMPORTE</th>
                <th>PDF</th>
                <th>SUNAT</th>
                <th>XML</th>
                <th>CDR</th>
                <th>IMPRIMIR</th>
              </tr>
            </thead>
            <tbody>
              {comprobantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="14" className="center" style={{padding: '2rem', color: '#64748b'}}>
                    No hay comprobantes generados
                  </td>
                </tr>
              ) : (
                comprobantesFiltrados.map(comp => (
                  <tr key={comp.id}>
                    <td>{formatearFecha(comp.fechaEmision)}</td>
                    <td>
                      <span className={`tipo-badge ${comp.tipoDocumento}`}>
                        {comp.tipoDocumento === 'boleta' ? 'B' : 'F'}
                      </span>
                    </td>
                    <td>{comp.serie}</td>
                    <td>{comp.correlativo}</td>
                    <td className="cliente-cell">{comp.cliente?.nombre || 'CLIENTE VARIOS'}</td>
                    <td className="center">{comp.items?.length || 0}</td>
                    <td className="right">S/ {comp.total?.toFixed(2) || '0.00'}</td>
                    <td className="right">S/ {comp.igv?.toFixed(2) || '0.00'}</td>
                    <td className="right">S/ {comp.subtotal?.toFixed(2) || '0.00'}</td>
                    <td className="center">
                      <button
                        className="btn-icon btn-pdf"
                        title="Ver PDF"
                        onClick={() => handleVerPDF(comp)}
                      >
                        PDF
                      </button>
                    </td>
                    <td className="center">
                      <span className="icon-check" title="Aceptado por SUNAT">&#10004;</span>
                    </td>
                    <td className="center">
                      <button className="btn-icon btn-xml" title="Descargar XML">
                        XML
                      </button>
                    </td>
                    <td className="center">
                      <button className="btn-icon btn-cdr" title="Descargar CDR">
                        CDR
                      </button>
                    </td>
                    <td className="center">
                      <button
                        className="btn-icon btn-imprimir-tabla"
                        title="Imprimir"
                        onClick={() => handleImprimir(comp)}
                      >
                        🖨
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen */}
        <div className="resumen-container">
          <div className="resumen-item">
            <span className="resumen-label">Total Comprobantes:</span>
            <span className="resumen-value">{comprobantesFiltrados.length}</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Total Ventas:</span>
            <span className="resumen-value">
              S/ {comprobantesFiltrados.reduce((acc, c) => acc + (c.total || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Comprobante oculto para imprimir */}
      {comprobanteParaImprimir && (
        <div className="comprobante-para-imprimir">
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
                  {comprobanteParaImprimir.tipoDocumento === 'boleta' ? 'BOLETA DE VENTA' : 'FACTURA'} ELECTRONICA
                </h4>
                <p className="documento-numero">{comprobanteParaImprimir.serie}-{comprobanteParaImprimir.correlativo}</p>
              </div>
            </div>

            {/* Info documento */}
            <div className="comprobante-info">
              <div className="info-row">
                <span className="info-label">Fecha de Emision:</span>
                <span className="info-value">{formatearFecha(comprobanteParaImprimir.fechaEmision)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Moneda:</span>
                <span className="info-value">{comprobanteParaImprimir.moneda === 'PEN' ? 'Soles (S/)' : 'Dolares ($)'}</span>
              </div>
              {comprobanteParaImprimir.cliente && (
                <>
                  <div className="info-row">
                    <span className="info-label">Cliente:</span>
                    <span className="info-value">{comprobanteParaImprimir.cliente.nombre}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{comprobanteParaImprimir.cliente.tipoDoc?.toUpperCase() || 'DOC'}:</span>
                    <span className="info-value">{comprobanteParaImprimir.cliente.numeroDoc}</span>
                  </div>
                </>
              )}
            </div>

            {/* Tabla de productos */}
            <div className="comprobante-items">
              <table className="items-preview-table">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Descripcion</th>
                    <th>Cant.</th>
                    <th>P.Unit.</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobanteParaImprimir.items && comprobanteParaImprimir.items.length > 0 ? (
                    comprobanteParaImprimir.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.codigo}</td>
                        <td>{item.nombre}{item.detalleAdicional ? ` - ${item.detalleAdicional}` : ''}</td>
                        <td className="center">{item.cantidad}</td>
                        <td className="right">{item.precioUnitarioConIGV?.toFixed(2)}</td>
                        <td className="right">{item.total?.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="center no-items">No hay productos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totales del comprobante */}
            <div className="comprobante-totales">
              <div className="total-line">
                <span>Op. Gravada:</span>
                <span>S/ {comprobanteParaImprimir.subtotal?.toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>IGV (18%):</span>
                <span>S/ {comprobanteParaImprimir.igv?.toFixed(2)}</span>
              </div>
              <div className="total-line total-final-comprobante">
                <span>TOTAL:</span>
                <span>S/ {comprobanteParaImprimir.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Observaciones */}
            {comprobanteParaImprimir.observaciones && (
              <div className="comprobante-observaciones">
                <p><strong>Observaciones:</strong> {comprobanteParaImprimir.observaciones}</p>
              </div>
            )}

            {/* Pie del comprobante */}
            <div className="comprobante-footer">
              <p>Representacion impresa de la {comprobanteParaImprimir.tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'} Electronica</p>
              <p>Consulte su comprobante en www.sunat.gob.pe</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa */}
      {showModal && comprobanteSeleccionado && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-vista-previa" onClick={e => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h2>Vista Previa del Comprobante</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
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
                      {comprobanteSeleccionado.tipoDocumento === 'boleta' ? 'BOLETA DE VENTA' : 'FACTURA'} ELECTRONICA
                    </h4>
                    <p className="documento-numero">{comprobanteSeleccionado.serie}-{comprobanteSeleccionado.correlativo}</p>
                  </div>
                </div>

                {/* Info documento */}
                <div className="comprobante-info">
                  <div className="info-row">
                    <span className="info-label">Fecha de Emision:</span>
                    <span className="info-value">{formatearFecha(comprobanteSeleccionado.fechaEmision)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Moneda:</span>
                    <span className="info-value">{comprobanteSeleccionado.moneda === 'PEN' ? 'Soles (S/)' : 'Dolares ($)'}</span>
                  </div>
                  {comprobanteSeleccionado.cliente && (
                    <>
                      <div className="info-row">
                        <span className="info-label">Cliente:</span>
                        <span className="info-value">{comprobanteSeleccionado.cliente.nombre}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">{comprobanteSeleccionado.cliente.tipoDoc?.toUpperCase() || 'DOC'}:</span>
                        <span className="info-value">{comprobanteSeleccionado.cliente.numeroDoc}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Tabla de productos */}
                <div className="comprobante-items">
                  <table className="items-preview-table">
                    <thead>
                      <tr>
                        <th>Codigo</th>
                        <th>Descripcion</th>
                        <th>Cant.</th>
                        <th>P.Unit.</th>
                        <th>Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comprobanteSeleccionado.items && comprobanteSeleccionado.items.length > 0 ? (
                        comprobanteSeleccionado.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.codigo}</td>
                            <td>{item.nombre}{item.detalleAdicional ? ` - ${item.detalleAdicional}` : ''}</td>
                            <td className="center">{item.cantidad}</td>
                            <td className="right">{item.precioUnitarioConIGV?.toFixed(2)}</td>
                            <td className="right">{item.total?.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="center no-items">No hay productos</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totales del comprobante */}
                <div className="comprobante-totales">
                  <div className="total-line">
                    <span>Op. Gravada:</span>
                    <span>S/ {comprobanteSeleccionado.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="total-line">
                    <span>IGV (18%):</span>
                    <span>S/ {comprobanteSeleccionado.igv?.toFixed(2)}</span>
                  </div>
                  <div className="total-line total-final-comprobante">
                    <span>TOTAL:</span>
                    <span>S/ {comprobanteSeleccionado.total?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Observaciones */}
                {comprobanteSeleccionado.observaciones && (
                  <div className="comprobante-observaciones">
                    <p><strong>Observaciones:</strong> {comprobanteSeleccionado.observaciones}</p>
                  </div>
                )}

                {/* Pie del comprobante */}
                <div className="comprobante-footer">
                  <p>Representacion impresa de la {comprobanteSeleccionado.tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'} Electronica</p>
                  <p>Consulte su comprobante en www.sunat.gob.pe</p>
                </div>
              </div>
            </div>
            <div className="modal-footer no-print">
              <button type="button" className="btn-modal-secondary" onClick={() => setShowModal(false)}>
                Cerrar
              </button>
              <button type="button" className="btn-modal-accept" onClick={handleImprimirDesdeModal}>
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PuntosVenta
