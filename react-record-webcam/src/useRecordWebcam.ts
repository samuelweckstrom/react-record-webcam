import { useEffect, useMemo } from 'react';
import { useRecording, STATUS } from './useRecording';
import { useDeviceInitialization } from './devices';
import { startStream } from './stream';
import {
  DEFAULT_CONSTRAINTS,
  DEFAULT_RECORDER_OPTIONS,
  ERROR_MESSAGES,
} from './constants';
import type { Recording } from './useRecording';

type Options = {
  fileName: string;
  fileType: string;
  mimeType: string;
};

type UseRecordWebcam = {
  constraints: Partial<MediaTrackConstraints>;
  recorderOptions: Partial<MediaRecorderOptions>;
  options: Partial<Options>;
};

export function useRecordWebcam(args?: Partial<UseRecordWebcam>) {
  const { devicesByType, devicesById, initialDevices } =
    useDeviceInitialization();
  const {
    activeRecordings,
    clearAllRecordings,
    deleteRecording,
    errorMessage,
    getRecording,
    handleError,
    isRecordingCreated,
    setRecording,
    updateRecording,
  } = useRecording();

  const constraints: MediaTrackConstraints = useMemo(
    () => ({
      ...DEFAULT_CONSTRAINTS,
      ...args?.constraints,
    }),
    [args]
  );

  const recorderOptions: MediaRecorderOptions = useMemo(
    () => ({
      ...DEFAULT_RECORDER_OPTIONS,
      ...args?.recorderOptions,
    }),
    [args]
  );

  const createRecording = async (
    videoId?: string,
    audioId?: string
  ): Promise<Recording | void> => {
    try {
      const recordingId = `${videoId}-${audioId}`;
      const isCreated = isRecordingCreated(recordingId);
      if (isCreated) throw new Error(ERROR_MESSAGES.SESSION_EXISTS);

      const videoLabel = videoId
        ? devicesById?.[videoId].label
        : initialDevices.video?.label;

      const audioLabel = audioId
        ? devicesById?.[audioId].label
        : initialDevices.audio?.label;

      const recording = await setRecording({
        videoId: <string>videoId || <string>initialDevices.video?.deviceId,
        audioId: <string>audioId || <string>initialDevices.audio?.deviceId,
        videoLabel,
        audioLabel,
      });

      return recording;
    } catch (error) {
      handleError('createRecording', error, `${videoId}-${audioId}`);
    }
  };

  const openCamera = async (recordingId: string): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);

      const stream = await startStream(
        recording.videoId,
        recording.audioId,
        constraints
      );

      if (recording.webcamRef.current) {
        recording.webcamRef.current.srcObject = stream;
        await recording.webcamRef.current.play();
      }

      recording.status = STATUS.OPEN;
      const updatedRecording = await updateRecording(recording.id, recording);

      return updatedRecording;
    } catch (error) {
      handleError('openCamera', error);
    }
  };

  const closeCamera = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      if (recording.webcamRef.current) {
        const stream = <MediaStream>recording.webcamRef.current.srcObject;
        stream?.getTracks().forEach((track) => track.stop());
        recording.recorder?.ondataavailable &&
          (recording.recorder.ondataavailable = null);
        recording.webcamRef.current.srcObject = null;
        recording.webcamRef.current.load();
      }
      recording.status = STATUS.CLOSED;

      const updatedRecording = await updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      handleError('closeCamera', error, recordingId);
    }
  };

  const startRecording = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      const stream = <MediaStream>recording.webcamRef.current?.srcObject;
      recording.recorder = new MediaRecorder(stream, recorderOptions);
      recording.recorder.ondataavailable = async (event: BlobEvent) => {
        if (event.data.size) {
          const blob = new Blob([event.data], {
            type: `video/${args?.options?.mimeType || recording.mimeType}`,
          });
          const url = URL.createObjectURL(blob);
          recording.objectURL = url;

          if (recording.previewRef.current)
            recording.previewRef.current.src = url;
          recording.status = STATUS.STOPPED;

          await updateRecording(recording.id, recording);
          recording.onDataAvailableResolve?.();
        }
      };
      recording.recorder.start();
      recording.status = STATUS.RECORDING;
      const updatedRecording = await updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      handleError('startRecording', error, recordingId);
    }
  };

  const pauseRecording = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      recording.recorder?.pause();
      recording.status = STATUS.PAUSED;
      const updatedRecording = await updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      handleError('pauseRecording', error, recordingId);
    }
  };

  const resumeRecording = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      recording.recorder?.resume();
      recording.status = STATUS.RECORDING;
      const updatedRecording = await updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      handleError('resumeRecording', error, recordingId);
    }
  };

  const stopRecording = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      let recording = getRecording(recordingId);
      recording.recorder?.stop();
      await recording.onDataAvailablePromise;
      recording = getRecording(recordingId);
      recording.status = STATUS.STOPPED;
      const updatedRecording = await updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      handleError('stopRecording', error, recordingId);
    }
  };

  const cancelRecording = async (recordingId: string): Promise<undefined> => {
    try {
      const recording = getRecording(recordingId);
      const tracks = recording?.recorder?.stream.getTracks();
      recording?.recorder?.stop();
      tracks?.forEach((track) => track.stop());
      recording.recorder?.ondataavailable &&
        (recording.recorder.ondataavailable = null);

      if (recording.webcamRef.current) {
        const stream = <MediaStream>recording.webcamRef.current.srcObject;
        stream?.getTracks().forEach((track) => track.stop());

        recording.webcamRef.current.srcObject = null;
        recording.webcamRef.current.load();
      }

      URL.revokeObjectURL(<string>recording.objectURL);

      recording.status = STATUS.INITIAL;
      const updatedRecording = await updateRecording(recording.id, recording);
      await deleteRecording(updatedRecording.id);
    } catch (error) {
      handleError('cancelRecording', error, recordingId);
    }
  };

  const clearPreview = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      if (recording.previewRef.current) recording.previewRef.current.src = '';
      recording.status = STATUS.INITIAL;
      URL.revokeObjectURL(<string>recording.objectURL);
      const updatedRecording = await updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      handleError('clearPreview', error, recordingId);
    }
  };

  const muteRecording = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      recording.recorder?.stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      recording.isMuted = !recording.isMuted;
      const updatedRecording = await updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      handleError('muteRecording', error, recordingId);
    }
  };

  const download = async (recordingId: string): Promise<void> => {
    try {
      const recording = getRecording(recordingId);
      const downloadElement = document.createElement('a');

      if (recording?.objectURL) {
        downloadElement.href = recording.objectURL;
      }

      downloadElement.download = `${
        args?.options?.fileName || recording.fileName
      }.${args?.options?.fileType || recording.fileType}`;
      downloadElement.click();
    } catch (error) {
      handleError('download', error, recordingId);
    }
  };

  const applyConstraints = async (
    recordingId: string,
    constraints: MediaTrackConstraints
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      if (recording.webcamRef.current?.srcObject) {
        const stream = <MediaStream>recording.webcamRef.current?.srcObject;
        const tracks = stream.getTracks() || [];
        tracks?.forEach((track) => {
          track.applyConstraints({
            ...constraints,
          });
        });
      }
      return recording;
    } catch (error) {
      handleError('applyConstraints', error, recordingId);
    }
  };

  const applyRecordingOptions = async (
    recordingId: string,
    options: Options
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      if (options.fileName) {
        recording.fileName = options.fileName;
      }
      if (options.fileType) {
        recording.fileType = options.fileType;
      }
      const updatedRecording = await updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      handleError('applyRecordingOptions', error, recordingId);
    }
  };

  useEffect(() => {
    return () => {
      clearAllRecordings();
    };
  }, []);

  return {
    activeRecordings,
    applyConstraints,
    applyRecordingOptions,
    cancelRecording,
    clearAllRecordings,
    clearPreview,
    closeCamera,
    createRecording,
    devicesById,
    devicesByType,
    download,
    errorMessage,
    muteRecording,
    openCamera,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording,
  };
}
