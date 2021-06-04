type AudioCodec = 'aac' | 'opus';
type VideoCodec = 'av1' | 'avc' | 'vp8';

export type FileMimeType = 'video/mp4' | 'video/webm';
export type FileType = 'mp4' | 'webm';

export type RecordingOptions = {
  mimeType: FileMimeType;
};

export type RecorderOptions = {
  aspectRatio: number;
  height: number;
  type: 'video';
  width: number;
  isNewSize?: boolean;
  mimeType?: string;
  mute?: boolean;
  disableLogs?: boolean;
};

export type RecordWebcamOptions = {
  codec?: {
    audio: AudioCodec;
    video: VideoCodec;
  };
  filename?: string;
  recordingLength?: number;
  fileType?: FileType;
  width?: number;
  height?: number;
  aspectRatio?: number;
};

export type WebcamRenderProps = {
  isPreview: boolean;
  isRecording: boolean;
  isWebcamOn: boolean;
  status: string;
  closeCamera(): void;
  download(): void;
  getRecording(): Blob | undefined;
  openCamera(): void;
  retake(): void;
  start(): void;
  stop(): void;
};

export type RecordWebcamHook = {
  previewRef: React.RefObject<HTMLVideoElement>;
  status: string | number;
  webcamRef: React.RefObject<HTMLVideoElement>;
  close(): void;
  download(): void;
  getRecording(): void;
  open(): void;
  retake(): void;
  start(): void;
  stop(): void;
  stopStream(): void;
};

export type Recorder = {
  stream: any;
  getBlob(): Promise<Blob>;
  getDataURL(): Promise<string>;
  startRecording(): Promise<void>;
  stopRecording(): Promise<void>;
};
