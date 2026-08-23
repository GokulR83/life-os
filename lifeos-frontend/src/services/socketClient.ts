import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[SOCKET.IO CLIENT] Connected to backend websocket server:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[SOCKET.IO CLIENT] Disconnected from websocket server');
    });
  }

  return socket;
};

export const joinNoteRoom = (noteId: string) => {
  const s = getSocket();
  s.emit('join_note', noteId);
};

export const leaveNoteRoom = (noteId: string) => {
  const s = getSocket();
  s.emit('leave_note', noteId);
};

export const emitNoteTyping = (noteId: string, payload: any) => {
  const s = getSocket();
  s.emit('note:typing', { noteId, ...payload });
};

export const subscribeToEntityChanges = (callback: (event: { entityType: string; action: string; payload?: any }) => void) => {
  const s = getSocket();
  const handler = (data: any) => callback(data);
  s.on('realtime:entity_change', handler);
  return () => {
    s.off('realtime:entity_change', handler);
  };
};
