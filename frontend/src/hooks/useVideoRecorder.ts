import { useState, useRef, useCallback } from 'react';

interface UseVideoRecorderReturn {
  isRecording: boolean;
  duration: number;
  videoBlob: Blob | null;
  videoUrl: string | null;
  previewStream: MediaStream | null;
  error: string | null;
  startPreview: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  stopPreview: () => void;
  resetRecording: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function useVideoRecorder(maxDuration = 60): UseVideoRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null!);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPreview = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 480 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      streamRef.current = stream;
      setPreviewStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Доступ к камере запрещён');
      } else {
        setError('Не удалось получить доступ к камере');
      }
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 1500000,
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
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
  }, [maxDuration, cleanup]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const stopPreview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setPreviewStream(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoBlob(null);
    setVideoUrl(null);
    setDuration(0);
    setError(null);
    chunksRef.current = [];
  }, [videoUrl]);

  return {
    isRecording,
    duration,
    videoBlob,
    videoUrl,
    previewStream,
    error,
    startPreview,
    startRecording,
    stopRecording,
    stopPreview,
    resetRecording,
    videoRef,
  };
}

export default useVideoRecorder;
