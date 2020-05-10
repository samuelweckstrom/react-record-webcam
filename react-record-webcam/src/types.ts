type RecordingType = 'video' | 'audio';
type RecordingMimeType =
  | 'video/mp4'
  | 'audio/webm'
  | 'video/webm;codecs=vp9'
  | 'video/webm;codecs=vp8'
  | 'video/webm;codecs=h264';

export type RecorderOptions = {
  type: RecordingType;
  mimeType: RecordingMimeType;
  video: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    minAspectRatio: number;
  };
};

export type Recorder = {
  startRecording(): Promise<void>;
  stopRecording(): Promise<void>;
  getDataURL(): Promise<string>;
  getBlob(): Promise<Blob>;
  stream: MediaStream;
};

export enum CAMERA_STATUS {
  INIT = 'Starting camera ...',
  CLOSED = 'Camera is closed',
  OPEN = 'Camera is open',
  RECORDING = 'Recording ...',
  PREVIEW = 'Preview',
  ERROR = 'Error',
}

export enum BUTTON_LABELS {
  OPEN = 'Open camera',
  CLOSE = 'Close camera',
  START = 'Start recording',
  STOP = 'Stop recording',
  RETAKE = 'Retake recording',
  DOWNLOAD = 'Download recording',
}

export enum NAMESPACES {
  CSS = 'react-record-webcam',
}
