import { RecordWebcamOptions, RecorderOptions } from './types';

export const OPTIONS: RecordWebcamOptions = {
  filename: String(new Date().getTime()),
  recordingLength: 3,
  fileType: 'mp4',
  width: 1920,
  height: 1080,
  aspectRatio: 1.777777778,
} as const;

export const RECORDER_OPTIONS: RecorderOptions = {
  type: 'video',
  mimeType: 'video/mp4',
  disableLogs: true,
  width: 1280,
  height: 720,
  aspectRatio: 1.77,
  isNewSize: false,
} as const;

export const CAMERA_STATUS = {
  INIT: 'INIT',
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  RECORDING: 'RECORDING',
  PREVIEW: 'PREVIEW',
  ERROR: 'ERROR',
} as const;

export const BUTTON_LABELS = {
  OPEN: 'Open camera',
  CLOSE: 'Close camera',
  START: 'Start recording',
  STOP: 'Stop recording',
  RETAKE: 'Retake recording',
  DOWNLOAD: 'Download recording',
} as const;

export const NAMESPACES = {
  CSS: 'react-record-webcam',
} as const;
