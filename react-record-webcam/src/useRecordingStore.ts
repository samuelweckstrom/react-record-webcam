import { createRef, useCallback } from 'react';

import { ExternalStore, useExternalStore } from './store';
import { defaultCodec, videoContainer } from './codec';

export const ERROR_MESSAGES = {
  CODEC_NOT_SUPPORTED: 'CODEC_NOT_SUPPORTED',
  SESSION_EXISTS: 'SESSION_EXISTS',
  NO_RECORDING_WITH_ID: 'NO_RECORDING_WITH_ID',
  NO_USER_PERMISSION: 'NO_USER_PERMISSION',
} as const;

export const STATUS = {
  INITIAL: 'INITIAL',
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  RECORDING: 'RECORDING',
  STOPPED: 'STOPPED',
  ERROR: 'ERROR',
  PAUSED: 'PAUSED',
} as const;

export type Status = keyof typeof STATUS;

export type Recording = {
  id: string;
  audioId: string;
  audioLabel?: string;
  audioOnly: boolean;
  blob?: Blob;
  blobChunks: Blob[];
  fileName: string;
  fileType: string;
  isMuted: boolean;
  mimeType: string;
  objectURL: string | null;
  pausedAt: number | null;
  previewRef: React.RefObject<HTMLVideoElement | null>;
  recorder: MediaRecorder | null;
  startedAt: number | null;
  status: Status;
  totalPausedMs: number;
  videoId: string;
  videoLabel?: string;
  webcamRef: React.RefObject<HTMLVideoElement | null>;
};

export type RecordingError = {
  code: string;
  message: string;
  recordingId?: string;
};

type SetRecording = Pick<
  Recording,
  'videoId' | 'audioId' | 'videoLabel' | 'audioLabel'
> & { audioOnly?: boolean };

let idCounter = 0;

export function createRecording({
  videoId,
  audioId,
  videoLabel,
  audioLabel,
  audioOnly,
}: SetRecording): Recording {
  idCounter++;
  const recordingId = audioOnly
    ? `audio-${audioId}-${idCounter}`
    : `${videoId}-${audioId}-${idCounter}`;

  return {
    id: recordingId,
    audioId,
    audioLabel,
    audioOnly: audioOnly ?? false,
    blobChunks: [],
    fileName: String(new Date().getTime()),
    fileType: videoContainer || 'webm',
    isMuted: false,
    mimeType: defaultCodec,
    objectURL: null,
    pausedAt: null,
    previewRef: createRef(),
    recorder: null,
    startedAt: null,
    status: STATUS.INITIAL,
    totalPausedMs: 0,
    videoId,
    videoLabel,
    webcamRef: createRef(),
  };
}

type RecordingStore = {
  activeRecordings: Recording[];
  clearAllRecordings: () => Promise<void>;
  deleteRecording: (recordingId: string) => Promise<void>;
  getRecording: (recordingId: string) => Recording;
  isRecordingCreated: (recordingId: string) => boolean;
  setRecording: (params: SetRecording) => Promise<Recording>;
  updateRecording: (
    recordingId: string,
    recording: Partial<Recording>
  ) => Promise<Recording>;
};

const store = new ExternalStore<Recording>();

export function useRecordingStore(): RecordingStore {
  const activeRecordings = useExternalStore(store);

  const clearAllRecordings = useCallback(async (): Promise<void> => {
    for (const recording of store.values()) {
      const stream = recording.webcamRef.current?.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
    store.clear();
  }, []);

  const isRecordingCreated = (recordingId: string): boolean => {
    return store.has(recordingId);
  };

  const getRecording = (recordingId: string): Recording => {
    const recording = store.get(recordingId);
    if (!recording) {
      throw new Error(ERROR_MESSAGES.NO_RECORDING_WITH_ID);
    }
    return recording;
  };

  const setRecording = async (params: SetRecording): Promise<Recording> => {
    const recording = createRecording(params);
    return store.set(recording.id, recording);
  };

  const updateRecording = async (
    recordingId: string,
    updatedValues: Partial<Recording>
  ): Promise<Recording> => {
    const recording = store.get(recordingId);
    return store.set(recordingId, { ...recording, ...updatedValues } as Recording);
  };

  const deleteRecording = async (recordingId: string): Promise<void> => {
    store.delete(recordingId);
  };

  return {
    activeRecordings,
    clearAllRecordings,
    deleteRecording,
    getRecording,
    isRecordingCreated,
    setRecording,
    updateRecording,
  };
}
