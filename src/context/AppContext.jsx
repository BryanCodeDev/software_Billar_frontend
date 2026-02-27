import { createContext, useContext, useReducer, useEffect } from 'react';
import { socketService } from '../services/socket';
import { configService } from '../services/api';

const AppContext = createContext();

const initialState = {
  autenticado: false,
  config: {},
  mesas: [],
  loading: false,
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_AUTENTICADO':
      return { ...state, autenticado: action.payload };
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_MESAS':
      return { ...state, mesas: action.payload };
    case 'UPDATE_MESA':
      return {
        ...state,
        mesas: state.mesas.map(m => 
          m.id_mesa === action.payload.id_mesa ? action.payload : m
        )
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Conectar WebSocket
    socketService.connect();

    // Cargar configuración
    const cargarConfig = async () => {
      try {
        const { data } = await configService.getAll();
        dispatch({ type: 'SET_CONFIG', payload: data });
      } catch (error) {
        console.error('Error cargando config:', error);
      }
    };

    cargarConfig();

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Suscribirse a eventos de WebSocket
  useEffect(() => {
    socketService.onMesaActualizada((mesa) => {
      dispatch({ type: 'UPDATE_MESA', payload: mesa });
    });

    socketService.onSesionTiempo((data) => {
      // Actualizar tiempo de la sesión
      dispatch({
        type: 'UPDATE_MESA',
        payload: { ...data.mesa, minutos_transcurridos: data.minutos, costo_actual: data.costo }
      });
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const value = {
    ...state,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
}

export default AppContext;
