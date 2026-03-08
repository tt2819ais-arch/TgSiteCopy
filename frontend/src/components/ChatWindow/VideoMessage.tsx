import { useState, useRef } from 'react';
import styles from './VideoMessage.module.css';

interface VideoMessageProps {
  url: string;
  duration?: number;
}

export function VideoMessage({ url, duration }: VideoMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClick = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      <video
        ref={videoRef}
        src={url}
        className={styles.video}
        loop={false}
        muted={false}
        playsInline
        preload="metadata"
        onEnded={handleEnded}
      />

      {!isPlaying && (
        <div className={styles.overlay}>
          <div className={styles.playIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      )}

      <div className={styles.border} />
    </div>
  );
}

export default VideoMessage;
