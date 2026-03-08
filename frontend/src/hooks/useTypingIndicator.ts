import { useRef, useCallback } from 'react';
import wsService from '@/services/websocketService';
import { TYPING_DEBOUNCE, TYPING_TIMEOUT } from '@/utils/constants';

export function useTypingIndicator(chatId: string | null) {
  const isTypingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef(0);

  const sendTypingStart = useCallback(() => {
    if (!chatId) return;

    const now = Date.now();
    if (now - lastSentRef.current < TYPING_DEBOUNCE) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      wsService.send('typing:start', { chatId });
      lastSentRef.current = now;
    }

    // Сбросить таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      sendTypingStop();
    }, TYPING_TIMEOUT);
  }, [chatId]);

  const sendTypingStop = useCallback(() => {
    if (!chatId) return;

    if (isTypingRef.current) {
      isTypingRef.current = false;
      wsService.send('typing:stop', { chatId });
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [chatId]);

  const handleInputChange = useCallback(() => {
    sendTypingStart();
  }, [sendTypingStart]);

  return {
    handleInputChange,
    sendTypingStop,
  };
}

export default useTypingIndicator;
