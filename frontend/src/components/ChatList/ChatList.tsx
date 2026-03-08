import { useEffect, useCallback } from 'react';
import styles from './ChatList.module.css';
import { ChatItem } from './ChatItem';
import { ChatSearch } from './ChatSearch';
import { Spinner } from '@/components/UI/Spinner/Spinner';
import { Sidebar } from '@/components/Layout/Sidebar';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';
import { useNavigate } from 'react-router-dom';
import type { ContextMenuItem } from '@/types/common';

export function ChatList() {
  const chats = useChatStore((s) => s.chats);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const isLoadingChats = useChatStore((s) => s.isLoadingChats);
  const searchQuery = useChatStore((s) => s.searchQuery);
  const searchResults = useChatStore((s) => s.searchResults);
  const loadChats = useChatStore((s) => s.loadChats);
  const searchChats = useChatStore((s) => s.searchChats);
  const clearSearch = useChatStore((s) => s.clearSearch);
  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const pinChat = useChatStore((s) => s.pinChat);
  const unpinChat = useChatStore((s) => s.unpinChat);
  const muteChat = useChatStore((s) => s.muteChat);
  const unmuteChat = useChatStore((s) => s.unmuteChat);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const showContextMenu = useUIStore((s) => s.showContextMenu);
  const isMobile = useUIStore((s) => s.isMobile);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleChatClick = useCallback(
    (chatId: string) => {
      setActiveChat(chatId);
      navigate(`/chat/${chatId}`);
      if (isMobile) {
        setSidebarOpen(false);
      }
    },
    [setActiveChat, navigate, isMobile, setSidebarOpen]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, chatId: string, isPinned: boolean, isMuted: boolean) => {
      e.preventDefault();

      const items: ContextMenuItem[] = [
        {
          id: 'pin',
          label: isPinned ? 'Открепить' : 'Закрепить',
          onClick: () => (isPinned ? unpinChat(chatId) : pinChat(chatId)),
        },
        {
          id: 'mute',
          label: isMuted ? 'Включить уведомления' : 'Выключить уведомления',
          onClick: () => (isMuted ? unmuteChat(chatId) : muteChat(chatId)),
        },
        { id: 'sep1', label: '', separator: true },
        {
          id: 'delete',
          label: 'Удалить чат',
          danger: true,
          onClick: () => deleteChat(chatId),
        },
      ];

      showContextMenu(e.clientX, e.clientY, items);
    },
    [showContextMenu, pinChat, unpinChat, muteChat, unmuteChat, deleteChat]
  );

  const displayChats = searchQuery ? searchResults : chats;

  return (
    <div className={styles.chatList}>
      <Sidebar />

      <ChatSearch
        value={searchQuery}
        onChange={searchChats}
        onBlur={() => {
          if (!searchQuery) clearSearch();
        }}
      />

      <div className={styles.list}>
        {isLoadingChats && chats.length === 0 ? (
          <div className={styles.loadingState}>
            <Spinner size={28} />
          </div>
        ) : displayChats.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className={styles.emptyTitle}>Ничего не найдено</span>
                <span className={styles.emptyText}>
                  Попробуйте изменить запрос
                </span>
              </>
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className={styles.emptyTitle}>Нет чатов</span>
                <span className={styles.emptyText}>
                  Начните общение, найдя пользователя в поиске
                </span>
              </>
            )}
          </div>
        ) : (
          displayChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onClick={() => handleChatClick(chat.id)}
              onContextMenu={(e) =>
                handleContextMenu(e, chat.id, chat.isPinned, chat.isMuted)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;
