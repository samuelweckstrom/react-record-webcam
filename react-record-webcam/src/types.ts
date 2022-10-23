import type { Options } from 'recordrtc';

export type RecordOptions = {
  aspectRatio?: number;
  fileName?: string;
  frameRate?: number;
  height?: number;
  filename?: string;
  recordingLength?: number;
  width?: number;
} & Options;

export type WebcamStatus =
  | 'INIT'
  | 'CLOSED'
  | 'OPEN'
  | 'RECORDING'
  | 'PREVIEW'
  | 'ERROR';
