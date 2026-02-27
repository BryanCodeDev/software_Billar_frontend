import { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Clock, DollarSign, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { mesasService, sesionesService } from '../services/api';
import { socketService } from '../services/socket';

export default function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sesionActiva, setSesionActiva] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Timer para actualización en tiempo real cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setMesas(prev => prev.map(mesa => {
        if (mesa.estado === 'ocupada' && mesa.hora_inicio && mesa.precio_hora) {
          // Calcular tiempo transcurrido desde que startedicio
          const ahora = new Date();
          const inicio = new Date(mesa.hora_inicio);
          const diffMs = ahora - inicio;
          const diffSegundos = Math.floor(diffMs / 1000);
          const diffMinutos = Math.floor(diffSegundos / 60);
          
          // Calcular costo en tiempo real (precio por hora / 3600 para obtener precio por segundo)
          const precioPorSegundo = mesa.precio_hora / 3600;
          const costoActual = diffSegundos * precioPorSegundo;
          
          return {
            ...mesa,
            minutos_transcurridos: diffMinutos,
            segundos_transcurridos: diffSegundos,
            costo_actual: costoActual
          };
        }
        return mesa;
      }));
    }, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    cargarMesas();
    
    // Suscribirse a actualizaciones de WebSocket
    socketService.onMesaActualizada((mesa) => {
      setMesas(prev => prev.map(m => m.id_mesa === mesa.id_mesa ? mesa : m));
    });

    socketService.onSesionTiempo((data) => {
      setMesas(prev => prev.map(m => 
        // Buscar por id_sesion o id_mesa
        (m.id_sesion === data.id_sesion || m.id_mesa === data.id_mesa)
          ? { ...m, minutos_transcurridos: data.minutos, costo_actual: data.costo }
          : m
      ));
    });

    // Listener para sesión finalizada
    socketService.onSesionFinalizada((data) => {
      setMesas(prev => prev.map(m => 
        m.id_mesa === data.id_mesa 
          ? { 
              ...m, 
              estado: 'disponible', 
              id_sesion: null, 
              hora_inicio: null, 
              estado_sesion: null,
              minutos_transcurridos: 0, 
              costo_actual: 0 
            }
          : m
      ));
      setSuccess('Sesión finalizada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    });

    // Listener para sesión pausada
    socketService.onSesionPausada((sesion) => {
      setMesas(prev => prev.map(m => 
        m.id_sesion === sesion.id_sesion 
          ? { ...m, estado_sesion: 'pausada' }
          : m
      ));
    });

    // Listener para sesión reanudada
    socketService.onSesionReanudada((sesion) => {
      setMesas(prev => prev.map(m => 
        m.id_sesion === sesion.id_sesion 
          ? { ...m, estado_sesion: 'activa' }
          : m
      ));
    });

    return () => {
      socketService.removeListener('mesa:actualizada');
      socketService.removeListener('sesion:tiempo');
      socketService.removeListener('sesion:finalizada');
      socketService.removeListener('sesion:pausada');
      socketService.removeListener('sesion:reanudada');
    };
  }, []);

  const cargarMesas = async () => {
    try {
      setError(null);
      const { data } = await mesasService.getAll();
      setMesas(data);
    } catch (error) {
      console.error('Error cargando mesas:', error);
      setError('Error al cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  const iniciarSesion = async (mesa) => {
    try {
      setError(null);
      const { data } = await mesasService.iniciarSesion(mesa.id_mesa, {});
      // Recargar las mesas para obtener los datos actualizados del backend
      await cargarMesas();
      setSuccess('Sesión iniciada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error iniciando sesión:', error);
      const mensaje = error.response?.data?.error || 'Error al iniciar la sesión';
      setError(mensaje);
      setTimeout(() => setError(null), 5000);
    }
  };

  const finalizarSesion = async (mesa) => {
    if (!mesa.id_sesion) return;
    
    try {
      setError(null);
      const { data } = await sesionesService.finalizar(mesa.id_sesion);
      // La actualización se hace mediante el WebSocket, pero también recargamos por seguridad
      await cargarMesas();
      setSuccess('Sesión finalizada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error finalizando sesión:', error);
      const mensaje = error.response?.data?.error || 'Error al finalizar la sesión';
      setError(mensaje);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEditMesa = (mesa) => {
    setSelectedMesa(mesa);
    setShowEditModal(true);
  };

  const handleDeleteMesa = (mesa) => {
    setSelectedMesa(mesa);
    setShowDeleteModal(true);
  };

  const eliminarMesa = async () => {
    if (!selectedMesa) return;
    
    try {
      setError(null);
      await mesasService.delete(selectedMesa.id_mesa);
      setShowDeleteModal(false);
      setSelectedMesa(null);
      await cargarMesas();
      setSuccess('Mesa eliminada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error eliminando mesa:', error);
      const mensaje = error.response?.data?.error || 'Error al eliminar la mesa';
      setError(mensaje);
      setTimeout(() => setError(null), 5000);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'disponible': return 'bg-status-available';
      case 'ocupada': return 'bg-status-occupied animate-pulse-red';
      case 'mantenimiento': return 'bg-status-maintenance';
      case 'reservada': return 'bg-status-reserved';
      default: return 'bg-gray-500';
    }
  };

  const formatTiempo = (minutos, segundos) => {
    if (!minutos && !segundos) return '00:00:00';
    const hrs = Math.floor(minutos / 60);
    const mins = minutos % 60;
    const segs = segundos ? segundos % 60 : 0;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (value) => {
    // Manejar valores NaN, undefined, null
    const num = Number(value);
    if (isNaN(num)) return '$ 0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(num);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mesas</h1>
          <p className="text-gray-400">Control de mesas y tiempo</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg font-medium hover:bg-yellow-400 transition-colors w-full sm:w-auto"
        >
          <Plus size={20} />
          Nueva Mesa
        </button>
      </div>

      {/* Alertas de error y éxito */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-200">{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2">
          <DollarSign className="text-green-500" size={20} />
          <span className="text-green-200">{success}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-status-available/20 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-status-available"></div>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold truncate">{mesas.filter(m => m.estado === 'disponible').length}</p>
              <p className="text-xs sm:text-sm text-gray-400">Disponibles</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-status-occupied/20 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-status-occupied"></div>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold truncate">{mesas.filter(m => m.estado === 'ocupada').length}</p>
              <p className="text-xs sm:text-sm text-gray-400">Ocupadas</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-status-maintenance/20 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-status-maintenance"></div>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold truncate">{mesas.filter(m => m.estado === 'mantenimiento').length}</p>
              <p className="text-xs sm:text-sm text-gray-400">Mantenimiento</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-billar-gold/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-billar-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold truncate">
                {formatCurrency(mesas.reduce((acc, m) => acc + (m.costo_actual || 0), 0))}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">Total Activo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mesas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mesas.map((mesa) => (
          <div 
            key={mesa.id_mesa}
            className={`glass rounded-xl p-4 border-2 transition-all ${
              mesa.estado === 'ocupada' ? 'border-status-occupied' : 'border-transparent'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getStatusColor(mesa.estado)}`}></div>
                <h3 className="font-bold text-base sm:text-lg">Mesa {mesa.numero_mesa}</h3>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 capitalize whitespace-nowrap">
                {mesa.tipo_mesa}
              </span>
            </div>

            {/* Timer (si está ocupada) */}
            {mesa.estado === 'ocupada' && (
              <div className="mb-4 p-2 sm:p-3 rounded-lg bg-billar-green/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 sm:gap-2 text-status-occupied">
                    <Clock size={16} />
                    <span className="text-xs sm:text-sm font-medium">Tiempo</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold font-mono">
                    {formatTiempo(mesa.minutos_transcurridos, mesa.segundos_transcurridos)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 text-billar-gold">
                    <DollarSign size={16} />
                    <span className="text-xs sm:text-sm font-medium">Costo</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-billar-gold">
                    {formatCurrency(mesa.costo_actual)}
                  </span>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-4 text-xs sm:text-sm text-gray-400">
              {formatCurrency(mesa.precio_hora)} / hora
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {mesa.estado === 'disponible' ? (
                <button
                  onClick={() => iniciarSesion(mesa)}
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-status-available text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
                >
                  <Play size={18} />
                  Iniciar
                </button>
              ) : mesa.estado === 'ocupada' ? (
                <button
                  onClick={() => finalizarSesion(mesa)}
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-status-occupied text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
                >
                  <Square size={18} />
                  Finalizar
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 px-2 sm:px-4 py-2 bg-gray-600 text-gray-400 rounded-lg font-medium cursor-not-allowed text-sm"
                >
                  No disponible
                </button>
              )}
            </div>

            {/* Editar y Eliminar */}
            <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
              <button
                onClick={() => handleEditMesa(mesa)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-colors text-xs"
              >
                <Edit2 size={14} />
                Editar
              </button>
              <button
                onClick={() => handleDeleteMesa(mesa)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-colors text-xs"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Mesa */}
      {showModal && (
        <NuevaMesaModal 
          onClose={() => setShowModal(false)} 
          onCreated={() => {
            setShowModal(false);
            cargarMesas();
          }} 
        />
      )}

      {/* Modal Editar Mesa */}
      {showEditModal && selectedMesa && (
        <EditarMesaModal 
          mesa={selectedMesa}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMesa(null);
          }} 
          onUpdated={() => {
            setShowEditModal(false);
            setSelectedMesa(null);
            cargarMesas();
            setSuccess('Mesa actualizada correctamente');
            setTimeout(() => setSuccess(null), 3000);
          }}
          setError={setError}
        />
      )}

      {/* Modal Eliminar Mesa */}
      {showDeleteModal && selectedMesa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-white">Eliminar Mesa</h2>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de eliminar la mesa <strong>{selectedMesa.numero_mesa}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMesa(null);
                }}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarMesa}
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

function NuevaMesaModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    numero_mesa: '',
    nombre_mesa: '',
    tipo_mesa: 'pool',
    precio_hora: 15000,
    color_hex: '#1a1a2e'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await mesasService.create(formData);
      onCreated();
    } catch (error) {
      console.error('Error:', error);
      const mensaje = error.response?.data?.error || 'Error al crear la mesa';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Nueva Mesa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Número de Mesa</label>
            <input
              type="number"
              value={formData.numero_mesa}
              onChange={(e) => setFormData({...formData, numero_mesa: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              required
              min="1"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre (opcional)</label>
            <input
              type="text"
              value={formData.nombre_mesa}
              onChange={(e) => setFormData({...formData, nombre_mesa: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <select
              value={formData.tipo_mesa}
              onChange={(e) => setFormData({...formData, tipo_mesa: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            >
              <option value="pool">Pool</option>
              <option value="carambola">Carambola</option>
              <option value="snooker">Snooker</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Precio por Hora</label>
            <input
              type="number"
              value={formData.precio_hora}
              onChange={(e) => setFormData({...formData, precio_hora: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
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

function EditarMesaModal({ mesa, onClose, onUpdated, setError }) {
  const [formData, setFormData] = useState({
    numero_mesa: mesa.numero_mesa,
    nombre_mesa: mesa.nombre_mesa || '',
    tipo_mesa: mesa.tipo_mesa,
    precio_hora: mesa.precio_hora,
    estado: mesa.estado,
    color_hex: mesa.color_hex || '#1a1a2e'
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    try {
      await mesasService.update(mesa.id_mesa, formData);
      onUpdated();
    } catch (error) {
      console.error('Error:', error);
      const mensaje = error.response?.data?.error || 'Error al actualizar la mesa';
      setLocalError(mensaje);
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Editar Mesa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Número de Mesa</label>
            <input
              type="number"
              value={formData.numero_mesa}
              onChange={(e) => setFormData({...formData, numero_mesa: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              required
              min="1"
            />
          </div>
          {localError && (
            <p className="text-red-400 text-sm">{localError}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre (opcional)</label>
            <input
              type="text"
              value={formData.nombre_mesa}
              onChange={(e) => setFormData({...formData, nombre_mesa: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <select
              value={formData.tipo_mesa}
              onChange={(e) => setFormData({...formData, tipo_mesa: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            >
              <option value="pool">Pool</option>
              <option value="carambola">Carambola</option>
              <option value="snooker">Snooker</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Precio por Hora</label>
            <input
              type="number"
              value={formData.precio_hora}
              onChange={(e) => setFormData({...formData, precio_hora: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({...formData, estado: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            >
              <option value="disponible">Disponible</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="reservada">Reservada</option>
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
