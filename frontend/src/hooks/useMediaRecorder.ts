import { useState, useRef, useCallback } from 'react';

interface UseMediaRecorderOptions {
  audio?: boolean;
  video?: boolean;
  maxDuration?: number;
  mimeType?: string;
  onDataAvailable?: (blob: Blob) => void;
}

interface UseMediaRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  mediaBlob: Blob | null;
  mediaUrl: string | null;
  error: string | null;
  analyserNode: AnalyserNode | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

export function useMediaRecorder(options: UseMediaRecorderOptions = {}): UseMediaRecorderReturn {
  const {
    audio = true,
    video = false,
    maxDuration = 300,
    mimeType,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    recorderRef.current = null;
    setAnalyserNode(null);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];

      const constraints: MediaStreamConstraints = {};
      if (audio) constraints.audio = { echoCancellation: true, noiseSuppression: true };
      if (video) constraints.video = { facingMode: 'user', width: 480, height: 480 };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Анализатор для визуализации
      if (audio) {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        setAnalyserNode(analyser);
      }

      const selectedMimeType = mimeType || getSupportedMimeType(video);
      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: video ? 1000000 : undefined,
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMimeType });
        const url = URL.createObjectURL(blob);
        setMediaBlob(blob);
        setMediaUrl(url);
        options.onDataAvailable?.(blob);
        cleanup();
      };

      recorder.onerror = () => {
        setError('Ошибка записи');
        cleanup();
      };

      recorderRef.current = recorder;
      recorder.start(100);

      startTimeRef.current = Date.now();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Доступ к микрофону запрещён');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('Микрофон не найден');
      } else {
        setError('Не удалось начать запись');
      }
    }
  }, [audio, video, maxDuration, mimeType, cleanup, options]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'paused') {
      recorderRef.current.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now() - duration * 1000;
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);
    }
  }, [duration, maxDuration, stopRecording]);

  const resetRecording = useCallback(() => {
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
    }
    setMediaBlob(null);
    setMediaUrl(null);
    setDuration(0);
    setError(null);
    chunksRef.current = [];
  }, [mediaUrl]);

  return {
    isRecording,
    isPaused,
    duration,
    mediaBlob,
    mediaUrl,
    error,
    analyserNode,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
}

function getSupportedMimeType(includeVideo: boolean): string {
  const videoTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  const audioTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

  const types = includeVideo ? videoTypes : audioTypes;

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return includeVideo ? 'video/webm' : 'audio/webm';
}

export default useMediaRecorder;
