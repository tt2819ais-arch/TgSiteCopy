import { useState } from 'react';
import styles from './MediaPreview.module.css';
import useMessageStore from '@/store/messageStore';
import useAuthStore from '@/store/authStore';
import { formatFileSize } from '@/utils/formatters';

interface MediaPreviewProps {
  chatId: string;
  files: File[];
  onClose: () => void;
  onSend: () => void;
}

export function MediaPreview({ chatId, files, onClose, onSend }: MediaPreviewProps) {
  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);
  const user = useAuthStore((s) => s.user);
  const sendMediaMessage = useMessageStore((s) => s.sendMediaMessage);

  const getPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const getMessageType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'voice';
    return 'file';
  };

  const handleSend = async () => {
    if (!user || sending) return;
    setSending(true);

    try {
      const type = files.length === 1 ? getMessageType(files[0]) : 'file';
      await sendMediaMessage(chatId, type, files, user.username, user.avatar);
      onSend();
    } catch {
      setSending(false);
    }
  };

  const renderPreview = (file: File, index: number) => {
    if (file.type.startsWith('image/')) {
      return (
        <div key={index} className={styles.previewItem}>
          <img src={getPreviewUrl(file)} alt="" className={styles.imagePreview} />
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
          </div>
        </div>
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <div key={index} className={styles.previewItem}>
          <video src={getPreviewUrl(file)} className={styles.videoPreview} controls />
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className={styles.previewItem}>
        <div className={styles.fileIcon}>📎</div>
        <div className={styles.fileInfo}>
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span>Отправить файлы ({files.length})</span>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>

        <div className={styles.previewList}>
          {files.map((file, index) => renderPreview(file, index))}
        </div>

        <div className={styles.footer}>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Добавить подпись..."
            className={styles.captionInput}
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className={styles.sendButton}
          >
            {sending ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MediaPreview;