import { useEffect, useCallback } from 'react';
import styles from './VideoRecorder.module.css';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import useMessageStore from '@/store/messageStore';
import useAuthStore from '@/store/authStore';
import { formatDuration } from '@/utils/formatters';

interface VideoRecorderProps {
  chatId: string;
  onClose: () => void;
}

export function VideoRecorder({ chatId, onClose }: VideoRecorderProps) {
  const user = useAuthStore((s) => s.user);
  const sendMediaMessage = useMessageStore((s) => s.sendMediaMessage);

  const {
    isRecording,
    duration,
    videoBlob,
    videoUrl,
    error,
    startPreview,
    startRecording,
    stopRecording,
    stopPreview,
    resetRecording,
    videoRef,
  } = useVideoRecorder(60);

  useEffect(() => {
    startPreview();
    return () => {
      stopPreview();
    };
  }, []);

  const handleSend = useCallback(async () => {
    if (!videoBlob || !user) return;
    const file = new File([videoBlob], 'video_circle.webm', { type: videoBlob.type });
    await sendMediaMessage(chatId, 'video_circle', [file], user.username, user.avatar);
    stopPreview();
    onClose();
  }, [videoBlob, chatId, user, sendMediaMessage, stopPreview, onClose]);

  const handleCancel = () => {
    stopPreview();
    resetRecording();
    onClose();
  };

  return (
    <div className={styles.recorder}>
      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button className={styles.closeBtn} onClick={handleCancel}>Закрыть</button>
        </div>
      )}

      {!error && (
        <div className={styles.content}>
          <div className={styles.videoContainer}>
            {!videoBlob ? (
              <video
                ref={videoRef}
                className={styles.videoPreview}
                autoPlay
                muted
                playsInline
              />
            ) : (
              <video
                src={videoUrl || ''}
                className={styles.videoPreview}
                controls
                playsInline
              />
            )}

            {isRecording && (
              <div className={styles.recordingOverlay}>
                <div className={styles.recordingDot} />
                <span className={styles.recordingTime}>{formatDuration(duration)}</span>
              </div>
            )}

            <div className={styles.circleMask} />
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={handleCancel}>
              Отмена
            </button>

            {!videoBlob && !isRecording && (
              <button className={styles.recordBtn} onClick={startRecording}>
                Запись
              </button>
            )}

            {isRecording && (
              <button className={styles.stopBtn} onClick={stopRecording}>
                Стоп
              </button>
            )}

            {videoBlob && (
              <div className={styles.previewActions}>
                <button className={styles.retryBtn} onClick={() => { resetRecording(); startPreview(); }}>
                  Заново
                </button>
                <button className={styles.sendBtn} onClick={handleSend}>
                  Отправить
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoRecorder;
