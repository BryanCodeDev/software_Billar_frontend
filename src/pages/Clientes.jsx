import { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Mail, DollarSign, CreditCard, Edit2, Trash2 } from 'lucide-react';
import { clientesService, consumosService, productosService } from '../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConsumoModal, setShowConsumoModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const { data } = await clientesService.getAll({ activo: true });
      setClientes(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setShowEditModal(true);
  };

  const handleDeleteCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setShowDeleteModal(true);
  };

  const eliminarCliente = async () => {
    if (!clienteSeleccionado) return;
    
    try {
      setError(null);
      await clientesService.delete(clienteSeleccionado.id_cliente);
      setShowDeleteModal(false);
      setClienteSeleccionado(null);
      await cargarClientes();
      setSuccess('Cliente eliminado correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      const mensaje = error.response?.data?.error || 'Error al eliminar el cliente';
      setError(mensaje);
      setTimeout(() => setError(null), 5000);
    }
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.telefono && c.telefono.includes(busqueda))
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-billar-gold"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Alertas */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400">Gestión de clientes y cuenta corriente</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg font-medium hover:bg-yellow-400 transition-colors w-full sm:w-auto"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-billar-gold/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-billar-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold truncate">{clientes.length}</p>
              <p className="text-xs sm:text-sm text-gray-400">Total Clientes</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold truncate">
                {formatCurrency(clientes.reduce((acc, c) => acc + (c.saldo_actual || 0), 0))}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">Saldo Pendiente</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold truncate">
                {formatCurrency(clientes.reduce((acc, c) => acc + (c.total_consumido || 0), 0))}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">Total Consumido</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold truncate">
                {clientes.reduce((acc, c) => acc + (c.visitas || 0), 0)}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">Total Visitas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
        />
      </div>

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map((cliente) => (
          <div 
            key={cliente.id_cliente}
            className="glass rounded-xl p-4 cursor-pointer hover:border-billar-gold/50 transition-all"
            onClick={() => setClienteSeleccionado(cliente)}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-billar-gold/20 flex items-center justify-center flex-shrink-0">
                <User className="text-billar-gold" size={20} sm:size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate text-sm sm:text-base">{cliente.nombre}</h3>
                {cliente.telefono && (
                  <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                    <Phone size={12} sm:size={14} /> <span className="truncate">{cliente.telefono}</span>
                  </p>
                )}
                {cliente.email && (
                  <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                    <Mail size={12} sm:size={14} /> <span className="truncate">{cliente.email}</span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 text-center">
              <div className={`rounded-lg p-2 ${cliente.saldo_actual > 0 ? 'bg-red-500/20' : 'bg-white/5'}`}>
                <p className={`text-base sm:text-lg font-bold truncate ${cliente.saldo_actual > 0 ? 'text-red-400' : ''}`}>
                  {formatCurrency(cliente.saldo_actual)}
                </p>
                <p className="text-xs text-gray-400">Saldo</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-base sm:text-lg font-bold text-green-400 truncate">
                  {formatCurrency(cliente.total_consumido)}
                </p>
                <p className="text-xs text-gray-400">Consumido</p>
              </div>
            </div>

            <div className="mt-3 text-center text-xs sm:text-sm text-gray-400">
              {cliente.visitas} visitas
            </div>

            {/* Actions */}
            <div className="mt-3 sm:mt-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setClienteSeleccionado(cliente);
                  setShowConsumoModal(true);
                }}
                className="flex-1 px-2 sm:px-3 py-2 bg-billar-gold text-billar-green-dark rounded-lg font-medium text-xs sm:text-sm hover:bg-yellow-400 transition-colors"
              >
                + Consumo
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCliente(cliente);
                }}
                className="px-2 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-colors"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCliente(cliente);
                }}
                className="px-2 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {clientesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">No se encontraron clientes</p>
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {showModal && (
        <NuevoClienteModal 
          onClose={() => {
            setShowModal(false);
            setError(null);
          }} 
          onCreated={() => {
            setShowModal(false);
            setSuccess('Cliente creado exitosamente');
            cargarClientes();
            setTimeout(() => setSuccess(null), 3000);
          }} 
          setError={setError}
        />
      )}

      {/* Modal Consumo */}
      {showConsumoModal && clienteSeleccionado && (
        <ConsumoModal 
          cliente={clienteSeleccionado}
          onClose={() => {
            setShowConsumoModal(false);
            setClienteSeleccionado(null);
            setError(null);
          }} 
          onSuccess={() => {
            setShowConsumoModal(false);
            setClienteSeleccionado(null);
            setSuccess('Consumo registrado exitosamente');
            cargarClientes();
            setTimeout(() => setSuccess(null), 3000);
          }}
          setError={setError}
        />
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && clienteSeleccionado && (
        <EditarClienteModal 
          cliente={clienteSeleccionado}
          onClose={() => {
            setShowEditModal(false);
            setClienteSeleccionado(null);
            setError(null);
          }} 
          onUpdated={() => {
            setShowEditModal(false);
            setClienteSeleccionado(null);
            cargarClientes();
            setSuccess('Cliente actualizado correctamente');
            setTimeout(() => setSuccess(null), 3000);
          }}
          setError={setError}
        />
      )}

      {/* Modal Eliminar Cliente */}
      {showDeleteModal && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-white">Eliminar Cliente</h2>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de eliminar al cliente <strong>{clienteSeleccionado.nombre}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setClienteSeleccionado(null);
                }}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarCliente}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NuevoClienteModal({ onClose, onCreated, setError }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clientesService.create(formData);
      onCreated();
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Nuevo Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              rows={3}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConsumoModal({ cliente, onClose, onSuccess, setError }) {
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    id_producto: '',
    cantidad: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const { data } = await productosService.getAll({ estado: 'activo' });
      setProductos(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const productoSeleccionado = productos.find(p => p.id_producto === parseInt(formData.id_producto));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar stock
    if (productoSeleccionado && parseInt(formData.cantidad) > productoSeleccionado.stock_actual) {
      setError('Stock insuficiente. Disponible: ' + productoSeleccionado.stock_actual);
      return;
    }
    
    setLoading(true);
    try {
      await consumosService.create({
        id_cliente: cliente.id_cliente,
        id_producto: parseInt(formData.id_producto),
        cantidad: parseInt(formData.cantidad)
      });
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'Error al registrar consumo');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-2">Registrar Consumo</h2>
        <p className="text-gray-400 mb-4">Cliente: {cliente.nombre}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Producto *</label>
            <select
              value={formData.id_producto}
              onChange={(e) => setFormData({...formData, id_producto: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              required
            >
              <option value="">Seleccionar...</option>
              {productos.map(p => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} - {formatCurrency(p.precio_venta)} (Stock: {p.stock_actual})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cantidad *</label>
            <input
              type="number"
              value={formData.cantidad}
              onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              required
              min="1"
              max={productoSeleccionado?.stock_actual || 1}
            />
          </div>

          {productoSeleccionado && (
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Precio unitario:</span>
                <span>{formatCurrency(productoSeleccionado.precio_venta)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-white/10">
                <span>Total:</span>
                <span className="text-billar-gold">
                  {formatCurrency(productoSeleccionado.precio_venta * formData.cantidad)}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.id_producto}
              className="flex-1 px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditarClienteModal({ cliente, onClose, onUpdated, setError }) {
  const [formData, setFormData] = useState({
    nombre: cliente.nombre,
    telefono: cliente.telefono || '',
    email: cliente.email || '',
    observaciones: cliente.observaciones || '',
    activo: cliente.activo
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    try {
      await clientesService.update(cliente.id_cliente, formData);
      onUpdated();
    } catch (error) {
      console.error('Error:', error);
      const mensaje = error.response?.data?.error || 'Error al actualizar el cliente';
      setLocalError(mensaje);
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Editar Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              required
            />
          </div>
          {localError && (
            <p className="text-red-400 text-sm">{localError}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <select
              value={formData.activo ? 'true' : 'false'}
              onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
