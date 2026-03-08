import { useCallback } from 'react';
import styles from './VoiceRecorder.module.css';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import useMessageStore from '@/store/messageStore';
import useAuthStore from '@/store/authStore';
import { formatDuration } from '@/utils/formatters';
import mediaService from '@/services/mediaService';

interface VoiceRecorderProps {
  chatId: string;
  onClose: () => void;
}

export function VoiceRecorder({ chatId, onClose }: VoiceRecorderProps) {
  const user = useAuthStore((s) => s.user);
  const sendMediaMessage = useMessageStore((s) => s.sendMediaMessage);

  const {
    isRecording,
    duration,
    mediaBlob,
    mediaUrl,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  } = useMediaRecorder({
    audio: true,
    video: false,
    maxDuration: 300,
  });

  const handleSend = useCallback(async () => {
    if (!mediaBlob || !user) return;

    const file = new File([mediaBlob], 'voice.webm', { type: mediaBlob.type });
    await sendMediaMessage(chatId, 'voice', [file], user.username, user.avatar);
    onClose();
  }, [mediaBlob, chatId, user, sendMediaMessage, onClose]);

  const handleCancel = () => {
    resetRecording();
    onClose();
  };

  return (
    <div className={styles.recorder}>
      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button className={styles.closeBtn} onClick={onClose}>Закрыть</button>
        </div>
      )}

      {!error && !mediaBlob && !isRecording && (
        <div className={styles.controls}>
          <button className={styles.cancelBtn} onClick={handleCancel}>
            Отмена
          </button>
          <button className={styles.recordBtn} onClick={startRecording}>
            <div className={styles.recordDot} />
            <span>Записать</span>
          </button>
        </div>
      )}

      {!error && isRecording && (
        <div className={styles.recording}>
          <div className={styles.recordingIndicator}>
            <div className={styles.recordingDot} />
            <span className={styles.recordingTime}>{formatDuration(duration)}</span>
          </div>
          <button className={styles.stopBtn} onClick={stopRecording}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            <span>Стоп</span>
          </button>
        </div>
      )}

      {!error && mediaBlob && !isRecording && (
        <div className={styles.preview}>
          <audio src={mediaUrl || ''} controls className={styles.audioPreview} />
          <div className={styles.previewActions}>
            <button className={styles.discardBtn} onClick={() => { resetRecording(); }}>
              Заново
            </button>
            <button className={styles.sendBtn} onClick={handleSend}>
              Отправить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
