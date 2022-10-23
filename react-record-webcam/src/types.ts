import type { Options } from 'recordrtc';
type AudioCodec = 'aac' | 'opus';
type VideoCodec = 'av1' | 'avc' | 'vp8';

export type FileMimeType = 'video/mp4' | 'video/webm';
export type FileType = 'mp4' | 'webm';

export type RecordOptions = {
  aspectRatio?: number;
  fileName?: string;
  frameRate?: number;
  height?: number;
  codec?: {
    audio: AudioCodec;
    video: VideoCodec;
  };
  filename?: string;
  fileType?: FileType;
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
