import React from 'react';
import { mediaRecorder } from '../mediaRecorder';
import { saveFile } from '../utils';
import {
  RecorderOptions,
  Recorder,
  RecordWebcamHook,
  RecordWebcamOptions,
} from '../types';
import { CAMERA_STATUS, RECORDER_OPTIONS } from '../constants';

export function useRecordWebcam(
  options?: RecordWebcamOptions
): RecordWebcamHook {
  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const previewRef = React.useRef<HTMLVideoElement>(null);
  const [status, setStatus] = React.useState<keyof typeof CAMERA_STATUS>(
    CAMERA_STATUS.CLOSED
  );
  const [recorder, setRecorder] = React.useState<Recorder | null>(null);

  const [recorderOptions, setRecorderOptions] =
    React.useState<RecorderOptions>(RECORDER_OPTIONS);

  React.useEffect(() => {
    if (options) {
      setRecorderOptions({
        ...RECORDER_OPTIONS,
        mimeType: `video/${options.fileType || 'mp4'};codecs=${
          options?.codec?.video || options.fileType === 'webm' ? 'vp8' : 'avc'
        },${
          options?.codec?.audio || options.fileType === 'webm' ? 'opus' : 'aac'
        }`,
        width: options.width || RECORDER_OPTIONS.width,
        height: options.height || RECORDER_OPTIONS.height,
        aspectRatio: options?.aspectRatio || RECORDER_OPTIONS.aspectRatio,
        isNewSize: Boolean(options?.width || options?.height),
      });
    }
  }, []);

  const openCamera = async () => {
    const recorderInit = await mediaRecorder(recorderOptions);
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
        if (options?.recordingLength) {
          const length = options.recordingLength * 1000;
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
        const filename = `${options?.filename || new Date().getTime()}.${
          options?.fileType || 'mp4'
        }`;
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
