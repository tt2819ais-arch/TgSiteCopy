import type { AuthenticatedWebSocket } from '../../types/websocket';

export function handleTypingStart(ws: AuthenticatedWebSocket, data: unknown, broadcast: (chatId: string, event: string, payload: unknown, excludeUserId?: string) => void) {
  const { chatId } = data as { chatId: string };
  if (!chatId) return;

  broadcast(chatId, 'typing:start', {
    chatId,
    userId: ws.userId,
    username: ws.username,
    isTyping: true,
  }, ws.userId);
}

export function handleTypingStop(ws: AuthenticatedWebSocket, data: unknown, broadcast: (chatId: string, event: string, payload: unknown, excludeUserId?: string) => void) {
  const { chatId } = data as { chatId: string };
  if (!chatId) return;

  broadcast(chatId, 'typing:stop', {
    chatId,
    userId: ws.userId,
    username: ws.username,
    isTyping: false,
  }, ws.userId);
}
