import styles from './ChatHeader.module.css';
import { classNames, getAvatarColor, getInitials, createImageUrl } from '@/utils/helpers';
import { formatLastSeen, formatUsername, formatTypingText } from '@/utils/formatters';
import { Header, BackButton, HeaderButton } from '@/components/Layout/Header';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';
import { useNavigate } from 'react-router-dom';
import type { Chat } from '@/types/chat';

interface ChatHeaderProps {
  chat: Chat;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const isMobile = useUIStore((s) => s.isMobile);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const setProfilePanelOpen = useUIStore((s) => s.setProfilePanelOpen);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const navigate = useNavigate();

  const otherUser = chat.participants.find((p) => p.role !== 'owner') || chat.participants[0];
  const displayName = chat.name || otherUser?.username || 'Чат';
  const avatarUrl = createImageUrl(chat.avatar || null);
  const isVerified = otherUser?.isVerified || false;

  const chatTypingUsers = typingUsers[chat.id] || [];
  const isTyping = chatTypingUsers.length > 0;

  const getStatusText = () => {
    if (isTyping) return formatTypingText(chatTypingUsers);
    if (chat.type === 'group') {
      return `${chat.participants.length} участников`;
    }
    return 'был(а) недавно';
  };

  const handleBack = () => {
    if (isMobile) {
      setSidebarOpen(true);
    }
    navigate('/');
  };

  const handleProfileClick = () => {
    if (otherUser) {
      setProfilePanelOpen(true);
    }
  };

  return (
    <Header
      leftAction={isMobile ? <BackButton onClick={handleBack} /> : undefined}
      rightActions={
        <div className={styles.actions}>
          <HeaderButton onClick={() => {}} title="Поиск">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </HeaderButton>
          <HeaderButton onClick={handleProfileClick} title="Профиль">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="5.5" r="3.5" />
              <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" />
            </svg>
          </HeaderButton>
        </div>
      }
    >
      <div className={styles.chatInfo} onClick={handleProfileClick}>
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
        </div>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{displayName}</span>
            {isVerified && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-verified)">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </div>
          <span className={classNames(styles.status, isTyping && styles.typing)}>
            {getStatusText()}
          </span>
        </div>
      </div>
    </Header>
  );
}

export default ChatHeader;
