import React from 'react';
import record from './record';
import { saveFile } from './utils';
import { RecorderOptions, Recorder, CAMERA_STATUS } from './types';

const DEFAULT_OPTIONS: RecorderOptions = Object.freeze({
  type: 'video',
  mimeType: 'video/mp4',
  video: {
    minWidth: 1280,
    minHeight: 720,
    maxWidth: 1920,
    maxHeight: 1080,
    minAspectRatio: 1.77,
  },
});

type useRecordWebcamArgs = {
  downloadFileName?: string;
  recordingLength?: number;
  options?: RecorderOptions;
};

export function useRecordWebcam(args?: useRecordWebcamArgs) {
  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const previewRef = React.useRef<HTMLVideoElement>(null);
  const [status, setStatus] = React.useState<CAMERA_STATUS>(
    CAMERA_STATUS.CLOSED
  );
  const [recorder, setRecorder] = React.useState<Recorder | null>(null);

  const openCamera = async () => {
    const recorderInit = await record(args?.options || DEFAULT_OPTIONS);
    setRecorder(recorderInit);
    if (webcamRef?.current) {
      webcamRef.current.srcObject = recorderInit.stream;
    }
    await new Promise((resolve) => setTimeout(resolve, 1700));
  };

  const stopStream = () => {
    if (recorder?.stream.id) recorder.stream.stop();
  };

  const close = () => {
    if (previewRef?.current) {
      previewRef.current.removeAttribute('src');
      previewRef.current.load();
    }
    setStatus(CAMERA_STATUS.CLOSED);
    stopStream();
  };

  const open = async () => {
    try {
      setStatus(CAMERA_STATUS.INIT);
      await openCamera();
      setStatus(CAMERA_STATUS.OPEN);
    } catch (error) {
      setStatus(CAMERA_STATUS.ERROR);
      console.error({ error });
    }
  };

  const stop = async () => {
    try {
      if (recorder?.stopRecording) {
        await recorder.stopRecording();
        const blob = await recorder.getBlob();
        const preview = window.URL.createObjectURL(blob);
        if (previewRef.current) {
          previewRef.current.src = preview;
        }
        stopStream();
        setStatus(CAMERA_STATUS.PREVIEW);
        return;
      }
      throw new Error('Stop recording error!');
    } catch (error) {
      setStatus(CAMERA_STATUS.ERROR);
      console.error({ error });
    }
  };

  const start = async () => {
    try {
      if (recorder?.startRecording) {
        await recorder.startRecording();
        setStatus(CAMERA_STATUS.RECORDING);
        if (args?.recordingLength) {
          const length = args.recordingLength * 1000;
          await new Promise((resolve) => setTimeout(resolve, length));
          await stop();
          stopStream();
        }
        return;
      }
      throw new Error('Recorder not initialized!');
    } catch (error) {
      setStatus(CAMERA_STATUS.ERROR);
      console.error({ error });
    }
  };

  const retake = async () => {
    try {
      await open();
    } catch (error) {
      setStatus(CAMERA_STATUS.ERROR);
      console.error({ error });
    }
  };

  const download = async () => {
    try {
      if (recorder?.getBlob) {
        const blob = await recorder.getBlob();
        const filename = args?.downloadFileName
          ? `${args.downloadFileName}.mp4`
          : `${new Date().getTime()}.mp4`;
        saveFile(filename, blob);
        return;
      }
      throw new Error('Error downloading file!');
    } catch (error) {
      setStatus(CAMERA_STATUS.ERROR);
      console.error({ error });
    }
  };

  const getRecording = async () => {
    try {
      return await recorder?.getBlob();
    } catch (error) {
      setStatus(CAMERA_STATUS.ERROR);
      console.error({ error });
      return;
    }
  };

  return {
    close,
    download,
    open,
    previewRef,
    retake,
    getRecording,
    start,
    status,
    stop,
    stopStream,
    webcamRef,
  };
}
