import { useState, useEffect } from 'react';
import { Plus, Search, Trophy, User, Phone, Mail, Gamepad2 } from 'lucide-react';
import { jugadoresService, mesasService } from '../services/api';

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPartidaModal, setShowPartidaModal] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);

  useEffect(() => {
    cargarJugadores();
    cargarRanking();
  }, []);

  const cargarJugadores = async () => {
    try {
      const { data } = await jugadoresService.getAll({ activo: true });
      setJugadores(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarRanking = async () => {
    try {
      const { data } = await jugadoresService.getRanking(5);
      setRanking(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const jugadoresFiltrados = jugadores.filter(j => 
    j.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (j.apodo && j.apodo.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'experto': return 'text-purple-400';
      case 'avanzado': return 'text-red-400';
      case 'intermedio': return 'text-yellow-400';
      default: return 'text-green-400';
    }
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
          <h1 className="text-2xl font-bold text-white">Jugadores</h1>
          <p className="text-gray-400">Gestión de jugadores y estadísticas</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setShowPartidaModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-billar-green text-white rounded-lg font-medium hover:bg-green-600 transition-colors w-full sm:w-auto"
          >
            <Gamepad2 size={20} />
            <span className="whitespace-nowrap">Registrar Partida</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg font-medium hover:bg-yellow-400 transition-colors w-full sm:w-auto"
          >
            <Plus size={20} />
            Nuevo Jugador
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Ranking */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="glass rounded-xl p-4 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-billar-gold flex-shrink-0" size={20} sm:size={24} />
              <h2 className="text-base sm:text-lg font-bold">Top 5 Jugadores</h2>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {ranking.map((jugador, index) => (
                <div key={jugador.id_jugador} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/5">
                  <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${
                    index === 0 ? 'bg-billar-gold text-billar-green-dark' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-white/20'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm sm:text-base">{jugador.nombre}</p>
                    <p className="text-xs text-gray-400">{jugador.partidas_jugadas} partidas</p>
                  </div>
                  <span className="text-billar-gold font-bold text-sm sm:text-base whitespace-nowrap">{jugador.puntos_totales} pts</span>
                </div>
              ))}
              {ranking.length === 0 && (
                <p className="text-center text-gray-400 py-4">No hay jugadores aún</p>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Jugadores */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            />
          </div>

          {/* Grid de jugadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jugadoresFiltrados.map((jugador) => (
              <div 
                key={jugador.id_jugador}
                className="glass rounded-xl p-4 cursor-pointer hover:border-billar-gold/50 transition-all"
                onClick={() => setJugadorSeleccionado(jugador)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-billar-gold/20 flex items-center justify-center flex-shrink-0">
                    <User className="text-billar-gold" size={20} sm:size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate text-sm sm:text-base">{jugador.nombre}</h3>
                    {jugador.apodo && (
                      <p className="text-xs sm:text-sm text-gray-400">"{jugador.apodo}"</p>
                    )}
                    <span className={`text-xs ${getNivelColor(jugador.nivel)} capitalize`}>
                      {jugador.nivel}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-base sm:text-lg font-bold text-billar-gold">{jugador.puntos_totales}</p>
                    <p className="text-xs text-gray-400">Puntos</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-base sm:text-lg font-bold">{jugador.partidas_jugadas}</p>
                    <p className="text-xs text-gray-400">Jugadas</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-base sm:text-lg font-bold text-green-400">{jugador.partidas_ganadas}</p>
                    <p className="text-xs text-gray-400">Ganadas</p>
                  </div>
                </div>

                {(jugador.telefono || jugador.email) && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                    {jugador.telefono && (
                      <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                        <Phone size={12} sm:size={14} /> <span className="truncate">{jugador.telefono}</span>
                      </p>
                    )}
                    {jugador.email && (
                      <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                        <Mail size={12} sm:size={14} /> <span className="truncate">{jugador.email}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {jugadoresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <User className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400">No se encontraron jugadores</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo Jugador */}
      {showModal && (
        <NuevoJugadorModal 
          onClose={() => setShowModal(false)} 
          onCreated={() => {
            setShowModal(false);
            cargarJugadores();
            cargarRanking();
          }} 
        />
      )}

      {/* Modal Registrar Partida */}
      {showPartidaModal && (
        <RegistrarPartidaModal 
          jugadores={jugadores}
          onClose={() => setShowPartidaModal(false)} 
          onCreated={() => {
            setShowPartidaModal(false);
            cargarJugadores();
            cargarRanking();
          }} 
        />
      )}
    </div>
  );
}

function NuevoJugadorModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apodo: '',
    telefono: '',
    email: '',
    nivel: 'principiante'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jugadoresService.create(formData);
      onCreated();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Nuevo Jugador</h2>
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Apodo</label>
            <input
              type="text"
              value={formData.apodo}
              onChange={(e) => setFormData({...formData, apodo: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Nivel</label>
              <select
                value={formData.nivel}
                onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              >
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
                <option value="experto">Experto</option>
              </select>
            </div>
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

function RegistrarPartidaModal({ jugadores, onClose, onCreated }) {
  const [mesas, setMesas] = useState([]);
  const [formData, setFormData] = useState({
    id_jugador1: '',
    id_jugador2: '',
    id_mesa: '',
    modalidad: 'pool',
    tipo_partida: 'clasificado',
    bolas_jugador1: 0,
    bolas_jugador2: 0,
    puntos_jugador1: 0,
    puntos_jugador2: 0,
    bola8_perdida1: false,
    bola8_perdida2: false,
    puntos_juego: 50
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    try {
      const { data } = await mesasService.getAll();
      setMesas(data.filter(m => m.estado === 'disponible'));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jugadoresService.registrarPartida(formData);
      onCreated();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const esPool = formData.modalidad === 'pool';
  const es3Bandas = formData.modalidad === '3_bandas';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Registrar Partida</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Modalidad */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Modalidad de Juego</label>
            <div className="grid grid-cols-3 gap-2">
              {['pool', '3_bandas', 'carambola'].map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setFormData({...formData, modalidad: mod})}
                  className={`py-2 px-1 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                    formData.modalidad === mod 
                      ? 'bg-billar-gold text-billar-green-dark' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {mod === 'pool' ? 'Pool' : mod === '3_bandas' ? '3 Bandas' : 'Carambola'}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de partida (solo para pool) */}
          {esPool && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Partido</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, tipo_partida: 'clasificado'})}
                  className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                    formData.tipo_partida === 'clasificado' 
                      ? 'bg-billar-gold text-billar-green-dark' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Clasificado
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, tipo_partida: 'libre'})}
                  className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                    formData.tipo_partida === 'libre' 
                      ? 'bg-billar-gold text-billar-green-dark' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Libre
                </button>
              </div>
            </div>
          )}

          {/* Jugadores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Jugador 1 *</label>
              <select
                value={formData.id_jugador1}
                onChange={(e) => setFormData({...formData, id_jugador1: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                required
              >
                <option value="">Seleccionar...</option>
                {jugadores.map(j => (
                  <option key={j.id_jugador} value={j.id_jugador}>{j.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Jugador 2 *</label>
              <select
                value={formData.id_jugador2}
                onChange={(e) => setFormData({...formData, id_jugador2: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                required
              >
                <option value="">Seleccionar...</option>
                {jugadores.filter(j => j.id_jugador !== parseInt(formData.id_jugador1)).map(j => (
                  <option key={j.id_jugador} value={j.id_jugador}>{j.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mesa */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Mesa *</label>
            <select
              value={formData.id_mesa}
              onChange={(e) => setFormData({...formData, id_mesa: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              required
            >
              <option value="">Seleccionar...</option>
              {mesas.map(m => (
                <option key={m.id_mesa} value={m.id_mesa}>Mesa {m.numero_mesa} - {m.tipo_mesa}</option>
              ))}
            </select>
          </div>

          {/* Puntuación según modalidad */}
          {esPool ? (
            // Pool: bolas metidas
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bolas J1</label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={formData.bolas_jugador1}
                  onChange={(e) => setFormData({...formData, bolas_jugador1: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bolas J2</label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={formData.bolas_jugador2}
                  onChange={(e) => setFormData({...formData, bolas_jugador2: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                />
              </div>
            </div>
          ) : (
            // 3 Bandas / Carambola: puntos/carambolas
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Carambolas J1</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.puntos_jugador1}
                    onChange={(e) => setFormData({...formData, puntos_jugador1: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Carambolas J2</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.puntos_jugador2}
                    onChange={(e) => setFormData({...formData, puntos_jugador2: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                  />
                </div>
              </div>
              {es3Bandas && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Puntos para ganar (opcional)</label>
                  <select
                    value={formData.puntos_juego}
                    onChange={(e) => setFormData({...formData, puntos_juego: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                  >
                    <option value={50}>50 puntos</option>
                    <option value={75}>75 puntos</option>
                    <option value={100}>100 puntos</option>
                    <option value={150}>150 puntos</option>
                    <option value={0}>Sin límite</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Penalización bola 8 (solo pool clasificado) */}
          {esPool && formData.tipo_partida === 'clasificado' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bola8_1"
                  checked={formData.bola8_perdida1}
                  onChange={(e) => setFormData({...formData, bola8_perdida1: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="bola8_1" className="text-sm text-gray-300">J1 perdió por bola 8</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bola8_2"
                  checked={formData.bola8_perdida2}
                  onChange={(e) => setFormData({...formData, bola8_perdida2: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="bola8_2" className="text-sm text-gray-300">J2 perdió por bola 8</label>
              </div>
            </div>
          )}

          {/* Info de puntuación */}
          <div className="p-3 rounded-lg bg-billar-gold/10 border border-billar-gold/30">
            <p className="text-sm text-billar-gold font-medium">Sistema de Puntuación:</p>
            <ul className="text-xs text-gray-400 mt-1 space-y-1">
              {esPool ? (
                <>
                  <li>• 1 punto por cada bola metida</li>
                  <li>• 5 puntos bonus por ganar</li>
                  {formData.tipo_partida === 'clasificado' && (
                    <li>• Perder por bola 8 = pérdida automática</li>
                  )}
                </>
              ) : (
                <>
                  <li>• 1 punto por cada carambola</li>
                  <li>• 3 puntos bonus por ganar</li>
                </>
              )}
            </ul>
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
              disabled={loading || !formData.id_jugador1 || !formData.id_jugador2 || !formData.id_mesa}
              className="flex-1 px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Registrar Partida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
