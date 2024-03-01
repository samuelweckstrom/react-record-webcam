import { STATUS } from '../../useRecordingStore';
import { audio, video } from './device.mock';

export const mockRecording = {
  id: `${video[0].deviceId}-${audio[0].deviceId}`,
  audioId: audio[0].deviceId,
  audioLabel: audio[0].label,
  blobChunks: null,
  fileName: String(new Date().getTime()),
  fileType: 'webm',
  isMuted: false,
  mimeType: 'video/webm;codecs=vp9',
  objectURL: null,
  previewRef: { current: null },
  recorder: null,
  status: STATUS.INITIAL,
  videoId: video[0].deviceId,
  videoLabel: video[0].label,
  webcamRef: { current: null },
};
