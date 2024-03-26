import { useMemo } from 'react';

import { type Devices } from './devices';
import {
  ERROR_MESSAGES,
  type Recording,
  STATUS,
  useRecordingStore,
} from './useRecordingStore';
import { type Options } from './useRecordWebcam';
import { defaultCodec } from './codec';

const DEFAULT_RECORDER_OPTIONS: MediaRecorderOptions = {
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 2500000,
  mimeType: defaultCodec,
} as const;

export type UseRecorder = {
  /**
   * Array of active recordings.
   */
  activeRecordings: Recording[];

  /**
   * Clears all active recordings.
   * @returns A promise that resolves when all recordings are cleared.
   */
  clearAllRecordings: () => Promise<void>;

  /**
   * Applies recording options to a specific recording.
   * @param {string} recordingId - The ID of the recording.
   * @returns {Promise<Recording | void>} - A promise that resolves to a Recording object or void.
   */
  applyRecordingOptions: (recordingId: string) => Promise<Recording | void>;

  /**
   * Cancels the current recording session.
   * @param recordingId The ID of the recording to cancel.
   * @returns A promise that resolves when the recording is canceled.
   */
  cancelRecording: (recordingId: string) => Promise<void>;

  /**
   * Clears the preview of a specific recording.
   * @param {string} recordingId - The ID of the recording.
   * @returns {Promise<Recording | void>} - A promise that resolves to a Recording object or void.
   */
  clearPreview: (recordingId: string) => Promise<Recording | void>;

  /**
   * Downloads a specific recording.
   * @param {string} recordingId - The ID of the recording.
   * @returns {Promise<void>} - A promise that resolves when the download is complete.
   */
  download: (recordingId: string) => Promise<void>;

  /**
   * Pauses the current recording.
   * @param recordingId The ID of the recording to pause.
   * @returns A promise that resolves with the updated recording, or void if an error occurs.
   */
  pauseRecording: (recordingId: string) => Promise<Recording | void>;

  /**
   * Resumes a paused recording.
   * @param recordingId The ID of the recording to resume.
   * @returns A promise that resolves with the updated recording, or void if an error occurs.
   */
  resumeRecording: (recordingId: string) => Promise<Recording | void>;

  /**
   * Starts a new recording session.
   * @param recordingId The ID for the new recording session.
   * @returns A promise that resolves with the new recording, or void if an error occurs.
   */
  startRecording: (recordingId: string) => Promise<Recording | void>;

  /**
   * Stops the current recording session.
   * @param recordingId The ID of the recording to stop.
   * @returns A promise that resolves with the stopped recording, or void if an error occurs.
   */
  stopRecording: (recordingId: string) => Promise<Recording | void>;

  /**
   * Mutes or unmutes the recording audio.
   * @param recordingId The ID of the recording to mute or unmute.
   * @returns A promise that resolves with the updated recording, or void if an error occurs.
   */
  muteRecording: (recordingId: string) => Promise<Recording | void>;

  /**
   * Creates a new recording session with specified video and audio sources.
   * @param videoId The ID of the video source device.
   * @param audioId The ID of the audio source device.
   * @returns A promise that resolves with the created recording, or void if an error occurs.
   */
  createRecording: (
    videoId?: string,
    audioId?: string
  ) => Promise<Recording | void>;
};

export function useRecorder({
  mediaRecorderOptions,
  options,
  devices,
  handleError,
}: {
  mediaRecorderOptions?: MediaRecorderOptions;
  options?: Partial<Options>;
  devices?: Devices;
  handleError: (functionName: string, error: unknown) => void;
}): UseRecorder {
  const {
    activeRecordings,
    clearAllRecordings,
    deleteRecording,
    getRecording,
    isRecordingCreated,
    setRecording,
    updateRecording,
  } = useRecordingStore();

  const recorderOptions: MediaRecorderOptions = useMemo(
    () => ({
      ...DEFAULT_RECORDER_OPTIONS,
      ...mediaRecorderOptions,
    }),
    [mediaRecorderOptions]
  );

  const startRecording = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      const stream = <MediaStream>recording.webcamRef.current?.srcObject;
      recording.mimeType = recorderOptions.mimeType || recording.mimeType;
      const isCodecSupported = MediaRecorder.isTypeSupported(
        recording.mimeType
      );

      if (!isCodecSupported) {
        console.warn('Codec not supported: ', recording.mimeType);
        handleError('startRecording', ERROR_MESSAGES.CODEC_NOT_SUPPORTED);
      }

      recording.recorder = new MediaRecorder(stream, recorderOptions);

      return await new Promise((resolve) => {
        if (recording.recorder) {
          recording.recorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size) {
              recording.blobChunks.push(event.data);
            }
          };
          recording.recorder.onstart = async () => {
            recording.status = STATUS.RECORDING;
            const updated = await updateRecording(recording.id, recording);
            resolve(updated);
          };
          recording.recorder.onerror = (error: Event) => {
            if (recordingId) {
              const recording = getRecording(recordingId);
              if (recording) recording.status = STATUS.ERROR;
            }
            handleError('startRecording', error);
          };
          recording.recorder?.start(options?.timeSlice);
        }
      });
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('startRecording', error);
    }
  };

  const pauseRecording = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      recording.recorder?.pause();
      if (recording.recorder?.state === 'paused') {
        recording.status = STATUS.PAUSED;
        const updated = await updateRecording(recording.id, recording);
        return updated;
      }
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('pauseRecording', error);
    }
  };

  const resumeRecording = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      recording.recorder?.resume();
      if (recording.recorder?.state === 'recording') {
        recording.status = STATUS.RECORDING;
        const updated = await updateRecording(recording.id, recording);
        return updated;
      }
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('resumeRecording', error);
    }
  };

  const stopRecording = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      recording.recorder?.stop();

      return await new Promise((resolve) => {
        if (recording.recorder) {
          recording.recorder.onstop = async () => {
            recording.status = STATUS.STOPPED;
            const blob = new Blob(recording.blobChunks, {
              type: recording.mimeType,
            });
            const url = URL.createObjectURL(blob);
            recording.blob = blob;
            recording.objectURL = url;

            if (recording.previewRef.current) {
              recording.previewRef.current.src = url;
            }
            const updated = await updateRecording(recording.id, recording);
            resolve(updated);
          };
        }
      });
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('stopRecording', error);
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
      return await updateRecording(recording.id, recording);
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('muteRecording', error);
    }
  };

  const cancelRecording = async (recordingId: string): Promise<void> => {
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
      await deleteRecording(recording.id);
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('cancelRecording', error);
    }
  };

  const createRecording = async (
    videoId?: string,
    audioId?: string
  ): Promise<Recording | void> => {
    try {
      const { devicesById, initialDevices } = devices || {};

      const videoLabel = videoId
        ? devicesById?.[videoId].label
        : initialDevices?.video?.label;

      const audioLabel = audioId
        ? devicesById?.[audioId].label
        : initialDevices?.audio?.label;

      const recordingId = `${videoId || initialDevices?.video?.deviceId}-${
        audioId || initialDevices?.audio?.deviceId
      }`;
      const isCreated = isRecordingCreated(recordingId);
      if (isCreated) throw new Error(ERROR_MESSAGES.SESSION_EXISTS);

      const recording = await setRecording({
        videoId: <string>videoId || <string>initialDevices?.video?.deviceId,
        audioId: <string>audioId || <string>initialDevices?.audio?.deviceId,
        videoLabel,
        audioLabel,
      });
      return recording;
    } catch (error) {
      handleError('createRecording', error);
    }
  };

  const applyRecordingOptions = async (
    recordingId: string
  ): Promise<Recording | void> => {
    try {
      const recording = getRecording(recordingId);
      if (options?.fileName) {
        recording.fileName = options.fileName;
      }
      if (options?.fileType) {
        recording.fileType = options.fileType;
      }
      const updatedRecording = await updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('applyRecordingOptions', error);
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
      recording.blobChunks = [];
      const updatedRecording = await updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('clearPreview', error);
    }
  };

  const download = async (recordingId: string): Promise<void> => {
    try {
      const recording = getRecording(recordingId);
      const downloadElement = document.createElement('a');

      if (recording?.objectURL) {
        downloadElement.href = recording.objectURL;
      }

      downloadElement.download = `${recording.fileName}.${recording.fileType}`;
      downloadElement.click();
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('download', error);
    }
  };

  return {
    activeRecordings,
    applyRecordingOptions,
    clearAllRecordings,
    clearPreview,
    download,
    cancelRecording,
    createRecording,
    muteRecording,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording,
  };
}
