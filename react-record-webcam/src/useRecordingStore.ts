import { createRef } from 'react';

import { createStore, useStore } from './store';

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
  /**
   * @property {string} id - The ID of the recording.
   */
  id: string;
  /**
   * @property {string} id - The ID of the audio device.
   */
  audioId: string;
  /**
   * @property {string} [audioLabel] - The label of the audio device.
   */
  audioLabel?: string;
  /**
   * @property {Blob} [blob] - The blob of the recording.
   */
  blob?: Blob;
  /**
   * @property {Blob[]} blobChunks - Single blob or chunks per timeslice of the recording.
   */
  blobChunks: Blob[];
  /**
   * @property {string} fileName - The name of the file.
   */
  fileName: string;
  /**
   * @property {string} fileType - The type of the file.
   */
  fileType: string;
  /**
   * @property {boolean} isMuted - Whether the recording is muted.
   */
  isMuted: boolean;
  /**
   * @property {string} mimeType - The MIME type of the recording.
   */
  mimeType: string;
  /**
   * @property {string | null} objectURL - The object URL of the recording.
   */
  objectURL: string | null;
  /**
   * @property {React.RefObject<HTMLVideoElement>} previewRef - React Ref for the preview element.
   */
  previewRef: React.RefObject<HTMLVideoElement>;
  /**
   * @property {MediaRecorder | null} recorder - The MediaRecoder instance of the recording.
   */
  recorder: MediaRecorder | null;
  /**
   * @property {Status} status - The status of the recording.
   */
  status: Status;
  /**
   * @property {string} videoId - The ID of the video device.
   */
  videoId: string;
  /**
   * @property {string} [videoLabel] - The label of the video device.
   */
  videoLabel?: string;
  /**
   * @property {React.RefObject<HTMLVideoElement>} webcamRef - React Ref for the webcam element.
   */
  webcamRef: React.RefObject<HTMLVideoElement>;
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

  const recording: Recording = {
    id: recordingId,
    audioId,
    audioLabel,
    blobChunks: [],
    fileName: String(new Date().getTime()),
    fileType: 'webm',
    isMuted: false,
    mimeType: 'video/webm;codecs=vp9',
    objectURL: null,
    previewRef: createRef(),
    recorder: null,
    status: STATUS.INITIAL,
    videoId,
    videoLabel,
    webcamRef: createRef(),
  };
  return recording;
}

export type RecordingError = {
  recordingId?: string;
  message: string;
};

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

const recordingMap: Map<string, Recording> = new Map();
const store = createStore(recordingMap);

export function useRecordingStore(): RecordingStore {
  const { state } = useStore(store);
  const activeRecordings = Array.from(recordingMap?.values?.());

  const clearAllRecordings = async (): Promise<void> => {
    Array.from(state.values()).forEach((recording) => {
      const stream = <MediaStream>recording.webcamRef.current?.srcObject;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });
    state.clear(true);
  };

  const isRecordingCreated = (recordingId: string): boolean => {
    const isCreated = state.get(recordingId);
    return Boolean(isCreated);
  };

  const getRecording = (recordingId: string): Recording => {
    const recording = state.get(recordingId);
    if (!recording) {
      throw new Error(ERROR_MESSAGES.NO_RECORDING_WITH_ID);
    }
    return recording;
  };

  const setRecording = async (params: SetRecording): Promise<Recording> => {
    const recording = createRecording(params);
    const newRecording = state.set(recording.id, recording, true);
    return newRecording;
  };

  const updateRecording = async (
    recordingId: string,
    updatedValues: Partial<Recording>
  ): Promise<Recording> => {
    const recording = <Recording>state.get(recordingId);
    const updatedRecording = state.set(
      recordingId,
      {
        ...recording,
        ...updatedValues,
      },
      true
    );
    return updatedRecording;
  };

  const deleteRecording = async (recordingId: string): Promise<void> => {
    state.delete(recordingId, true);
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
