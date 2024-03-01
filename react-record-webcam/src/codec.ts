/**
 * Check if the browser supports the codec for recording
 * @param {string} codec - The codec to check
 * @returns {boolean} - Whether the codec is supported
 */
export function checkCodecRecordingSupport(codec: string): boolean {
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
