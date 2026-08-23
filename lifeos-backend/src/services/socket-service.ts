import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

class SocketService {
  private io: SocketIOServer | null = null;

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`[SOCKET.IO] Client connected: ${socket.id}`);

      // Client joins a room for a specific note document
      socket.on('join_note', (noteId: string) => {
        socket.join(`note:${noteId}`);
        console.log(`[SOCKET.IO] Socket ${socket.id} joined room note:${noteId}`);
      });

      // Client leaves note room
      socket.on('leave_note', (noteId: string) => {
        socket.leave(`note:${noteId}`);
        console.log(`[SOCKET.IO] Socket ${socket.id} left room note:${noteId}`);
      });

      // Realtime live edit broadcasting across devices/tabs
      socket.on('note:typing', (data: { noteId: string; title?: string; content?: string; folder?: string; tags?: string[] }) => {
        // Broadcast typing changes to all other clients in the room except sender
        socket.to(`note:${data.noteId}`).emit('note:updated', data);
      });

      socket.on('disconnect', () => {
        console.log(`[SOCKET.IO] Client disconnected: ${socket.id}`);
      });
    });

    console.log('[SOCKET.IO] Realtime WebSocket Server initialized');
    return this.io;
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }

  public broadcastNoteUpdate(noteId: string, payload: any): void {
    if (this.io) {
      this.io.to(`note:${noteId}`).emit('note:updated', payload);
    }
  }

  public broadcastEntityUpdate(entityType: string, action: 'create' | 'update' | 'delete', payload?: any): void {
    if (this.io) {
      this.io.emit('realtime:entity_change', { entityType, action, payload });
      this.io.emit(`${entityType}:changed`, { action, payload });
    }
  }
}

export const socketService = new SocketService();
