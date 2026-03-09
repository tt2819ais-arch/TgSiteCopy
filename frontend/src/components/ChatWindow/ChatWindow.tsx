import { useState } from 'react';
import styles from './ChatWindow.module.css';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { VoiceRecorder } from './VoiceRecorder';
import { VideoRecorder } from './VideoRecorder';
import { MediaPreview } from './MediaPreview';
import useChatStore from '@/store/chatStore';
import { Spinner } from '@/components/UI/Spinner/Spinner';

type InputMode = 'text' | 'voice' | 'video' | 'media';

export function ChatWindow() {
  const activeChat = useChatStore((s) => s.activeChat);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const isLoadingChat = useChatStore((s) => s.isLoadingChat);

  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  if (!activeChatId) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderContent}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h2 className={styles.placeholderTitle}>Выберите чат</h2>
          <p className={styles.placeholderText}>
            Выберите чат из списка или начните новый диалог
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingChat || !activeChat) {
    return (
      <div className={styles.loading}>
        <Spinner size={32} />
      </div>
    );
  }

  const handleOpenMedia = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        setMediaFiles(files);
        setInputMode('media');
      }
    };
    input.click();
  };

  return (
    <div className={styles.chatWindow}>
      <ChatHeader chat={activeChat} />

      <MessageList chatId={activeChatId} />

      {inputMode === 'text' && (
        <MessageInput
          chatId={activeChatId}
          onOpenVoice={() => setInputMode('voice')}
          onOpenVideo={() => setInputMode('video')}
          onOpenMedia={handleOpenMedia}
        />
      )}

      {inputMode === 'voice' && (
        <VoiceRecorder
          chatId={activeChatId}
          onClose={() => setInputMode('text')}
        />
      )}

      {inputMode === 'video' && (
        <VideoRecorder
          chatId={activeChatId}
          onClose={() => setInputMode('text')}
        />
      )}

      {inputMode === 'media' && (
        <MediaPreview
          chatId={activeChatId}
          files={mediaFiles}
          onClose={() => {
            setInputMode('text');
            setMediaFiles([]);
          }}
          onSend={() => {
            setInputMode('text');
            setMediaFiles([]);
          }}
        />
      )}
    </div>
  );
}

export default ChatWindow;