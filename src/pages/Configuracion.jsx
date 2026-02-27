import { useState, useEffect } from 'react';
import { Save, Lock, Building } from 'lucide-react';
import { configService } from '../services/api';

export default function Configuracion() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    passwordNuevo: '',
    passwordConfirmar: ''
  });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    try {
      const { data } = await configService.getAll();
      setConfig(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = async (key) => {
    setGuardando(true);
    setError(null);
    try {
      await configService.update(key, { valor: config[key] });
      setSuccess('Guardado correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.passwordActual || !passwordData.passwordNuevo || !passwordData.passwordConfirmar) {
      setError('Todos los campos son requeridos');
      return;
    }
    
    if (passwordData.passwordNuevo !== passwordData.passwordConfirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordData.passwordNuevo.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    setCambiandoPassword(true);
    setError(null);
    try {
      await configService.cambiarPassword({
        passwordActual: passwordData.passwordActual,
        passwordNuevo: passwordData.passwordNuevo
      });
      setSuccess('Contraseña actualizada correctamente');
      setPasswordData({ passwordActual: '', passwordNuevo: '', passwordConfirmar: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setCambiandoPassword(false);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-gray-400">Configuración del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Información del Negocio */}
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Building className="text-billar-gold flex-shrink-0" size={20} sm:size={24} />
            <h2 className="text-base sm:text-lg font-bold">Información del Negocio</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Negocio</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={config.empresa_nombre || ''}
                  onChange={(e) => handleChange('empresa_nombre', e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                />
                <button
                  onClick={() => handleSave('empresa_nombre')}
                  disabled={guardando}
                  className="px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg hover:bg-yellow-400 transition-colors flex-shrink-0"
                >
                  <Save size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={config.empresa_direccion || ''}
                  onChange={(e) => handleChange('empresa_direccion', e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                />
                <button
                  onClick={() => handleSave('empresa_direccion')}
                  disabled={guardando}
                  className="px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg hover:bg-yellow-400 transition-colors flex-shrink-0"
                >
                  <Save size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  value={config.empresa_telefono || ''}
                  onChange={(e) => handleChange('empresa_telefono', e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                />
                <button
                  onClick={() => handleSave('empresa_telefono')}
                  disabled={guardando}
                  className="px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg hover:bg-yellow-400 transition-colors flex-shrink-0"
                >
                  <Save size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Configuración del Sistema */}
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Lock className="text-billar-gold flex-shrink-0" size={20} sm:size={24} />
            <h2 className="text-base sm:text-lg font-bold">Configuración del Sistema</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Moneda</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={config.moneda || 'COP'}
                  onChange={(e) => handleChange('moneda', e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                >
                  <option value="COP">Peso Colombiano (COP)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
                <button
                  onClick={() => handleSave('moneda')}
                  disabled={guardando}
                  className="px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg hover:bg-yellow-400 transition-colors flex-shrink-0"
                >
                  <Save size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">IVA (%)</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  value={config.iva || 0}
                  onChange={(e) => handleChange('iva', e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                />
                <button
                  onClick={() => handleSave('iva')}
                  disabled={guardando}
                  className="px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg hover:bg-yellow-400 transition-colors flex-shrink-0"
                >
                  <Save size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mesas Activas</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  value={config.mesas_activas || 0}
                  onChange={(e) => handleChange('mesas_activas', e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                />
                <button
                  onClick={() => handleSave('mesas_activas')}
                  disabled={guardando}
                  className="px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg hover:bg-yellow-400 transition-colors flex-shrink-0"
                >
                  <Save size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cambio de Contraseña */}
        <div className="glass rounded-xl p-4 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Lock className="text-billar-gold flex-shrink-0" size={20} sm:size={24} />
            <h2 className="text-base sm:text-lg font-bold">Cambiar Contraseña de Acceso</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña Actual</label>
              <input
                type="password"
                value={passwordData.passwordActual}
                onChange={(e) => setPasswordData({...passwordData, passwordActual: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nueva Contraseña</label>
              <input
                type="password"
                value={passwordData.passwordNuevo}
                onChange={(e) => setPasswordData({...passwordData, passwordNuevo: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar</label>
              <input
                type="password"
                value={passwordData.passwordConfirmar}
                onChange={(e) => setPasswordData({...passwordData, passwordConfirmar: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              />
            </div>
          </form>
          
          <div className="mt-4">
            <button
              onClick={handlePasswordChange}
              disabled={cambiandoPassword}
              className="px-6 py-2 bg-billar-gold text-billar-green-dark rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {cambiandoPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
