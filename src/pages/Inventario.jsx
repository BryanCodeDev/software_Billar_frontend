import { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { productosService, categoriasService } from '../services/api';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [bajoStock, setBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prodRes, catRes, bajoRes] = await Promise.all([
        productosService.getAll(),
        categoriasService.getAll(),
        productosService.getBajoStock()
      ]);
      setProductos(prodRes.data);
      setCategorias(catRes.data);
      setBajoStock(bajoRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = !categoriaFiltro || p.id_categoria === parseInt(categoriaFiltro);
    return coincideBusqueda && coincideCategoria;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStockColor = (actual, minimo) => {
    if (actual === 0) return 'text-red-500';
    if (actual <= minimo) return 'text-yellow-500';
    return 'text-green-500';
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
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-gray-400">Control de productos y stock</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-billar-gold text-billar-green-dark rounded-lg font-medium hover:bg-yellow-400 transition-colors w-full sm:w-auto"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-billar-gold/20 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-billar-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold truncate">{productos.length}</p>
              <p className="text-xs sm:text-sm text-gray-400">Total Productos</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-status-available/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-status-available" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold truncate">{productos.filter(p => p.stock_actual > p.stock_minimo).length}</p>
              <p className="text-xs sm:text-sm text-gray-400">Stock OK</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold truncate">{bajoStock.length}</p>
              <p className="text-xs sm:text-sm text-gray-400">Stock Bajo</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold truncate">{productos.filter(p => p.stock_actual === 0).length}</p>
              <p className="text-xs sm:text-sm text-gray-400">Agotados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de stock bajo */}
      {bajoStock.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-yellow-500 flex-shrink-0" size={20} />
            <h3 className="font-bold text-yellow-500 text-sm sm:text-base">Productos con stock bajo</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {bajoStock.slice(0, 5).map(p => (
              <span 
                key={p.id_producto}
                className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs sm:text-sm"
              >
                {p.nombre} ({p.stock_actual}/{p.stock_minimo})
              </span>
            ))}
            {bajoStock.length > 5 && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-gray-400 text-xs sm:text-sm">
                +{bajoStock.length - 5} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold text-sm"
          >
            <option value="">Todas</option>
            {categorias.map(c => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
          <button
            onClick={() => setShowTable(!showTable)}
            className="px-3 sm:px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-sm whitespace-nowrap"
          >
            {showTable ? 'Cards' : 'Tabla'}
          </button>
        </div>
      </div>

      {/* Vista de tabla */}
      {showTable ? (
        <div className="glass rounded-xl overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-400">Producto</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-400 hidden md:table-cell">Categoría</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-400">Precio</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-400">Stock</th>
                <th className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-medium text-gray-400 hidden sm:table-cell">Estado</th>
                <th className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-medium text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {productosFiltrados.map((producto) => (
                <tr key={producto.id_producto} className="hover:bg-white/5">
                  <td className="px-3 sm:px-4 py-3">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{producto.nombre}</p>
                      <p className="text-xs text-gray-500 hidden sm:block">{producto.codigo_barras}</p>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                    <span 
                      className="px-2 py-1 rounded-full text-xs"
                      style={{ backgroundColor: producto.categoria_color + '30', color: producto.categoria_color }}
                    >
                      {producto.categoria_nombre}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right font-medium text-sm sm:text-base">
                    {formatCurrency(producto.precio_venta)}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <span className={`text-sm sm:text-base ${getStockColor(producto.stock_actual, producto.stock_minimo)}`}>
                      {producto.stock_actual} {producto.unidad_medida}
                    </span>
                    <span className="text-gray-500 text-xs ml-1 hidden sm:inline">/ min: {producto.stock_minimo}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      producto.estado === 'activo' ? 'bg-green-500/20 text-green-400' :
                      producto.estado === 'inactivo' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {producto.estado}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setProductoSeleccionado(producto);
                          setShowMovimientoModal(true);
                        }}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white/10 rounded hover:bg-white/20 transition-colors"
                      >
                        ± Stock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400">No se encontraron productos</p>
            </div>
          )}
        </div>
      ) : (
        /* Vista de cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productosFiltrados.map((producto) => (
            <div key={producto.id_producto} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base truncate">{producto.nombre}</h3>
                  <p className="text-xs text-gray-500">{producto.codigo_barras}</p>
                </div>
                <span 
                  className="px-2 py-1 rounded-full text-xs flex-shrink-0 ml-2"
                  style={{ backgroundColor: producto.categoria_color + '30', color: producto.categoria_color }}
                >
                  {producto.categoria_nombre}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">Precio</p>
                  <p className="font-bold text-billar-gold text-sm sm:text-base">{formatCurrency(producto.precio_venta)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Stock</p>
                  <p className={`font-bold text-sm sm:text-base ${getStockColor(producto.stock_actual, producto.stock_minimo)}`}>
                    {producto.stock_actual} {producto.unidad_medida}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  producto.estado === 'activo' ? 'bg-green-500/20 text-green-400' :
                  producto.estado === 'inactivo' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {producto.estado}
                </span>
                <button
                  onClick={() => {
                    setProductoSeleccionado(producto);
                    setShowMovimientoModal(true);
                  }}
                  className="px-3 py-1 text-xs bg-white/10 rounded hover:bg-white/20 transition-colors"
                >
                  ± Stock
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Producto */}
      {showModal && (
        <NuevoProductoModal 
          categorias={categorias}
          onClose={() => setShowModal(false)} 
          onCreated={() => {
            setShowModal(false);
            cargarDatos();
          }} 
        />
      )}

      {/* Modal Movimiento */}
      {showMovimientoModal && productoSeleccionado && (
        <MovimientoModal 
          producto={productoSeleccionado}
          onClose={() => {
            setShowMovimientoModal(false);
            setProductoSeleccionado(null);
          }} 
          onSuccess={() => {
            setShowMovimientoModal(false);
            setProductoSeleccionado(null);
            cargarDatos();
          }}
        />
      )}
    </div>
  );
}

function NuevoProductoModal({ categorias, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    id_categoria: '',
    precio_venta: '',
    precio_compra: '',
    stock_actual: 0,
    stock_minimo: 5,
    unidad_medida: 'und',
    codigo_barras: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productosService.create(formData);
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
        <h2 className="text-lg sm:text-xl font-bold mb-4">Nuevo Producto</h2>
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Categoría *</label>
            <select
              value={formData.id_categoria}
              onChange={(e) => setFormData({...formData, id_categoria: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              required
            >
              <option value="">Seleccionar...</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Precio Venta *</label>
              <input
                type="number"
                value={formData.precio_venta}
                onChange={(e) => setFormData({...formData, precio_venta: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Precio Compra</label>
              <input
                type="number"
                value={formData.precio_compra}
                onChange={(e) => setFormData({...formData, precio_compra: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stock Inicial</label>
              <input
                type="number"
                value={formData.stock_actual}
                onChange={(e) => setFormData({...formData, stock_actual: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stock Mínimo</label>
              <input
                type="number"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({...formData, stock_minimo: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Unidad</label>
              <select
                value={formData.unidad_medida}
                onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              >
                <option value="und">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="lt">Litro</option>
                <option value="pack">Pack</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Código Barras</label>
              <input
                type="text"
                value={formData.codigo_barras}
                onChange={(e) => setFormData({...formData, codigo_barras: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              />
            </div>
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

function MovimientoModal({ producto, onClose, onSuccess }) {
  const [tipo, setTipo] = useState('entrada');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tipo === 'entrada') {
        await productosService.entrada({ id_producto: producto.id_producto, cantidad: parseInt(cantidad), motivo });
      } else {
        await productosService.salida({ id_producto: producto.id_producto, cantidad: parseInt(cantidad), motivo });
      }
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-xl p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold mb-2">{producto.nombre}</h2>
        <p className="text-gray-400 mb-4">Stock actual: {producto.stock_actual} {producto.unidad_medida}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTipo('entrada')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
                tipo === 'entrada' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipo('salida')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
                tipo === 'salida' ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400'
              }`}
            >
              Salida
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-billar-gold"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Motivo</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Opcional"
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
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
