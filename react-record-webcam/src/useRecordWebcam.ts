import React from 'react';
import { mediaRecorder } from './mediaRecorder';
import type { Recorder } from './mediaRecorder';
import type { RecordOptions, WebcamStatus } from 'react-record-webcam';

function saveFile(filename: string, blob: Blob) {
  const elem = window.document.createElement('a');
  elem.style.display = 'none';
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
}

export const DEFAULT_OPTIONS: RecordOptions = {
  aspectRatio: 1.7,
  disableLogs: true,
  fileName: String(new Date().getTime()),
  height: 720,
  mimeType: 'video/webm',
  type: 'video',
  width: 1280,
} as const;

export type UseRecordWebcam = {
  close: () => void;
  download: () => void;
  getRecording: () => Promise<Blob | unknown>;
  isMuted: boolean;
  open: () => Promise<void>;
  previewRef: React.RefObject<HTMLVideoElement>;
  retake: () => void;
  start: () => void;
  stop: () => void;
  stopStream: () => void;
  webcamRef: React.RefObject<HTMLVideoElement>;
  webcamStatus: WebcamStatus;
  muteAudio: () => void;
};

export function useRecordWebcam(options?: RecordOptions): UseRecordWebcam {
  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const previewRef = React.useRef<HTMLVideoElement>(null);
  const trackRef = React.useRef<{ tracks: MediaStreamTrack[] | null }>({
    tracks: null,
  });

  const [webcamStatus, setWebcamStatus] =
    React.useState<WebcamStatus>('CLOSED');

  const [isMuted, setIsMuted] = React.useState(false);

  const [recorder, setRecorder] = React.useState<Recorder | null>(null);

  const recorderOptions: RecordOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const stopStream = () => {
    if (recorder?.stream.id && recorder.stopRecording) recorder.stream.stop();
  };

  const close = async (): Promise<void> => {
    if (previewRef?.current) {
      previewRef.current.removeAttribute('src');
      previewRef.current.load();
    }
    setWebcamStatus('CLOSED');
    stopStream();
    await new Promise((resolve) => setTimeout(resolve, 0));
  };

  const open = async (): Promise<void> => {
    try {
      setWebcamStatus('INIT');
      const recorderInit = await mediaRecorder(recorderOptions);
      setRecorder(recorderInit);
      if (webcamRef?.current) {
        webcamRef.current.srcObject = recorderInit.stream;
      }
      setWebcamStatus('OPEN');
      await new Promise((resolve) => setTimeout(resolve, 0));
    } catch (error) {
      setWebcamStatus('ERROR');
      console.error({ error });
    }
  };

  const start = async () => {
    try {
      if (recorder?.startRecording) {
        await recorder.startRecording();
        setWebcamStatus('RECORDING');
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
      setWebcamStatus('NO_CAMERA');
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
        setWebcamStatus('PREVIEW');
        return;
      }
      throw new Error('Stop recording error!');
    } catch (error) {
      setWebcamStatus('ERROR');
      console.error({ error });
    }
  };

  const retake = async () => {
    try {
      await open();
    } catch (error) {
      setWebcamStatus('ERROR');
      console.error({ error });
    }
  };

  const download = async () => {
    try {
      if (recorder?.getBlob) {
        const blob = await recorder.getBlob();
        const fileTypeFromMimeType =
          recorderOptions.mimeType?.split('video/')[1]?.split(';')[0] || 'mp4';
        const fileType =
          fileTypeFromMimeType === 'x-matroska' ? 'mkv' : fileTypeFromMimeType;
        const filename = `${recorderOptions.fileName}.${fileType}`;
        saveFile(filename, blob);
        return;
      }
      throw new Error('Error downloading file!');
    } catch (error) {
      setWebcamStatus('ERROR');
      console.error({ error });
    }
  };

  const muteAudio = () => {
    if (!isMuted) {
      recorder?.stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    } else {
      recorder?.stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
    }
    setIsMuted(!isMuted);
  };

  const getRecording = async (): Promise<Blob | unknown> => {
    try {
      if (recorder?.getBlob) {
        const blob = await recorder?.getBlob();
        return blob;
      }
      return Promise.resolve(null);
    } catch (error) {
      setWebcamStatus('ERROR');
      console.error({ error });
      throw error;
    }
  };

  React.useEffect(() => {
    if (webcamRef.current && webcamStatus === 'OPEN') {
      const stream = webcamRef.current.srcObject as any;
      const tracks = stream?.getTracks();
      trackRef.current.tracks = tracks;
    }
  }, [webcamRef, webcamStatus]);

  React.useEffect(() => {
    return () => {
      if (trackRef.current?.tracks) {
        trackRef.current.tracks.forEach((track) => {
          track.stop();
        });
      }
      close();
    };
  }, []);

  return {
    close,
    download,
    getRecording,
    open,
    isMuted,
    previewRef,
    retake,
    start,
    stop,
    stopStream,
    webcamRef,
    webcamStatus,
    muteAudio,
  };
}
