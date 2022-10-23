import { RecordOptions } from './types';

export const DEFAULT_OPTIONS: RecordOptions = {
  aspectRatio: 1.7,
  disableLogs: true,
  fileName: String(new Date().getTime()),
  height: 720,
  mimeType: 'video/webm',
  type: 'video',
  width: 1280,
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
