import { createRef } from 'react';

type Status = 'CLOSED' | 'OPEN' | 'RECORDING' | 'RECORDED' | 'ERROR' | 'PAUSED';

export type Recording = {
  id: string;
  audioId: string;
  audioLabel?: string;
  isMuted: boolean;
  objectURL: string | null;
  previewRef: React.RefObject<HTMLVideoElement>;
  recordedChunks: Blob[];
  recorder: MediaRecorder | null;
  status: Status;
  videoId: string;
  videoLabel?: string;
  webcamRef: React.RefObject<HTMLVideoElement>;
};

export const recordingMap = new Map<string, Recording>();

type SetRecording = Pick<
  Recording,
  'videoId' | 'audioId' | 'videoLabel' | 'audioLabel'
>;

export function setRecording({
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
    isMuted: false,
    objectURL: null,
    previewRef: createRef(),
    recordedChunks: [],
    recorder: null,
    status: 'CLOSED',
    videoId,
    videoLabel,
    webcamRef: createRef(),
  };
  recordingMap.set(recordingId, recording);
  return recording;
}

export function getRecording(recordingId: string): Recording | undefined {
  return recordingMap.get(recordingId);
}

export function deleteRecording(recordingId: string): boolean {
  return recordingMap.delete(recordingId);
}
