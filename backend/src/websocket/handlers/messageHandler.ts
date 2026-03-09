import type { AuthenticatedWebSocket, WSIncomingMessage } from '../../types/websocket';

export function handleMessage(ws: AuthenticatedWebSocket, data: unknown, broadcast: (chatId: string, event: string, payload: unknown, excludeUserId?: string) => void) {
  const msg = data as { chatId: string; content: string; type: string };
  if (!msg.chatId) return;

  broadcast(msg.chatId, 'message:new', {
    id: `ws-${Date.now()}`,
    chatId: msg.chatId,
    senderId: ws.userId,
    senderUsername: ws.username,
    type: msg.type || 'text',
    content: msg.content,
    createdAt: new Date().toISOString(),
  });
}
