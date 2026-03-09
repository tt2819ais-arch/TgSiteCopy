import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { AuthenticatedWebSocket, WSIncomingMessage } from '../types/websocket';
import { authenticateWs } from './middleware/wsAuth';
import { handleMessage } from './handlers/messageHandler';
import { handleTypingStart, handleTypingStop } from './handlers/typingHandler';
import { handlePresence, handleDisconnect } from './handlers/presenceHandler';
import { handleReadReceipt } from './handlers/readReceiptHandler';
import { logger } from '../utils/logger';
import ChatModel from '../models/Chat';

export class SocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.init();
  }

  private init() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const payload = authenticateWs(request);

      if (!payload) {
        ws.close(4001, 'Unauthorized');
        return;
      }

      const authWs = ws as AuthenticatedWebSocket;
      authWs.userId = payload.userId;
      authWs.username = payload.username;
      authWs.isAlive = true;

      this.clients.set(payload.userId, authWs);
      logger.info(`[WS] Подключён: ${payload.username} (${payload.userId})`);

      handlePresence(authWs, this.broadcastAll.bind(this));

      authWs.on('message', (raw) => {
        try {
          const message: WSIncomingMessage = JSON.parse(raw.toString());
          this.handleEvent(authWs, message);
        } catch {
          // invalid json
        }
      });

      authWs.on('pong', () => {
        authWs.isAlive = true;
      });

      authWs.on('close', () => {
        this.clients.delete(payload.userId);
        handleDisconnect(authWs, this.broadcastAll.bind(this));
        logger.info(`[WS] Отключён: ${payload.username}`);
      });

      authWs.on('error', (err) => {
        logger.error(`[WS] Ошибка ${payload.username}:`, err.message);
      });
    });

    // Пинг каждые 30 секунд
    setInterval(() => {
      this.clients.forEach((ws, userId) => {
        if (!ws.isAlive) {
          this.clients.delete(userId);
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    logger.info('[WS] WebSocket сервер запущен');
  }

  private handleEvent(ws: AuthenticatedWebSocket, message: WSIncomingMessage) {
    switch (message.event) {
      case 'typing:start':
        handleTypingStart(ws, message.data, this.broadcastToChat.bind(this));
        break;
      case 'typing:stop':
        handleTypingStop(ws, message.data, this.broadcastToChat.bind(this));
        break;
      case 'message:read':
        handleReadReceipt(ws, message.data, this.broadcastToChat.bind(this));
        break;
      case 'ping':
        this.sendTo(ws.userId, 'pong', {});
        break;
      default:
        break;
    }
  }

  sendTo(userId: string, event: string, data: unknown) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, data, timestamp: new Date().toISOString() }));
    }
  }

  async broadcastToChat(chatId: string, event: string, data: unknown, excludeUserId?: string) {
    const chat = await ChatModel.findById(chatId);
    if (!chat) return;

    chat.participantIds.forEach((uid) => {
      if (uid !== excludeUserId) {
        this.sendTo(uid, event, data);
      }
    });
  }

  broadcastAll(event: string, data: unknown, excludeUserId?: string) {
    this.clients.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event, data, timestamp: new Date().toISOString() }));
      }
    });
  }
}

export default SocketServer;
