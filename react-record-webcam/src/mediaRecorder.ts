// @ts-ignore
import { RecordRTCPromisesHandler } from 'recordrtc';
import { RecorderOptions, Recorder } from './types';

type CaptureUserMedia = {
  stream: MediaStream;
  recordRtc: any;
};

export async function captureUserMedia(
  options: RecorderOptions
): Promise<CaptureUserMedia> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const recordRtc = new RecordRTCPromisesHandler(stream, {
    ...options,
  });
  return { stream, recordRtc };
}

export async function mediaRecorder(
  options: RecorderOptions
): Promise<Recorder> {
  if (!navigator.mediaDevices.getUserMedia) {
    throw new Error('Browser does not support getUserMedia');
  }
  const { stream, recordRtc } = await captureUserMedia(options);

  const supported = navigator.mediaDevices.getSupportedConstraints();
  if (!supported.width || !supported.height) {
    console.error('Media device does not support setting width/height!');
  }
  if (options.isNewSize && supported.width && supported.height) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      if (track.kind === 'video') {
        track.applyConstraints({
          width: options.width,
          height: options.height,
          aspectRatio: options.aspectRatio,
        });
      }
    });
  }

  return { ...recordRtc, stream };
}
