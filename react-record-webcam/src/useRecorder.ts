import { useCallback, useMemo, useRef } from 'react';

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

import { type Devices } from './devices';
import {
  ERROR_MESSAGES,
  type Recording,
  type Status,
  STATUS,
  useRecordingStore,
} from './useRecordingStore';
import { type Options } from './useRecordWebcam';
import { defaultCodec } from './codec';

const DEFAULT_RECORDER_OPTIONS: MediaRecorderOptions = {
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 2500000,
  mimeType: defaultCodec,
};

export type UseRecorder = {
  activeRecordings: Recording[];
  clearAllRecordings: () => Promise<void>;
  applyRecordingOptions: (recordingId: string) => Promise<Recording | void>;
  cancelRecording: (recordingId: string) => Promise<void>;
  clearPreview: (recordingId: string) => Promise<Recording | void>;
  download: (recordingId: string) => Promise<void>;
  getBlob: (recordingId: string) => Blob | undefined;
  pauseRecording: (recordingId: string) => Promise<Recording | void>;
  resumeRecording: (recordingId: string) => Promise<Recording | void>;
  startRecording: (recordingId: string) => Promise<Recording | void>;
  stopRecording: (recordingId: string) => Promise<Recording | void>;
  muteRecording: (recordingId: string) => Promise<Recording | void>;
  createRecording: (
    videoId?: string,
    audioId?: string,
    options?: { audioOnly?: boolean }
  ) => Promise<Recording | void>;
};

export function useRecorder({
  mediaRecorderOptions,
  options,
  devices,
  handleError,
  onStatusChange,
  onDataAvailable,
}: {
  mediaRecorderOptions?: MediaRecorderOptions;
  options?: Partial<Options>;
  devices?: Devices;
  handleError: (functionName: string, error: unknown, recordingId?: string) => void;
  onStatusChange?: (recordingId: string, oldStatus: Status, newStatus: Status) => void;
  onDataAvailable?: (recordingId: string, chunk: Blob) => void;
}): UseRecorder {
  const {
    activeRecordings,
    clearAllRecordings,
    deleteRecording,
    getRecording,
    setRecording,
    updateRecording,
  } = useRecordingStore();

  const maxDurationTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const recorderOptions: MediaRecorderOptions = useMemo(
    () => ({ ...DEFAULT_RECORDER_OPTIONS, ...mediaRecorderOptions }),
    [mediaRecorderOptions]
  );

  const setStatus = useCallback(
    (recording: Recording, newStatus: Status) => {
      const oldStatus = recording.status;
      recording.status = newStatus;
      if (oldStatus !== newStatus) {
        onStatusChange?.(recording.id, oldStatus, newStatus);
      }
    },
    [onStatusChange]
  );

  const clearMaxDurationTimer = useCallback((recordingId: string) => {
    const timer = maxDurationTimers.current.get(recordingId);
    if (timer) {
      clearTimeout(timer);
      maxDurationTimers.current.delete(recordingId);
    }
  }, []);

  const stopRecording = useCallback(
    async (recordingId: string): Promise<Recording | void> => {
      try {
        const recording = getRecording(recordingId);
        clearMaxDurationTimer(recordingId);
        recording.recorder?.stop();

        return await new Promise((resolve) => {
          if (recording.recorder) {
            recording.recorder.onstop = async () => {
              setStatus(recording, STATUS.STOPPED);
              const blob = new Blob(recording.blobChunks, {
                type: recording.mimeType,
              });
              const url = URL.createObjectURL(blob);
              recording.blob = blob;
              recording.objectURL = url;

              if (recording.previewRef.current) {
                recording.previewRef.current.src = url;
              }
              const updated = await updateRecording(recording.id, recording);
              resolve(updated);
            };
          }
        });
      } catch (error) {
        try {
          const recording = getRecording(recordingId);
          setStatus(recording, STATUS.ERROR);
        } catch { /* recording may not exist */ }
        handleError('stopRecording', error, recordingId);
      }
    },
    [getRecording, updateRecording, setStatus, clearMaxDurationTimer, handleError]
  );

  const startRecording = useCallback(
    async (recordingId: string): Promise<Recording | void> => {
      try {
        const recording = getRecording(recordingId);
        const stream = recording.webcamRef.current?.srcObject as MediaStream;
        recording.mimeType = recorderOptions.mimeType || recording.mimeType;

        if (
          typeof MediaRecorder === 'undefined' ||
          !MediaRecorder.isTypeSupported(recording.mimeType)
        ) {
          handleError('startRecording', ERROR_MESSAGES.CODEC_NOT_SUPPORTED, recordingId);
          return;
        }

        recording.recorder = new MediaRecorder(stream, recorderOptions);

        return await new Promise((resolve) => {
          if (recording.recorder) {
            recording.recorder.ondataavailable = (event: BlobEvent) => {
              if (event.data.size) {
                recording.blobChunks.push(event.data);
                onDataAvailable?.(recording.id, event.data);
              }
            };
            recording.recorder.onstart = async () => {
              recording.startedAt = Date.now();
              recording.totalPausedMs = 0;
              recording.pausedAt = null;
              setStatus(recording, STATUS.RECORDING);

              if (options?.maxDuration) {
                const timer = setTimeout(() => {
                  stopRecording(recording.id);
                }, options.maxDuration);
                maxDurationTimers.current.set(recording.id, timer);
              }

              const updated = await updateRecording(recording.id, recording);
              resolve(updated);
            };
            recording.recorder.onerror = (error: Event) => {
              try {
                const r = getRecording(recordingId);
                setStatus(r, STATUS.ERROR);
              } catch { /* recording may not exist */ }
              handleError('startRecording', error, recordingId);
            };
            recording.recorder.start(options?.timeSlice);
          }
        });
      } catch (error) {
        try {
          const recording = getRecording(recordingId);
          setStatus(recording, STATUS.ERROR);
        } catch { /* recording may not exist */ }
        handleError('startRecording', error, recordingId);
      }
    },
    [recorderOptions, options?.timeSlice, options?.maxDuration, getRecording, updateRecording, setStatus, stopRecording, onDataAvailable, handleError]
  );

  const pauseRecording = useCallback(
    async (recordingId: string): Promise<Recording | void> => {
      try {
        const recording = getRecording(recordingId);
        recording.recorder?.pause();
        if (recording.recorder?.state === 'paused') {
          recording.pausedAt = Date.now();
          setStatus(recording, STATUS.PAUSED);
          return await updateRecording(recording.id, recording);
        }
      } catch (error) {
        try {
          const recording = getRecording(recordingId);
          setStatus(recording, STATUS.ERROR);
        } catch { /* recording may not exist */ }
        handleError('pauseRecording', error, recordingId);
      }
    },
    [getRecording, updateRecording, setStatus, handleError]
  );

  const resumeRecording = useCallback(
    async (recordingId: string): Promise<Recording | void> => {
      try {
        const recording = getRecording(recordingId);
        recording.recorder?.resume();
        if (recording.recorder?.state === 'recording') {
          if (recording.pausedAt) {
            recording.totalPausedMs += Date.now() - recording.pausedAt;
            recording.pausedAt = null;
          }
          setStatus(recording, STATUS.RECORDING);
          return await updateRecording(recording.id, recording);
        }
      } catch (error) {
        try {
          const recording = getRecording(recordingId);
          setStatus(recording, STATUS.ERROR);
        } catch { /* recording may not exist */ }
        handleError('resumeRecording', error, recordingId);
      }
    },
    [getRecording, updateRecording, setStatus, handleError]
  );

  const muteRecording = useCallback(
    async (recordingId: string): Promise<Recording | void> => {
      try {
        const recording = getRecording(recordingId);
        recording.recorder?.stream.getAudioTracks().forEach((track) => {
          track.enabled = !track.enabled;
        });
        recording.isMuted = !recording.isMuted;
        return await updateRecording(recording.id, recording);
      } catch (error) {
        try {
          const recording = getRecording(recordingId);
          setStatus(recording, STATUS.ERROR);
        } catch { /* recording may not exist */ }
        handleError('muteRecording', error, recordingId);
      }
    },
    [getRecording, updateRecording, setStatus, handleError]
  );

  const cancelRecording = useCallback(
    async (recordingId: string): Promise<void> => {
      try {
        const recording = getRecording(recordingId);
        clearMaxDurationTimer(recordingId);
        const tracks = recording?.recorder?.stream.getTracks();
        recording?.recorder?.stop();
        tracks?.forEach((track) => track.stop());
        if (recording.recorder?.ondataavailable) {
          recording.recorder.ondataavailable = null;
        }

        if (recording.webcamRef.current) {
          const stream = recording.webcamRef.current.srcObject as MediaStream;
          stream?.getTracks().forEach((track) => track.stop());
          recording.webcamRef.current.srcObject = null;
          recording.webcamRef.current.load();
        }
        if (recording.objectURL) {
          URL.revokeObjectURL(recording.objectURL);
        }
        await deleteRecording(recording.id);
      } catch (error) {
        try {
          const recording = getRecording(recordingId);
          setStatus(recording, STATUS.ERROR);
        } catch { /* recording may not exist */ }
        handleError('cancelRecording', error, recordingId);
      }
    },
    [getRecording, deleteRecording, setStatus, clearMaxDurationTimer, handleError]
  );

  const createRecording = useCallback(
    async (
      videoId?: string,
      audioId?: string,
      createOpts?: { audioOnly?: boolean }
    ): Promise<Recording | void> => {
      try {
        const { devicesById, initialDevices } = devices || {};
        const audioOnly = createOpts?.audioOnly ?? false;

        const videoLabel = videoId
          ? devicesById?.[videoId]?.label
          : initialDevices?.video?.label;

        const audioLabel = audioId
          ? devicesById?.[audioId]?.label
          : initialDevices?.audio?.label;

        const resolvedVideoId = videoId || initialDevices?.video?.deviceId || '';
        const resolvedAudioId = audioId || initialDevices?.audio?.deviceId;

        if (!resolvedAudioId) {
          throw new Error(ERROR_MESSAGES.NO_USER_PERMISSION);
        }
        if (!audioOnly && !resolvedVideoId) {
          throw new Error(ERROR_MESSAGES.NO_USER_PERMISSION);
        }

        return await setRecording({
          videoId: resolvedVideoId,
          audioId: resolvedAudioId,
          videoLabel,
          audioLabel,
          audioOnly,
        });
      } catch (error) {
        handleError('createRecording', error);
      }
    },
    [devices, setRecording, handleError]
  );

  const applyRecordingOptions = useCallback(
    async (recordingId: string): Promise<Recording | void> => {
      try {
        const recording = getRecording(recordingId);
        if (options?.fileName) recording.fileName = options.fileName;
        if (options?.fileType) recording.fileType = options.fileType;
        return await updateRecording(recording.id, recording);
      } catch (error) {
        try {
          const recording = getRecording(recordingId);
          setStatus(recording, STATUS.ERROR);
        } catch { /* recording may not exist */ }
        handleError('applyRecordingOptions', error, recordingId);
      }
    },
    [options?.fileName, options?.fileType, getRecording, updateRecording, setStatus, handleError]
  );

  const clearPreview = useCallback(
    async (recordingId: string): Promise<Recording | void> => {
      try {
        const recording = getRecording(recordingId);
        if (recording.previewRef.current) recording.previewRef.current.src = '';
        setStatus(recording, STATUS.INITIAL);
        if (recording.objectURL) URL.revokeObjectURL(recording.objectURL);
        recording.blobChunks = [];
        recording.blob = undefined;
        recording.objectURL = null;
        recording.startedAt = null;
        recording.pausedAt = null;
        recording.totalPausedMs = 0;
        return await updateRecording(recording.id, recording);
      } catch (error) {
        try {
          const recording = getRecording(recordingId);
          setStatus(recording, STATUS.ERROR);
        } catch { /* recording may not exist */ }
        handleError('clearPreview', error, recordingId);
      }
    },
    [getRecording, updateRecording, setStatus, handleError]
  );

  const download = useCallback(
    async (recordingId: string): Promise<void> => {
      try {
        const recording = getRecording(recordingId);
        if (!recording?.objectURL) return;

        if (isIOSDevice()) {
          window.open(recording.objectURL, '_blank');
        } else {
          const a = document.createElement('a');
          a.href = recording.objectURL;
          a.download = `${recording.fileName}.${recording.fileType}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (error) {
        handleError('download', error, recordingId);
      }
    },
    [getRecording, handleError]
  );

  const getBlob = useCallback(
    (recordingId: string): Blob | undefined => {
      try {
        const recording = getRecording(recordingId);
        return recording?.blob;
      } catch {
        return undefined;
      }
    },
    [getRecording]
  );

  return {
    activeRecordings,
    applyRecordingOptions,
    clearAllRecordings,
    clearPreview,
    download,
    getBlob,
    cancelRecording,
    createRecording,
    muteRecording,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording,
  };
}
