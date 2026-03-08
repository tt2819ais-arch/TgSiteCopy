import { useEffect, useRef } from 'react';
import wsService from '@/services/websocketService';
import useAuthStore from '@/store/authStore';
import useChatStore from '@/store/chatStore';
import useMessageStore from '@/store/messageStore';
import useUserStore from '@/store/userStore';
import useGiftStore from '@/store/giftStore';
import useUIStore from '@/store/uiStore';
import type { Message, TypingEvent, ReadReceiptEvent } from '@/types/message';
import type { ChatPreview } from '@/types/chat';
import type { GiftTransaction } from '@/types/gift';
import { formatMessagePreview } from '@/utils/formatters';

export function useWebSocket(): void {
  const isSetup = useRef(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !user || isSetup.current) return;
    isSetup.current = true;

    const unsubscribers: (() => void)[] = [];

    // Новое сообщение
    unsubscribers.push(
      wsService.on('message:new', (data) => {
        const message = data as Message;
        const { activeChatId } = useChatStore.getState();

        useMessageStore.getState().addMessage(message.chatId, message);

        useChatStore.getState().updateLastMessage(
          message.chatId,
          formatMessagePreview(message.type, message.content),
          message.createdAt,
          message.senderUsername
        );

        if (message.chatId !== activeChatId && message.senderId !== user.id) {
          useChatStore.getState().incrementUnread(message.chatId);
        }

        // Убрать typing
        useChatStore.getState().setTyping({
          chatId: message.chatId,
          userId: message.senderId,
          username: message.senderUsername,
          isTyping: false,
        });
      })
    );

    // Обновление сообщения
    unsubscribers.push(
      wsService.on('message:update', (data) => {
        const message = data as Message;
        useMessageStore.getState().updateMessage(message.chatId, message.id, message);
      })
    );

    // Удаление сообщения
    unsubscribers.push(
      wsService.on('message:delete', (data) => {
        const { chatId, messageId } = data as { chatId: string; messageId: string };
        useMessageStore.getState().updateMessage(chatId, messageId, {
          isDeleted: true,
          content: '',
        });
      })
    );

    // Реакции
    unsubscribers.push(
      wsService.on('message:reaction', (data) => {
        const { chatId, messageId, reactions } = data as {
          chatId: string;
          messageId: string;
          reactions: Message['reactions'];
        };
        useMessageStore.getState().updateMessage(chatId, messageId, { reactions });
      })
    );

    // Прочитано
    unsubscribers.push(
      wsService.on('message:read', (data) => {
        const { chatId, userId: readByUserId } = data as ReadReceiptEvent;
        if (readByUserId !== user.id) {
          useMessageStore.getState().markMessagesAsRead(chatId, user.id);
        }
      })
    );

    // Печатает
    unsubscribers.push(
      wsService.on('typing:start', (data) => {
        const event = data as TypingEvent;
        if (event.userId !== user.id) {
          useChatStore.getState().setTyping({ ...event, isTyping: true });
        }
      })
    );

    unsubscribers.push(
      wsService.on('typing:stop', (data) => {
        const event = data as TypingEvent;
        if (event.userId !== user.id) {
          useChatStore.getState().setTyping({ ...event, isTyping: false });
        }
      })
    );

    // Пользователь онлайн/оффлайн
    unsubscribers.push(
      wsService.on('user:online', (data) => {
        const { userId } = data as { userId: string };
        useUserStore.getState().setUserOnline(userId);
      })
    );

    unsubscribers.push(
      wsService.on('user:offline', (data) => {
        const { userId } = data as { userId: string };
        useUserStore.getState().setUserOffline(userId);
      })
    );

    // Новый чат
    unsubscribers.push(
      wsService.on('chat:created', (data) => {
        const chat = data as ChatPreview;
        useChatStore.getState().addChat(chat);
      })
    );

    // Подарок получен
    unsubscribers.push(
      wsService.on('gift:received', (data) => {
        const transaction = data as GiftTransaction;
        useGiftStore.getState().setReceivedGiftAnimation(transaction);
        useUIStore.getState().addToast(
          `${transaction.fromUsername} отправил вам подарок!`,
          'success'
        );
      })
    );

    // Статус соединения
    unsubscribers.push(
      wsService.on('connection:open', () => {
        useUIStore.getState().setWsConnected(true);
      })
    );

    unsubscribers.push(
      wsService.on('connection:close', () => {
        useUIStore.getState().setWsConnected(false);
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      isSetup.current = false;
    };
  }, [isAuthenticated, user]);
}

export default useWebSocket;
