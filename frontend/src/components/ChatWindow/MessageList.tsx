import { useEffect, useRef, useCallback } from 'react';
import styles from './MessageList.module.css';
import useMessageStore from '@/store/messageStore';
import useAuthStore from '@/store/authStore';
import { DateSeparator } from './DateSeparator';
import { VoiceMessage } from './VoiceMessage';
import { VideoMessage } from './VideoMessage';
import { Spinner } from '@/components/UI/Spinner/Spinner';
import { classNames, getAvatarColor, getInitials, createImageUrl, isSameDay, isNearBottom } from '@/utils/helpers';
import { formatTime } from '@/utils/formatters';
import type { Message } from '@/types/message';

interface MessageListProps {
  chatId: string;
}

export function MessageList({ chatId }: MessageListProps) {
  const messages = useMessageStore((s) => s.getChatMessages(chatId));
  const isLoading = useMessageStore((s) => s.isLoading);
  const hasMore = useMessageStore((s) => s.hasMore[chatId] ?? false);
  const loadMessages = useMessageStore((s) => s.loadMessages);
  const loadMoreMessages = useMessageStore((s) => s.loadMoreMessages);
  const setReplyTo = useMessageStore((s) => s.setReplyTo);
  const currentUser = useAuthStore((s) => s.user);

  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    loadMessages(chatId);
  }, [chatId, loadMessages]);

  useEffect(() => {
    if (!listRef.current) return;
    const isNew = messages.length > prevLengthRef.current;
    const nearBottom = isNearBottom(listRef.current);

    if (isNew && (nearBottom || prevLengthRef.current === 0)) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLengthRef.current = messages.length;
  }, [messages]);

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    if (listRef.current.scrollTop < 100 && hasMore && !isLoading) {
      loadMoreMessages(chatId);
    }
  }, [chatId, hasMore, isLoading, loadMoreMessages]);

  const renderMessageContent = (message: Message) => {
    if (message.isDeleted) {
      return <span className={styles.deleted}>Сообщение удалено</span>;
    }

    switch (message.type) {
      case 'image':
        return message.attachments.map((att, i) => (
          <img
            key={i}
            src={createImageUrl(att.url) || att.url}
            alt={att.filename}
            className={styles.imageAttachment}
          />
        ));

      case 'video':
        return message.attachments.map((att, i) => (
          <VideoMessage key={i} url={createImageUrl(att.url) || att.url} duration={att.duration} />
        ));

      case 'voice':
        return message.attachments.map((att, i) => (
          <VoiceMessage
            key={i}
            url={createImageUrl(att.url) || att.url}
            duration={att.duration || 0}
            waveform={att.waveform}
          />
        ));

      case 'file':
        return message.attachments.map((att, i) => (
          <a
            key={i}
            href={createImageUrl(att.url) || att.url}
            download={att.filename}
            className={styles.fileAttachment}
          >
            <span className={styles.fileIcon}>📎</span>
            <span className={styles.fileName}>{att.filename}</span>
          </a>
        ));

      case 'system':
        return <span className={styles.systemText}>{message.content}</span>;

      default:
        return <span className={styles.textContent}>{message.content}</span>;
    }
  };

  const renderStatusIcon = (message: Message) => {
    if (message.senderId !== 'me' && message.senderId !== currentUser?.id) return null;
    if (message.status === 'sending') return <span className={styles.statusIcon}>🕐</span>;
    if (message.status === 'sent') return (
      <svg className={styles.statusSvg} width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
        <path d="M1 5l4 4L15 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    );
    if (message.status === 'delivered') return (
      <svg className={styles.statusSvg} width="18" height="10" viewBox="0 0 18 10" fill="none">
        <path d="M1 5l4 4L15 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 5l4 4L19 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
    if (message.status === 'read') return (
      <svg className={classNames(styles.statusSvg, styles.read)} width="18" height="10" viewBox="0 0 18 10" fill="none">
        <path d="M1 5l4 4L15 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 5l4 4L19 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
    return null;
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className={styles.list} ref={listRef} onScroll={handleScroll}>
      {hasMore && (
        <div className={styles.loadMoreWrap}>
          {isLoading ? <Spinner size={20} /> : null}
        </div>
      )}

      {messages.map((message, index) => {
        const prevMessage = messages[index - 1];
        const showDateSep = !prevMessage || !isSameDay(prevMessage.createdAt, message.createdAt);
        const isOwn = message.senderId === 'me' || message.senderId === currentUser?.id;
        const isSystem = message.type === 'system';
        const showAvatar = !isOwn && (!messages[index + 1] || messages[index + 1].senderId !== message.senderId);

        if (isSystem) {
          return (
            <div key={message.id}>
              {showDateSep && <DateSeparator date={message.createdAt} />}
              <div className={styles.systemMessage}>
                {renderMessageContent(message)}
              </div>
            </div>
          );
        }

        return (
          <div key={message.id}>
            {showDateSep && <DateSeparator date={message.createdAt} />}
            <div className={classNames(styles.messageRow, isOwn && styles.own)}>
              {!isOwn && (
                <div className={styles.avatarSlot}>
                  {showAvatar && (
                    <div
                      className={styles.avatar}
                      style={{ backgroundColor: getAvatarColor(message.senderId) }}
                    >
                      {message.senderAvatar
                        ? <img src={createImageUrl(message.senderAvatar) || ''} alt="" />
                        : getInitials(message.senderUsername)
                      }
                    </div>
                  )}
                </div>
              )}

              <div
                className={classNames(styles.bubble, isOwn && styles.ownBubble)}
                onDoubleClick={() => setReplyTo(message)}
              >
                {!isOwn && showAvatar && (
                  <span className={styles.senderName}>{message.senderUsername}</span>
                )}

                {message.replyToPreview && (
                  <div className={styles.replyPreview}>
                    <span className={styles.replyName}>{message.replyToPreview.senderUsername}</span>
                    <span className={styles.replyText}>{message.replyToPreview.content}</span>
                  </div>
                )}

                <div className={styles.content}>
                  {renderMessageContent(message)}
                </div>

                <div className={styles.meta}>
                  {message.isEdited && <span className={styles.edited}>ред.</span>}
                  <span className={styles.time}>{formatTime(message.createdAt)}</span>
                  {renderStatusIcon(message)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
