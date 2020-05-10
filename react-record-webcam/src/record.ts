// @ts-ignore
import { RecordRTCPromisesHandler } from 'recordrtc';
import { RecorderOptions, Recorder } from './types';

type CaptureUserMedia = {
  stream: MediaStream;
  recordRtc: Recorder;
};

async function captureUserMedia(
  options: RecorderOptions
): Promise<CaptureUserMedia> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  const recordRtc = new RecordRTCPromisesHandler(stream, { ...options });
  return { stream, recordRtc };
}

async function recorder(options: RecorderOptions): Promise<Recorder> {
  if (!navigator.mediaDevices.getUserMedia) {
    throw new Error('Browser does not support getUserMedia');
  }
  const { stream, recordRtc } = await captureUserMedia(options);
  const { startRecording, stopRecording, getBlob, getDataURL } = recordRtc;
  return { stream, startRecording, stopRecording, getBlob, getDataURL };
}

export { captureUserMedia };
export default recorder;
