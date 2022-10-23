import { RecordRTCPromisesHandler } from 'recordrtc';
import type { RecordOptions } from './types';

export type Recorder = {
  stream: MediaStream & MediaStreamTrack;
} & Partial<RecordRTCPromisesHandler>;

export async function mediaRecorder(options: RecordOptions): Promise<Recorder> {
  if (!navigator.mediaDevices.getUserMedia) {
    throw new Error('Browser does not support getUserMedia');
  }
  const stream = (await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })) as MediaStream & MediaStreamTrack;

  const recordRtc = new RecordRTCPromisesHandler(stream, {
    ...options,
  });

  const supported = navigator.mediaDevices.getSupportedConstraints();
  if (!supported.width || !supported.height) {
    console.error('Media device does not support setting width/height!');
  }
  if (!supported.frameRate) {
    console.error('Media device does not support setting frameRate!');
  }
  if (supported.width || supported.height || supported.frameRate) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      if (track.kind === 'video') {
        track.applyConstraints({
          width: options.width,
          height: options.height,
          aspectRatio: options.aspectRatio,
          frameRate: options.frameRate,
        });
      }
    });
  }

  return { ...recordRtc, stream };
}
