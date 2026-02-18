const API_URL = 'http://127.0.0.1:8000/api'

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || JSON.stringify(error) || res.statusText)
  }
  if (res.status === 204) return null
  return res.json()
}

// Productos
export const getProductos = (search = '') =>
  request(`/productos/${search ? `?search=${search}` : ''}`)

export const createProducto = (data) =>
  request('/productos/', { method: 'POST', body: JSON.stringify(data) })

export const updateProducto = (id, data) =>
  request(`/productos/${id}/`, { method: 'PATCH', body: JSON.stringify(data) })

export const deleteProducto = (id) =>
  request(`/productos/${id}/`, { method: 'DELETE' })

// Categorias
export const getCategorias = () => request('/categorias/')

// Clientes
export const getClientes = () => request('/clientes/')

export const createCliente = (data) =>
  request('/clientes/', { method: 'POST', body: JSON.stringify(data) })

// Comprobantes
export const getComprobantes = (params = '') =>
  request(`/comprobantes/${params ? `?${params}` : ''}`)

export const getComprobante = (id) => request(`/comprobantes/${id}/`)

export const createComprobante = (data) =>
  request('/comprobantes/', { method: 'POST', body: JSON.stringify(data) })

export const getSiguienteCorrelativo = (tipo) =>
  request(`/comprobantes/siguiente_correlativo/?tipo=${tipo}`)

// Empresa
export const getEmpresa = () => request('/empresa/')
