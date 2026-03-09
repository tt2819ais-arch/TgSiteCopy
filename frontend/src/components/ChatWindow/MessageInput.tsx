import { useState, useRef, useEffect } from 'react';
import styles from './MessageInput.module.css';
import useMessageStore from '@/store/messageStore';
import useAuthStore from '@/store/authStore';
import { classNames } from '@/utils/helpers';

interface MessageInputProps {
  chatId: string;
  onOpenVoice: () => void;
  onOpenVideo: () => void;
  onOpenMedia: () => void;
}

export function MessageInput({ chatId, onOpenVoice, onOpenVideo, onOpenMedia }: MessageInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const user = useAuthStore((s) => s.user);
  const sendTextMessage = useMessageStore((s) => s.sendTextMessage);
  const replyTo = useMessageStore((s) => s.replyTo);
  const editingMessage = useMessageStore((s) => s.editingMessage);
  const setReplyTo = useMessageStore((s) => s.setReplyTo);
  const setEditingMessage = useMessageStore((s) => s.setEditingMessage);
  const editMessage = useMessageStore((s) => s.editMessage);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [text]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !user) return;

    if (editingMessage) {
      await editMessage(chatId, editingMessage.id, trimmed);
      setEditingMessage(null);
    } else {
      await sendTextMessage(chatId, trimmed, user.username, user.avatar);
    }

    setText('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setReplyTo(null);
      setEditingMessage(null);
      setText('');
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className={styles.inputArea}>
      {(replyTo || editingMessage) && (
        <div className={styles.replyBanner}>
          <div className={styles.replyInfo}>
            <span className={styles.replyLabel}>
              {editingMessage ? 'Редактирование' : `Ответ: ${replyTo?.senderUsername}`}
            </span>
            <span className={styles.replyText}>
              {editingMessage ? editingMessage.content : replyTo?.content}
            </span>
          </div>
          <button
            className={styles.replyClose}
            onClick={() => {
              setReplyTo(null);
              setEditingMessage(null);
              if (editingMessage) setText('');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div className={styles.row}>
        <button className={styles.iconBtn} onClick={onOpenMedia} title="Прикрепить файл">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение..."
          rows={1}
        />

        {hasText ? (
          <button className={classNames(styles.iconBtn, styles.sendBtn)} onClick={handleSend} title="Отправить">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        ) : (
          <div className={styles.mediaActions}>
            <button className={styles.iconBtn} onClick={onOpenVideo} title="Видеосообщение">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </button>
            <button className={styles.iconBtn} onClick={onOpenVoice} title="Голосовое сообщение">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageInput;
