import type { WSMessage, WSEventType } from '@/types/common';
import { RECONNECT_INTERVAL, MAX_RECONNECT_ATTEMPTS, WS_URL } from '@/utils/constants';

type EventHandler = (data: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private isManualClose = false;
  private token: string | null = null;
  private messageQueue: string[] = [];

  connect(token: string): void {
    this.token = token;
    this.isManualClose = false;
    this.doConnect();
  }

  private doConnect(): void {
    if (!this.token) return;

    try {
      const url = `${WS_URL}?token=${encodeURIComponent(this.token)}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WS] Подключено');
        this.reconnectAttempts = 0;
        this.startPing();
        this.flushQueue();
        this.emit('connection:open', null);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.emit(message.event, message.data);
        } catch {
          console.warn('[WS] Не удалось разобрать сообщение', event.data);
        }
      };

      this.ws.onclose = (event) => {
        console.log('[WS] Отключено:', event.code, event.reason);
        this.stopPing();
        this.emit('connection:close', { code: event.code, reason: event.reason });

        if (!this.isManualClose && this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Ошибка:', error);
        this.emit('connection:error', error);
      };
    } catch (error) {
      console.error('[WS] Ошибка создания:', error);
      if (!this.isManualClose) {
        this.scheduleReconnect();
      }
    }
  }

  disconnect(): void {
    this.isManualClose = true;
    this.stopPing();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Пользователь отключился');
      this.ws = null;
    }

    this.token = null;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  send(event: WSEventType | string, data: unknown): void {
    const message = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
    });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[WS] Ошибка обработчика ${event}:`, err);
        }
      });
    }

    // Глобальный обработчик
    const allHandlers = this.handlers.get('*');
    if (allHandlers) {
      allHandlers.forEach((handler) => {
        try {
          handler({ event, data });
        } catch (err) {
          console.error('[WS] Ошибка глобального обработчика:', err);
        }
      });
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = RECONNECT_INTERVAL * Math.min(this.reconnectAttempts, 5);
    console.log(`[WS] Переподключение через ${delay}мс (попытка ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.doConnect();
    }, delay);
  }

  private startPing(): void {
    this.pingTimer = setInterval(() => {
      this.send('ping' as WSEventType, {});
    }, 25000);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private flushQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(msg);
      }
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
