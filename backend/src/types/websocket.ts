import type WebSocket from 'ws';

export interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
  username: string;
  isAlive: boolean;
}

export interface WSIncomingMessage {
  event: string;
  data: unknown;
  timestamp: string;
}

export interface WSOutgoingMessage {
  event: string;
  data: unknown;
  timestamp: string;
}
