import { RecordOptions } from './types';

export const DEFAULT_OPTIONS: RecordOptions = {
  type: 'video',
  mimeType: 'video/webm',
  aspectRatio: 1.7,
  fileName: String(new Date().getTime()),
  width: 1280,
  height: 720,
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
