import { useState, useRef, useEffect } from 'react';
import styles from './VoiceMessage.module.css';
import { formatDuration } from '@/utils/formatters';

interface VoiceMessageProps {
  url: string;
  duration: number;
  waveform?: number[];
}

export function VoiceMessage({ url, duration, waveform = [] }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animRef = useRef<number>(0);

  const defaultWaveform = waveform.length > 0
    ? waveform
    : Array.from({ length: 32 }, () => 0.1 + Math.random() * 0.9);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!audioRef.current.paused) {
        animRef.current = requestAnimationFrame(updateProgress);
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      cancelAnimationFrame(animRef.current);
    } else {
      audioRef.current.play();
      animRef.current = requestAnimationFrame(updateProgress);
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    cancelAnimationFrame(animRef.current);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration !== Infinity) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    audioRef.current.currentTime = ratio * audioDuration;
    setCurrentTime(audioRef.current.currentTime);
  };

  const progress = audioDuration > 0 ? currentTime / audioDuration : 0;

  return (
    <div className={styles.voiceMessage}>
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <button className={styles.playBtn} onClick={handlePlayPause}>
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      <div className={styles.waveformContainer} onClick={handleWaveformClick}>
        <div className={styles.waveformBars}>
          {defaultWaveform.map((val, i) => {
            const barProgress = i / defaultWaveform.length;
            const isActive = barProgress <= progress;
            return (
              <div
                key={i}
                className={styles.bar}
                style={{
                  height: `${val * 100}%`,
                  opacity: isActive ? 1 : 0.4,
                }}
              />
            );
          })}
        </div>
      </div>

      <span className={styles.duration}>
        {isPlaying || currentTime > 0
          ? formatDuration(currentTime)
          : formatDuration(audioDuration)}
      </span>
    </div>
  );
}

export default VoiceMessage;
