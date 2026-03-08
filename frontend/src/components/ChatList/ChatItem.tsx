import styles from './ChatItem.module.css';
import { classNames, getAvatarColor, getInitials, createImageUrl } from '@/utils/helpers';
import { formatChatTime, formatUnreadCount, formatMessagePreview, formatTypingText } from '@/utils/formatters';
import type { ChatPreview } from '@/types/chat';

interface ChatItemProps {
  chat: ChatPreview;
  isActive: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function ChatItem({ chat, isActive, onClick, onContextMenu }: ChatItemProps) {
  const avatarUrl = createImageUrl(chat.avatar || chat.otherUser?.avatar || null);
  const displayName = chat.name || chat.otherUser?.username || 'Чат';
  const isVerified = chat.otherUser?.isVerified || false;
  const isOnline = chat.otherUser?.status === 'online';

  return (
    <div
      className={classNames(
        styles.chatItem,
        isActive && styles.active
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <div className={styles.avatarWrapper}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className={styles.avatar} />
        ) : (
          <div
            className={styles.avatarPlaceholder}
            style={{ backgroundColor: getAvatarColor(chat.id) }}
          >
            {getInitials(displayName)}
          </div>
        )}
        {isOnline && <div className={styles.onlineDot} />}
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{displayName}</span>
            {isVerified && (
              <svg className={styles.verifiedBadge} width="16" height="16" viewBox="0 0 24 24" fill="var(--color-verified)">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </div>
          <span className={styles.time}>
            {chat.lastMessageTime && formatChatTime(chat.lastMessageTime)}
          </span>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.messagePreview}>
            {chat.isTyping ? (
              <span className={styles.typingText}>
                {formatTypingText(chat.typingUsers)}
              </span>
            ) : (
              <>
                {chat.lastMessageSender && chat.type === 'group' && (
                  <span className={styles.senderName}>
                    {chat.lastMessageSender}:{' '}
                  </span>
                )}
                <span className={styles.lastMessage}>
                  {chat.lastMessageText || 'Нет сообщений'}
                </span>
              </>
            )}
          </div>

          <div className={styles.badges}>
            {chat.isMuted && (
              <svg className={styles.mutedIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
            {chat.isPinned && (
              <svg className={styles.pinnedIcon} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
              </svg>
            )}
            {chat.unreadCount > 0 && (
              <span className={classNames(styles.unreadBadge, chat.isMuted && styles.unreadMuted)}>
                {formatUnreadCount(chat.unreadCount)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
