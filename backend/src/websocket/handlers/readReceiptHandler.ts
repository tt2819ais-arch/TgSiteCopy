import type { AuthenticatedWebSocket } from '../../types/websocket';

export function handleReadReceipt(ws: AuthenticatedWebSocket, data: unknown, broadcast: (chatId: string, event: string, payload: unknown, excludeUserId?: string) => void) {
  const { chatId, messageId } = data as { chatId: string; messageId: string };
  if (!chatId || !messageId) return;

  broadcast(chatId, 'message:read', {
    chatId,
    messageId,
    userId: ws.userId,
    readAt: new Date().toISOString(),
  }, ws.userId);
}
