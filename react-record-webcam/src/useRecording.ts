import { createRef, useState, useCallback } from 'react';
import { ERROR_MESSAGES } from './constants';

export enum STATUS {
  INITIAL = 'INITIAL',
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  RECORDING = 'RECORDING',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR',
  PAUSED = 'PAUSED',
}

export type Status = keyof typeof STATUS;

export type Recording = {
  id: string;
  audioId: string;
  audioLabel?: string;
  fileName: string;
  fileType: string;
  isMuted: boolean;
  mimeType: string;
  objectURL: string | null;
  onDataAvailableResolve: Function | null;
  onDataAvailablePromise: Promise<void>;
  previewRef: React.RefObject<HTMLVideoElement>;
  recorder: MediaRecorder | null;
  status: Status;
  videoId: string;
  videoLabel?: string;
  webcamRef: React.RefObject<HTMLVideoElement>;
  blobs: Blob[];
};

type SetRecording = Pick<
  Recording,
  'videoId' | 'audioId' | 'videoLabel' | 'audioLabel'
>;

export function createRecording({
  videoId,
  audioId,
  videoLabel,
  audioLabel,
}: SetRecording): Recording {
  const recordingId = `${videoId}-${audioId}`;
  let onDataAvailableResolve = null;
  const onDataAvailablePromise = new Promise<void>((resolve) => {
    onDataAvailableResolve = resolve;
  });

  const recording: Recording = {
    id: recordingId,
    audioId,
    audioLabel,
    fileName: String(new Date().getTime()),
    fileType: 'webm',
    isMuted: false,
    mimeType: 'video/webm;codecs=vp9',
    objectURL: null,
    onDataAvailableResolve,
    onDataAvailablePromise,
    previewRef: createRef(),
    recorder: null,
    status: STATUS.INITIAL,
    videoId,
    videoLabel,
    webcamRef: createRef(),
    blobs: [],
  };
  return recording;
}

export type RecordingError = {
  recordingId?: string;
  error: unknown;
};

const recordingMap = new Map<string, Recording>();

export function useRecording(isDevMode?: boolean) {
  const [activeRecordings, setActiveRecordings] = useState<Recording[]>([]);
  const [errorMessage, setErrorMessage] = useState<RecordingError | null>(null);

  const updateActiveRecordings = async () => {
    const recordings = Array.from(recordingMap.values());
    setActiveRecordings(recordings);
  };

  const isRecordingCreated = useCallback(
    (recordingId: string): boolean => {
      const isCreated = recordingMap.get(recordingId);
      return Boolean(isCreated);
    },
    [recordingMap]
  );

  const getRecording = useCallback(
    (recordingId: string): Recording => {
      const recording = recordingMap.get(recordingId);
      if (!recording) {
        throw new Error(ERROR_MESSAGES.BY_ID_NOT_FOUND);
      }
      return recording;
    },
    [recordingMap]
  );

  const setRecording = useCallback(
    async (params: SetRecording): Promise<Recording> => {
      const recording = createRecording(params);
      recordingMap.set(recording.id, recording);
      await updateActiveRecordings();
      return recording;
    },
    [recordingMap]
  );

  const updateRecording = useCallback(
    async (
      recordingId: string,
      updatedValues: Partial<Recording>
    ): Promise<Recording> => {
      const recording = <Recording>recordingMap.get(recordingId);
      recordingMap.set(recordingId, {
        ...recording,
        ...updatedValues,
      });
      await updateActiveRecordings();
      return getRecording(recordingId);
    },
    [recordingMap, setRecording, getRecording]
  );

  const deleteRecording = useCallback(
    async (recordingId: string): Promise<void> => {
      recordingMap.delete(recordingId);
      await updateActiveRecordings();
    },
    [recordingMap]
  );

  const clearAllRecordings = async (): Promise<void> => {
    Array.from(recordingMap.values()).forEach((recording) => {
      const stream = <MediaStream>recording.webcamRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });
    recordingMap.clear();
    setActiveRecordings([]);
  };

  const handleError = async (
    functionName: string,
    error: unknown,
    recordingId?: string
  ): Promise<Recording | Error> => {
    if (isDevMode) {
      console.error(`@${functionName}: `, error);
    }
    if (recordingId) {
      const recording = getRecording(recordingId);
      setErrorMessage({ recordingId: recordingId, error });
      if (recording) recording.status = STATUS.ERROR;
    }
    throw error;
  };

  return {
    activeRecordings,
    clearAllRecordings,
    deleteRecording,
    errorMessage,
    getRecording,
    handleError,
    isRecordingCreated,
    setRecording,
    updateRecording,
  };
}
