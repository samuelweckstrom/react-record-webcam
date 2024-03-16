/**
 * Check if the browser supports the codec for recording
 * @param {string} codec - The codec to check
 * @returns {boolean} - Whether the codec is supported
 */
export function checkRecordingCodecSupport(codec: string): boolean {
  if (typeof MediaRecorder === 'undefined') return false;
  return MediaRecorder.isTypeSupported(codec);
}

/**
 * Check if the browser supports the video codec for playback
 * @param {string} codec - The codec to check
 * @returns {boolean} - Whether the codec is supported
 */
export function checkVideoCodecPlaybackSupport(codec: string): boolean {
  const video = document.createElement('video');
  const canPlay = video.canPlayType(codec);
  return canPlay === 'maybe' || canPlay === 'probably' ? true : false;
}

/**
 * Check if the browser supports the audio codec for playback
 * @param {string} codec - The codec to check
 * @returns {boolean} - Whether the codec is supported
 */
export function checkAudioCodecPlaybackSupport(codec: string): boolean {
  const audio = document.createElement('audio');
  const canPlay = audio.canPlayType(codec);
  return canPlay === 'maybe' || canPlay === 'probably' ? true : false;
}

type MediaType = 'audio' | 'video';

const audioContainers: ReadonlyArray<string> = [
  'ogg',
  'aac',
  'flac',
  'wav',
  'mp4',
];
const videoContainers: ReadonlyArray<string> = [
  'webm',
  'mp4',
  'x-matroska',
  '3gpp',
  '3gpp2',
  '3gp2',
  'quicktime',
  'mpeg',
];
const audioCodecs: ReadonlyArray<string> = ['opus', 'pcm', 'aac', 'mp4a'];
const videoCodecs: ReadonlyArray<string> = [
  'vp9',
  'vp8',
  'avc1',
  'av1',
  'h265',
  'h.264',
  'h264',
  'mpeg',
];

type SupportedMedia = {
  mimeType: string[];
  codec: string[];
  container: string[];
};

function getSupportedMediaFormats(
  containers: ReadonlyArray<string>,
  codecs: ReadonlyArray<string>,
  type: MediaType
): SupportedMedia {
  return containers.reduce<SupportedMedia>(
    (acc, container) => {
      codecs.forEach((codec) => {
        const mimeType = `${type}/${container};codecs=${codec}`;
        if (
          typeof MediaRecorder !== 'undefined' &&
          MediaRecorder.isTypeSupported(mimeType)
        ) {
          acc.mimeType.push(mimeType);
          acc.codec.push(codec);
          acc.container.push(container);
        }
      });
      return acc;
    },
    { mimeType: [], codec: [], container: [] }
  );
}

export const supportedAudioCodecs = getSupportedMediaFormats(
  audioContainers,
  audioCodecs,
  'audio'
);

export const supportedVideoCodecs = getSupportedMediaFormats(
  videoContainers,
  videoCodecs,
  'video'
);

const videoContainer = supportedVideoCodecs.container[0];
const videoCodec = supportedVideoCodecs.codec[0];
const audioCodec = supportedAudioCodecs?.codec?.[0];

export const defaultCodec = `video/${videoContainer};codecs=${videoCodec}${
  audioCodec ? `,${audioCodec}` : ''
}`;
