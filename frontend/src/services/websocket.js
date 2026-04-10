import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

let stompClient = null;
const subscribers = new Map();

export const connectWebSocket = (username, token, onNotification, onConnected, onDisconnected) => {
  if (stompClient?.connected) return;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[WS]', str);
      }
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    onConnect: (frame) => {
      console.log('[WS] Connected:', frame.headers['user-name'] || username);

      // Subscribe to user-specific notification queue
      const userSub = stompClient.subscribe(
        `/user/${username}/queue/notifications`,
        (message) => {
          try {
            const notification = JSON.parse(message.body);
            onNotification?.(notification);
          } catch (e) {
            console.error('[WS] Failed to parse notification:', e);
          }
        }
      );
      subscribers.set('user-notifications', userSub);

      // Subscribe to broadcast critical alerts topic
      const criticalSub = stompClient.subscribe(
        '/topic/critical-alerts',
        (message) => {
          try {
            const alert = JSON.parse(message.body);
            onNotification?.({ ...alert, type: 'CRITICAL_ALERT' });
          } catch (e) {
            console.error('[WS] Failed to parse critical alert:', e);
          }
        }
      );
      subscribers.set('critical-alerts', criticalSub);

      onConnected?.();
    },

    onStompError: (frame) => {
      console.error('[WS] STOMP error:', frame.headers['message']);
      onDisconnected?.();
    },

    onDisconnect: () => {
      console.log('[WS] Disconnected');
      onDisconnected?.();
    },

    onWebSocketError: (event) => {
      console.error('[WS] WebSocket error:', event);
    },
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  subscribers.forEach((sub) => {
    try { sub.unsubscribe(); } catch (_) {}
  });
  subscribers.clear();

  if (stompClient?.connected) {
    stompClient.deactivate();
  }
  stompClient = null;
};

export const isConnected = () => stompClient?.connected ?? false;
