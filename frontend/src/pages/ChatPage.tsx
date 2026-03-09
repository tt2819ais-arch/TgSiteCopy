import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ChatPage.module.css';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ChatList } from '@/components/ChatList/ChatList';
import { ChatWindow } from '@/components/ChatWindow/ChatWindow';
import { UserProfile } from '@/components/Profile/UserProfile';
import { GiftAnimation } from '@/components/Gifts/GiftAnimation';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';

export function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const isProfilePanelOpen = useUIStore((s) => s.isProfilePanelOpen);
  const isMobile = useUIStore((s) => s.isMobile);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const activeChat = useChatStore((s) => s.activeChat);

  useEffect(() => {
    if (chatId) {
      setActiveChat(chatId);
      if (isMobile) {
        setSidebarOpen(false);
      }
    } else {
      setActiveChat(null);
      if (isMobile) {
        setSidebarOpen(true);
      }
    }
  }, [chatId, setActiveChat, isMobile, setSidebarOpen]);

  const otherUserId = activeChat?.participants?.[0]?.userId;

  return (
    <>
      <AppLayout
        sidebar={<ChatList />}
        rightPanel={
          isProfilePanelOpen && otherUserId ? (
            <UserProfile userId={otherUserId} />
          ) : undefined
        }
      >
        <ChatWindow />
      </AppLayout>
      <GiftAnimation />
    </>
  );
}

export default ChatPage;
