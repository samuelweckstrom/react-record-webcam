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

export type WebcamRenderProps = {
  status: string;
  isWebcamOn: boolean;
  isPreview: boolean;
  isRecording: boolean;
  openCamera(): void;
  closeCamera(): void;
  retake(): void;
  start(): void;
  stop(): void;
  download(): void;
  getRecording(): Blob | undefined;
};
export type Recorder = {
  startRecording(): Promise<void>;
  stopRecording(): Promise<void>;
  getDataURL(): Promise<string>;
  getBlob(): Promise<Blob>;
  stream: any;
};

export enum CAMERA_STATUS {
  INIT = 'INIT',
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  RECORDING = 'RECORDING',
  PREVIEW = 'PREVIEW',
  ERROR = 'ERROR',
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
