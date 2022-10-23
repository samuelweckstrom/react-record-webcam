import React from 'react';
import { mediaRecorder } from '../mediaRecorder';
import { saveFile } from '../utils';
import { DEFAULT_OPTIONS } from '../constants';
import type { Recorder } from '../mediaRecorder';
import type { RecordOptions, WebcamStatus } from '../types';

export type UseRecordWebcam = {
  previewRef: React.RefObject<HTMLVideoElement>;
  status: WebcamStatus;
  webcamRef: React.RefObject<HTMLVideoElement>;
  close: () => void;
  download: () => void;
  getRecording: () => void;
  open: () => void;
  retake: () => void;
  start: () => void;
  stop: () => void;
  stopStream: () => void;
};

export function useRecordWebcam(options?: RecordOptions): UseRecordWebcam {
  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const previewRef = React.useRef<HTMLVideoElement>(null);
  const [status, setStatus] = React.useState<WebcamStatus>('CLOSED');
  const [recorder, setRecorder] = React.useState<Recorder | null>(null);

  const recorderOptions: RecordOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const openCamera = async () => {
    try {
      const recorderInit = await mediaRecorder(recorderOptions);
      setRecorder(recorderInit);
      if (webcamRef?.current) {
        webcamRef.current.srcObject = recorderInit.stream;
      }
      await new Promise((resolve) => setTimeout(resolve, 1700));
    } catch (error) {
      setStatus('ERROR');
      console.error({ error });
    }
  };

  const stopStream = () => {
    if (recorder?.stream.id && recorder.stopRecording) recorder.stream.stop();
  };

  const close = () => {
    if (previewRef?.current) {
      previewRef.current.removeAttribute('src');
      previewRef.current.load();
    }
    setStatus('CLOSED');
    stopStream();
  };

  const open = async () => {
    try {
      setStatus('INIT');
      await openCamera();
      setStatus('OPEN');
    } catch (error) {
      setStatus('ERROR');
      console.error({ error });
    }
  };

  const start = async () => {
    try {
      if (recorder?.startRecording) {
        await recorder.startRecording();
        setStatus('RECORDING');
        if (recorderOptions?.recordingLength) {
          const length = recorderOptions.recordingLength * 1000;
          await new Promise((resolve) => setTimeout(resolve, length));
          await stop();
          stopStream();
        }
        return;
      }
      throw new Error('Recorder not initialized!');
    } catch (error) {
      setStatus('ERROR');
      console.error({ error });
    }
  };

  const stop = async () => {
    try {
      if (recorder?.stopRecording && recorder?.getBlob) {
        await recorder.stopRecording();
        const blob = await recorder.getBlob();
        const preview = window.URL.createObjectURL(blob);
        if (previewRef.current) {
          previewRef.current.src = preview;
        }
        stopStream();
        setStatus('PREVIEW');
        return;
      }
      throw new Error('Stop recording error!');
    } catch (error) {
      setStatus('ERROR');
      console.error({ error });
    }
  };

  const retake = async () => {
    try {
      await open();
    } catch (error) {
      setStatus('ERROR');
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
      setStatus('ERROR');
      console.error({ error });
    }
  };

  const getRecording = async () => {
    try {
      if (recorder?.getBlob) {
        const blob = await recorder.getBlob();
        return blob;
      }
      return null;
    } catch (error) {
      setStatus('ERROR');
      console.error({ error });
      return null;
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
