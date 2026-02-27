import axios from 'axios';

// URL del API - Producción Railway
const API_URL = 'https://softwarebillarbackend-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Mesas
export const mesasService = {
  getAll: () => api.get('/mesas'),
  getById: (id) => api.get(`/mesas/${id}`),
  create: (data) => api.post('/mesas', data),
  update: (id, data) => api.put(`/mesas/${id}`, data),
  delete: (id) => api.delete(`/mesas/${id}`),
  iniciarSesion: (id, data) => api.post(`/mesas/${id}/iniciar`, data)
};

// Sesiones
export const sesionesService = {
  getAll: (params) => api.get('/sesiones', { params }),
  getById: (id) => api.get(`/sesiones/${id}`),
  getTiempo: (id) => api.get(`/sesiones/${id}/tiempo`),
  pausar: (id) => api.post(`/sesiones/${id}/pausar`),
  reanudar: (id) => api.post(`/sesiones/${id}/reanudar`),
  finalizar: (id) => api.post(`/sesiones/${id}/finalizar`)
};

// Jugadores
export const jugadoresService = {
  getAll: (params) => api.get('/jugadores', { params }),
  getById: (id) => api.get(`/jugadores/${id}`),
  getEstadisticas: (id) => api.get(`/jugadores/${id}/estadisticas`),
  getRanking: (limit) => api.get(`/jugadores/ranking/top?limit=${limit}`),
  create: (data) => api.post('/jugadores', data),
  update: (id, data) => api.put(`/jugadores/${id}`, data),
  delete: (id) => api.delete(`/jugadores/${id}`),
  registrarPartida: (data) => api.post('/jugadores/partidas', data)
};

// Productos
export const productosService = {
  getAll: (params) => api.get('/productos', { params }),
  getById: (id) => api.get(`/productos/${id}`),
  getBajoStock: () => api.get('/productos/bajo-stock'),
  create: (data) => api.post('/productos', data),
  update: (id, data) => api.put(`/productos/${id}`, data),
  delete: (id) => api.delete(`/productos/${id}`),
  entrada: (data) => api.post('/productos/inventario/entrada', data),
  salida: (data) => api.post('/productos/inventario/salida', data),
  getMovimientos: (id) => api.get(`/productos/${id}/movimientos`)
};

// Clientes
export const clientesService = {
  getAll: (params) => api.get('/clientes', { params }),
  getTop: (limit) => api.get(`/clientes/top?limit=${limit}`),
  getById: (id) => api.get(`/clientes/${id}`),
  getCuenta: (id) => api.get(`/clientes/${id}/cuenta`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
  pagar: (id, data) => api.post(`/clientes/${id}/pagar`, data)
};

// Consumos
export const consumosService = {
  getAll: (params) => api.get('/consumos', { params }),
  getById: (id) => api.get(`/consumos/${id}`),
  create: (data) => api.post('/consumos', data),
  pagar: (id) => api.put(`/consumos/${id}/pagar`),
  cancelar: (id) => api.put(`/consumos/${id}/cancelar`)
};

// Categorías
export const categoriasService = {
  getAll: () => api.get('/categorias'),
  getById: (id) => api.get(`/categorias/${id}`),
  create: (data) => api.post('/categorias', data),
  update: (id, data) => api.put(`/categorias/${id}`, data),
  delete: (id) => api.delete(`/categorias/${id}`)
};

// Configuración
export const configService = {
  getAll: () => api.get('/config'),
  getByClave: (clave) => api.get(`/config/${clave}`),
  update: (clave, data) => api.put(`/config/${clave}`, data),
  verificarPassword: (password) => api.post('/config/verificar-password', { password }),
  cambiarPassword: (data) => api.put('/config/password', data)
};

export default api;
