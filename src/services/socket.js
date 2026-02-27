import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🟢 Conectado a WebSocket');
      this.socket.emit('join:mesas');
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 Desconectado de WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Suscribirse a eventos de mesas
  onMesaActualizada(callback) {
    this.socket?.on('mesa:actualizada', callback);
    this.listeners.set('mesa:actualizada', callback);
  }

  onMesaCreada(callback) {
    this.socket?.on('mesa:creada', callback);
    this.listeners.set('mesa:creada', callback);
  }

  onMesaEliminada(callback) {
    this.socket?.on('mesa:eliminada', callback);
    this.listeners.set('mesa:eliminada', callback);
  }

  // Suscribirse a eventos de sesiones
  onSesionTiempo(callback) {
    this.socket?.on('sesion:tiempo', callback);
    this.listeners.set('sesion:tiempo', callback);
  }

  onSesionFinalizada(callback) {
    this.socket?.on('sesion:finalizada', callback);
    this.listeners.set('sesion:finalizada', callback);
  }

  onSesionPausada(callback) {
    this.socket?.on('sesion:pausada', callback);
    this.listeners.set('sesion:pausada', callback);
  }

  onSesionReanudada(callback) {
    this.socket?.on('sesion:reanudada', callback);
    this.listeners.set('sesion:reanudada', callback);
  }

  // Suscribirse a eventos de inventario
  onBajoStock(callback) {
    this.socket?.on('inventario:bajo_stock', callback);
    this.listeners.set('inventario:bajo_stock', callback);
  }

  // Remover listener
  removeListener(event) {
    const callback = this.listeners.get(event);
    if (callback) {
      this.socket?.off(event, callback);
      this.listeners.delete(event);
    }
  }

  // Remover todos los listeners
  removeAllListeners() {
    this.listeners.forEach((callback, event) => {
      this.socket?.off(event, callback);
    });
    this.listeners.clear();
  }
}

export const socketService = new SocketService();
export default socketService;
