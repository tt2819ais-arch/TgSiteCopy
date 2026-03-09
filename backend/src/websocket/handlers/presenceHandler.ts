import type { AuthenticatedWebSocket } from '../../types/websocket';

export function handlePresence(ws: AuthenticatedWebSocket, broadcastAll: (event: string, data: unknown, excludeUserId?: string) => void) {
  broadcastAll('user:online', { userId: ws.userId }, ws.userId);
}

export function handleDisconnect(ws: AuthenticatedWebSocket, broadcastAll: (event: string, data: unknown, excludeUserId?: string) => void) {
  broadcastAll('user:offline', { userId: ws.userId });
}
