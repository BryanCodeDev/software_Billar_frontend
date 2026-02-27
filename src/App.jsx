import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Mesas from './pages/Mesas';
import Jugadores from './pages/Jugadores';
import Inventario from './pages/Inventario';
import Clientes from './pages/Clientes';
import Configuracion from './pages/Configuracion';
import { socketService } from './services/socket';

function App() {
  useEffect(() => {
    // Conectar al WebSocket al iniciar la aplicación
    socketService.connect();
    
    return () => {
      socketService.disconnect();
    };
  }, []);
  
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Mesas />} />
            <Route path="jugadores" element={<Jugadores />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="config" element={<Configuracion />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
