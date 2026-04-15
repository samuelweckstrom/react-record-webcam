export async function startStream(
  videoId: string | undefined,
  audioId: string,
  constraints: MediaTrackConstraints,
  audioOnly?: boolean
): Promise<MediaStream> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('getUserMedia is not supported in this environment');
  }
  return navigator.mediaDevices.getUserMedia({
    video: audioOnly
      ? false
      : { ...(videoId && { deviceId: { exact: videoId } }), ...constraints },
    audio: { deviceId: { exact: audioId } },
  });
}
