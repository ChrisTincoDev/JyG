import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './PuntosVenta.css'
import { getComprobantes, getComprobante, getEmpresa } from '../../api'

function PuntosVenta() {
  const [comprobantes, setComprobantes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null)
  const [datosEmisor, setDatosEmisor] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [comprobanteParaImprimir, setComprobanteParaImprimir] = useState(null)

  const cargarComprobantes = async () => {
    try {
      let params = ''
      const partes = []
      if (filtroTipo !== 'todos') partes.push(`tipo=${filtroTipo}`)
      if (filtroDesde) partes.push(`desde=${filtroDesde}`)
      if (filtroHasta) partes.push(`hasta=${filtroHasta}`)
      params = partes.join('&')
      const data = await getComprobantes(params)
      setComprobantes(data.results.map(c => ({
        id: c.id,
        tipoDocumento: c.tipo_comprobante,
        serie: c.serie,
        correlativo: c.correlativo,
        fechaEmision: c.fecha_emision?.split('T')[0] || '',
        moneda: c.moneda,
        cliente: c.cliente_nombre ? { nombre: c.cliente_nombre } : null,
        itemsCount: c.items_count,
        subtotal: parseFloat(c.gravada),
        igv: parseFloat(c.igv),
        total: parseFloat(c.total),
        sunatEnviada: c.sunat_enviada,
        sunatAceptada: c.sunat_aceptada,
      })))
    } catch (err) {
      console.error('Error cargando comprobantes:', err)
    }
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const empRes = await getEmpresa()
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
      } catch (err) {
        console.error('Error cargando emisor:', err)
      }
    }
    cargarDatos()
  }, [])

  useEffect(() => {
    cargarComprobantes()
  }, [filtroTipo, filtroDesde, filtroHasta])

  const formatearFecha = (fecha) => {
    if (!fecha) return ''
    const [año, mes, dia] = fecha.split('-')
    return `${dia}/${mes}/${año}`
  }

  const cargarDetalleComprobante = async (id) => {
    try {
      const data = await getComprobante(id)
      return {
        id: data.id,
        tipoDocumento: data.tipo_comprobante,
        serie: data.serie,
        correlativo: data.correlativo,
        fechaEmision: data.fecha_emision?.split('T')[0] || '',
        moneda: data.moneda,
        cliente: data.cliente_detalle ? {
          nombre: data.cliente_detalle.nombre,
          numero_documento: data.cliente_detalle.numero_documento,
          tipo_documento: data.cliente_detalle.tipo_documento,
        } : null,
        items: (data.items || []).map(item => ({
          id: item.id,
          descripcion: item.descripcion || item.producto_nombre,
          codigo: item.producto_codigo,
          cantidad: parseFloat(item.cantidad),
          unidad: item.unidad,
          precioUnitario: parseFloat(item.precio_unitario),
          importe: parseFloat(item.importe),
        })),
        subtotal: parseFloat(data.gravada),
        igv: parseFloat(data.igv),
        total: parseFloat(data.total),
        observaciones: data.observaciones,
        sunatEnviada: data.sunat_enviada,
        sunatAceptada: data.sunat_aceptada,
      }
    } catch (err) {
      console.error('Error cargando detalle comprobante:', err)
      return null
    }
  }

  const handleVerPDF = async (comprobante) => {
    const detalle = await cargarDetalleComprobante(comprobante.id)
    if (detalle) {
      setComprobanteSeleccionado(detalle)
      setShowModal(true)
    }
  }

  const handleImprimir = async (comprobante) => {
    const detalle = await cargarDetalleComprobante(comprobante.id)
    if (detalle) {
      setComprobanteParaImprimir(detalle)
      setTimeout(() => {
        window.print()
      }, 100)
    }
  }

  const handleImprimirDesdeModal = () => {
    setComprobanteParaImprimir(comprobanteSeleccionado)
    setTimeout(() => {
      setShowModal(false)
      setTimeout(() => {
        window.print()
      }, 100)
    }, 50)
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
            <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} />
          </div>
          <div className="filtro-group">
            <label>Hasta:</label>
            <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} />
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
              {comprobantes.length === 0 ? (
                <tr>
                  <td colSpan="14" className="center" style={{padding: '2rem', color: '#64748b'}}>
                    No hay comprobantes generados
                  </td>
                </tr>
              ) : (
                comprobantes.map(comp => (
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
                    <td className="center">{comp.itemsCount || 0}</td>
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
            <span className="resumen-value">{comprobantes.length}</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Total Ventas:</span>
            <span className="resumen-value">
              S/ {comprobantes.reduce((acc, c) => acc + (c.total || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Comprobante oculto para imprimir */}
      {comprobanteParaImprimir && datosEmisor && (
        <div className="comprobante-para-imprimir">
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
                  {comprobanteParaImprimir.tipoDocumento === 'boleta' ? 'BOLETA DE VENTA' : 'FACTURA'} ELECTRONICA
                </h4>
                <p className="documento-numero">{comprobanteParaImprimir.serie}-{comprobanteParaImprimir.correlativo}</p>
              </div>
            </div>

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
                <div className="info-row">
                  <span className="info-label">Cliente:</span>
                  <span className="info-value">{comprobanteParaImprimir.cliente.nombre}</span>
                </div>
              )}
            </div>

            <div className="comprobante-items">
              <table className="items-preview-table">
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Ud.</th>
                    <th>Descripcion</th>
                    <th>P. Unit.</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobanteParaImprimir.items && comprobanteParaImprimir.items.length > 0 ? (
                    comprobanteParaImprimir.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="center">{item.cantidad}</td>
                        <td className="center">{item.unidad}</td>
                        <td>{item.descripcion}</td>
                        <td className="right">S/ {item.precioUnitario?.toFixed(2)}</td>
                        <td className="right">S/ {item.importe?.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-items">Sin items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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

            {comprobanteParaImprimir.observaciones && (
              <div className="comprobante-observaciones">
                <p><strong>Obs:</strong> {comprobanteParaImprimir.observaciones}</p>
              </div>
            )}

            <div className="comprobante-footer">
              <p>Representacion impresa de la {comprobanteParaImprimir.tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'} Electronica</p>
              <p>Consulte su comprobante en www.sunat.gob.pe</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa */}
      {showModal && comprobanteSeleccionado && datosEmisor && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-vista-previa" onClick={e => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h2>Vista Previa del Comprobante</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
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
                      {comprobanteSeleccionado.tipoDocumento === 'boleta' ? 'BOLETA DE VENTA' : 'FACTURA'} ELECTRONICA
                    </h4>
                    <p className="documento-numero">{comprobanteSeleccionado.serie}-{comprobanteSeleccionado.correlativo}</p>
                  </div>
                </div>

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
                    <div className="info-row">
                      <span className="info-label">Cliente:</span>
                      <span className="info-value">{comprobanteSeleccionado.cliente.nombre}</span>
                    </div>
                  )}
                </div>

                <div className="comprobante-items">
                  <table className="items-preview-table">
                    <thead>
                      <tr>
                        <th>Cant.</th>
                        <th>Ud.</th>
                        <th>Descripcion</th>
                        <th>P. Unit.</th>
                        <th>Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comprobanteSeleccionado.items && comprobanteSeleccionado.items.length > 0 ? (
                        comprobanteSeleccionado.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="center">{item.cantidad}</td>
                            <td className="center">{item.unidad}</td>
                            <td>{item.descripcion}</td>
                            <td className="right">S/ {item.precioUnitario?.toFixed(2)}</td>
                            <td className="right">S/ {item.importe?.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="no-items">Sin items</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

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

                {comprobanteSeleccionado.observaciones && (
                  <div className="comprobante-observaciones">
                    <p><strong>Obs:</strong> {comprobanteSeleccionado.observaciones}</p>
                  </div>
                )}

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
