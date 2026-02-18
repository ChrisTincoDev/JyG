import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './ComprobanteGenerado.css'
import { getEmpresa } from '../../api'

function ComprobanteGenerado() {
  const location = useLocation()
  const navigate = useNavigate()
  const comprobante = location.state?.comprobante
  const [datosEmisor, setDatosEmisor] = useState(null)

  useEffect(() => {
    const cargar = async () => {
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
    cargar()
  }, [])

  // Si no hay datos del comprobante, redirigir
  if (!comprobante) {
    return (
      <div className="comprobante-generado">
        <div className="comprobante-container">
          <div className="error-message">
            <h2>No se encontro el comprobante</h2>
            <button onClick={() => navigate('/nuevo-punto-venta/boleta')} className="btn-primary">
              Generar nuevo comprobante
            </button>
          </div>
        </div>
      </div>
    )
  }

  const {
    tipoDocumento,
    serie,
    correlativo,
    total,
    subtotal,
    igv,
    moneda,
    fechaEmision,
    cliente,
    items,
    observaciones
  } = comprobante

  const numeroCompleto = `${serie}-${correlativo}`
  const simboloMoneda = moneda === 'PEN' ? 'S/' : '$'

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    if (!fecha) return ''
    const [año, mes, dia] = fecha.split('-')
    return `${dia}/${mes}/${año}`
  }

  const handleGenerarOtro = (tipo) => {
    navigate(`/nuevo-punto-venta/${tipo}`)
  }

  const handleVerComprobantes = () => {
    navigate('/puntos-venta')
  }

  const handleImprimir = () => {
    window.print()
  }

  return (
    <div className="comprobante-generado">
      <div className="comprobante-container">
        {/* Encabezado con tipo de documento */}
        <div className="comprobante-header-generado">
          <h1>{tipoDocumento === 'boleta' ? 'BOLETA' : 'FACTURA'} ELECTRONICA</h1>
          <p className="numero-documento">{numeroCompleto}</p>
          <p className="total-documento">TOTAL: {simboloMoneda}{total.toFixed(2)}</p>
        </div>

        {/* Botones de acción principales */}
        <div className="acciones-principales">
          <button className="btn-accion btn-imprimir" onClick={handleImprimir}>
            Imprimir
          </button>
          <button className="btn-accion btn-pdf">
            Ver PDF
          </button>
          <button className="btn-accion btn-xml">
            Descargar XML
          </button>
          <button className="btn-accion btn-cdr">
            Descargar CDR
          </button>
        </div>

        {/* Opciones adicionales */}
        <div className="opciones-adicionales">
          <button className="btn-opcion">
            Enviar por WhatsApp
          </button>
          <button className="btn-opcion">
            Enviar a un email personalizado
          </button>
          <button className="btn-opcion" onClick={() => handleGenerarOtro('factura')}>
            Generar otra FACTURA
          </button>
          <button className="btn-opcion" onClick={() => handleGenerarOtro('boleta')}>
            Generar otra BOLETA DE VENTA
          </button>
          <button className="btn-opcion" onClick={handleVerComprobantes}>
            Ver comprobantes
          </button>
        </div>

        {/* Botón anular */}
        <div className="seccion-anular">
          <button className="btn-anular">
            ANULAR o comunicar de baja
          </button>
        </div>

        {/* Estado SUNAT */}
        <div className="estado-sunat">
          <div className="estado-row">
            <span className="estado-label">Enviada a la Sunat?:</span>
            <span className="estado-icon check">&#10004;</span>
          </div>
          <div className="estado-row">
            <span className="estado-label">Aceptada por la Sunat?:</span>
            <span className="estado-icon check">&#10004;</span>
          </div>
          <div className="estado-row">
            <span className="estado-label">Codigo:</span>
            <span className="estado-value">0</span>
          </div>
          <div className="estado-row descripcion">
            <span className="estado-label">Descripcion:</span>
            <span className="estado-value">
              La {tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'} numero {numeroCompleto}, ha sido aceptada
            </span>
          </div>
          <div className="estado-row">
            <span className="estado-label">Otros:</span>
            <span className="estado-value"></span>
          </div>
        </div>

      </div>

      {/* Comprobante oculto para imprimir */}
      {datosEmisor && <div className="comprobante-para-imprimir">
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
                {tipoDocumento === 'boleta' ? 'BOLETA DE VENTA' : 'FACTURA'} ELECTRONICA
              </h4>
              <p className="documento-numero">{numeroCompleto}</p>
            </div>
          </div>

          {/* Info documento */}
          <div className="comprobante-info">
            <div className="info-row">
              <span className="info-label">Fecha de Emision:</span>
              <span className="info-value">{formatearFecha(fechaEmision)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Moneda:</span>
              <span className="info-value">{moneda === 'PEN' ? 'Soles (S/)' : 'Dolares ($)'}</span>
            </div>
            {cliente && (
              <>
                <div className="info-row">
                  <span className="info-label">Cliente:</span>
                  <span className="info-value">{cliente.nombre}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{cliente.tipoDoc?.toUpperCase() || 'DOC'}:</span>
                  <span className="info-value">{cliente.numeroDoc}</span>
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
                {items && items.length > 0 ? (
                  items.map((item) => (
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
              <span>{simboloMoneda} {subtotal?.toFixed(2)}</span>
            </div>
            <div className="total-line">
              <span>IGV (18%):</span>
              <span>{simboloMoneda} {igv?.toFixed(2)}</span>
            </div>
            <div className="total-line total-final-comprobante">
              <span>TOTAL:</span>
              <span>{simboloMoneda} {total?.toFixed(2)}</span>
            </div>
          </div>

          {/* Observaciones */}
          {observaciones && (
            <div className="comprobante-observaciones">
              <p><strong>Observaciones:</strong> {observaciones}</p>
            </div>
          )}

          {/* Pie del comprobante */}
          <div className="comprobante-footer">
            <p>Representacion impresa de la {tipoDocumento === 'boleta' ? 'Boleta' : 'Factura'} Electronica</p>
            <p>Consulte su comprobante en www.sunat.gob.pe</p>
          </div>
        </div>
      </div>}
    </div>
  )
}

export default ComprobanteGenerado
