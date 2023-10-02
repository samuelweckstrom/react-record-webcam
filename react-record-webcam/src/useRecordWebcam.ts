import { useState } from 'react';
import {
  deleteRecording,
  getRecording,
  recordingMap,
  setRecording,
} from './recording';
import { useDeviceInitialization, useDeviceSelection } from './devices';
import { startStream } from './stream';
import {
  DEFAULT_CONSTRAINTS,
  DEFAULT_OPTIONS,
  DEFAULT_RECORDER_OPTIONS,
  ERROR_MESSAGES,
} from './constants';
import { handleError } from './utils';
import type { Recording } from './recording';

type Options = {
  fileName: string;
  fileType: string;
};

type UseRecorder = {
  constraints: MediaTrackConstraints;
  recorderOptions: MediaRecorderOptions;
  options: Options;
};

export function useRecordWebcam(args?: UseRecorder) {
  const [activeRecordings, setActiveRecordings] = useState<Recording[]>([]);
  const { devicesByType, devicesById } = useDeviceInitialization();
  const { selectedDevices, setInput } = useDeviceSelection(devicesById);

  const constraints: MediaTrackConstraints = {
    ...DEFAULT_CONSTRAINTS,
    ...args?.constraints,
  };

  const recorderOptions: MediaRecorderOptions = {
    ...DEFAULT_RECORDER_OPTIONS,
    ...args?.recorderOptions,
  };

  const options: Options = { ...DEFAULT_OPTIONS, ...args?.options };

  const updateRecordings = () => {
    const allActiveSessions = Array.from(recordingMap.values());
    setActiveRecordings(allActiveSessions);
  };

  const createRecordingSession = async (
    videoId: string,
    audioId: string
  ): Promise<Recording | undefined> => {
    let recording: Recording | undefined;
    try {
      const videoLabel = devicesById?.[videoId].label;
      const audioLabel = devicesById?.[audioId].label;
      recording = setRecording({
        videoId,
        audioId,
        videoLabel,
        audioLabel,
      });
    } catch (error) {
      handleError('createRecordingSession', error, recording);
    } finally {
      updateRecordings();
      return recording;
    }
  };

  const openCamera = async (): Promise<Recording | undefined> => {
    let recording: Recording | undefined;
    try {
      const { videoId, audioId } = selectedDevices;
      recording = getRecording(`${videoId}-${audioId}`);
      if (recording) {
        throw new Error(ERROR_MESSAGES.SESSION_EXISTS);
      } else {
        recording = await createRecordingSession(
          <string>videoId,
          <string>audioId
        );
        const stream = await startStream(
          <string>videoId,
          <string>audioId,
          constraints
        );
        if (recording?.webcamRef.current) {
          recording.webcamRef.current.srcObject = stream;
          recording.webcamRef.current.play();
          recording.status = 'OPEN';
        }
      }
    } catch (error) {
      handleError('openCamera', error, recording);
    } finally {
      updateRecordings();
      return recording;
    }
  };

  const closeCamera = async (
    recordingId: string
  ): Promise<Recording | undefined> => {
    let recording: Recording | undefined;
    try {
      recording = getRecording(recordingId);
      if (!recording) throw new Error(ERROR_MESSAGES.BY_ID_NOT_FOUND);
      if (recording?.webcamRef.current) {
        const stream = <MediaStream>recording.webcamRef.current.srcObject;
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        recording.webcamRef.current.srcObject = null;
        recording.webcamRef.current.load();
        recording.recorder?.stop();
        recording.status = 'CLOSED';
      }
    } catch (error) {
      handleError('closeCamera', error, recording);
    } finally {
      updateRecordings();
      return recording;
    }
  };

  const clearPreview = async (
    recordingId: string
  ): Promise<Recording | undefined> => {
    let recording: Recording | undefined;
    try {
      recording = getRecording(recordingId);
      if (!recording) throw new Error(ERROR_MESSAGES.BY_ID_NOT_FOUND);
      recording.recordedChunks.length = 0;
      if (recording.previewRef.current) {
        recording.previewRef.current.src = '';
        recording.status = 'CLOSED';
      }
    } catch (error) {
      handleError('clearPreview', error, recording);
    } finally {
      updateRecordings();
      return recording;
    }
  };

  const startRecording = async (
    recordingId: string
  ): Promise<Recording | undefined> => {
    let recording: Recording | undefined;
    try {
      recording = getRecording(recordingId);
      if (!recording) throw new Error(ERROR_MESSAGES.BY_ID_NOT_FOUND);
      recording.recordedChunks.length = 0;
      const stream = <MediaStream>recording.webcamRef.current?.srcObject;
      const recorder = new MediaRecorder(stream, recorderOptions);
      recording.status = 'RECORDING';
      recording.recorder = recorder;
      recorder.start();
    } catch (error) {
      handleError('startRecording', error, recording);
    } finally {
      updateRecordings();
      return recording;
    }
  };

  const pauseRecording = async (
    recordingId: string
  ): Promise<Recording | undefined> => {
    let recording: Recording | undefined;
    try {
      recording = getRecording(recordingId);
      if (!recording) return;
      recording.recorder?.pause();
      if (recording) recording.status = 'PAUSED';
    } catch (error) {
      handleError('pauseRecording', error, recording);
    } finally {
      updateRecordings();
      return recording;
    }
  };

  const resumeRecording = async (
    recordingId: string
  ): Promise<Recording | undefined> => {
    let recording: Recording | undefined;
    try {
      recording = getRecording(recordingId);
      if (!recording) return;
      recording.recorder?.resume();
      if (recording) recording.status = 'RECORDING';
    } catch (error) {
      handleError('resumeRecording', error, recording);
    } finally {
      updateRecordings();
      return recording;
    }
  };

  const download = async (recordingId: string): Promise<void> => {
    try {
      const recording = getRecording(recordingId);
      const downloadElement = document.createElement('a');
      if (recording?.objectURL) {
        downloadElement.href = recording.objectURL;
      }
      downloadElement.download = `${options.fileName}.${options.fileType}`;
      downloadElement.click();
    } catch (error) {
      handleError('download', error);
    }
  };

  const stopRecording = async (
    recordingId: string
  ): Promise<Recording | void> => {
    let recording: Recording | undefined;
    try {
      recording = getRecording(recordingId);
      if (!recording) throw new Error(ERROR_MESSAGES.BY_ID_NOT_FOUND);
      recording.recorder?.stop();
      recording.status = 'RECORDED';
      if (!recording.recorder) return;
      recording.recorder.ondataavailable = (event: BlobEvent) => {
        if (recording && event.data.size) {
          const blob = new Blob([event.data], {
            type: `video/${options.fileType}`,
          });
          const url = URL.createObjectURL(blob);
          recording.objectURL = url;
          if (recording.previewRef.current) {
            recording.previewRef.current.src = url;
          }
        }
      };
    } catch (error) {
      handleError('stopRecording', error, recording);
    } finally {
      updateRecordings();
      return recording;
    }
  };

  const cancelRecording = async (recordingId: string): Promise<undefined> => {
    let recording: Recording | undefined;
    try {
      recording = getRecording(recordingId);
      if (!recording) throw new Error(ERROR_MESSAGES.BY_ID_NOT_FOUND);
      const tracks = recording?.recorder?.stream.getTracks();
      recording?.recorder?.stop();
      tracks?.forEach((track) => track.stop());
      deleteRecording(recordingId);
    } catch (error) {
      handleError('cancelRecording', error, recording);
    } finally {
      updateRecordings();
    }
  };

  const muteRecording = async (
    recordingId: string
  ): Promise<Recording | undefined> => {
    let recording: Recording | undefined;
    try {
      recording = getRecording(recordingId);
      if (!recording) return;
      recording.recorder?.stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      recording.isMuted = !recording.isMuted;
    } catch (error) {
      handleError('muteRecording', error, recording);
    } finally {
      updateRecordings();
      return recording;
    }
  };

  const applyConstraints = async (
    recordingId: string,
    constraints: MediaTrackConstraints
  ): Promise<Recording | undefined> => {
    let recording: Recording | undefined;
    try {
      recording = getRecording(recordingId);
      if (!recording) return;
      const tracks = recording?.recorder?.stream.getTracks();
      if (tracks?.length) {
        tracks.forEach((track) => {
          track.applyConstraints({
            ...constraints,
          });
        });
      }
    } catch (error) {
      handleError('applyConstraints', error, recording);
    } finally {
      updateRecordings();
      return recording;
    }
  };

  return {
    activeRecordings,
    applyConstraints,
    cancelRecording,
    clearPreview,
    closeCamera,
    devicesByType,
    download,
    muteRecording,
    openCamera,
    pauseRecording,
    resumeRecording,
    setInput,
    startRecording,
    stopRecording,
  };
}
