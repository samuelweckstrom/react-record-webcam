export const DEFAULT_RECORDER_OPTIONS: MediaRecorderOptions = {
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 2500000,
  mimeType: 'video/webm;codecs=vp9',
} as const;

export const ERROR_MESSAGES = {
  BY_ID_NOT_FOUND: 'No recording by id found',
  SESSION_EXISTS: 'Recording session already exists',
} as const;

export const DEFAULT_CONSTRAINTS: MediaTrackConstraints = {
  aspectRatio: 1.7,
  echoCancellation: true,
  height: 720,
  width: 1280,
} as const;
