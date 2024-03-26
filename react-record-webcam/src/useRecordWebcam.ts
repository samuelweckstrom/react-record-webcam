import { useEffect, useState } from 'react';

import { getDevices, type Devices, type ById, type ByType } from './devices';

import { useRecorder, type UseRecorder } from './useRecorder';
import { useCamera, type UseCamera } from './useCamera';
import { type Recording } from './useRecordingStore';

/**
 * Options for customizing the recording settings.
 */
export type Options = {
  /** The name of the output file. */
  fileName: string;
  /** The MIME type of the output file. */
  fileType: string;
  /** The time interval (in milliseconds) for splitting the recording into chunks. */
  timeSlice: number;
};

/**
 * Configuration options for the `useRecordWebcam` hook.
 */
export type UseRecordWebcamArgs = {
  /** Media track constraints for the camera. */
  mediaTrackConstraints?: Partial<MediaTrackConstraints>;
  /** Options for the MediaRecorder API. */
  mediaRecorderOptions?: Partial<MediaRecorderOptions>;
  /** Custom options for recording. */
  options?: Partial<Options>;
};

/**
 * @typedef {Object} UseRecordWebcam
 * The return type of `useRecordWebcam`, providing access to webcam recording functionalities.
 */
export type UseRecordWebcam = {
  /** Array of active recordings. */
  activeRecordings: Recording[];
  /** Function to clear all recordings. */
  clearAllRecordings: () => Promise<void>;
  /** Function to clear the current error message. */
  clearError: () => void;
  /** Object containing devices by their ID. */
  devicesById: ById | undefined;
  /** Object categorizing devices by their type. */
  devicesByType: ByType | undefined;
  /** The current error message, if any, related to recording. */
  errorMessage: string | null;
} & UseCamera &
  UseRecorder;

const isDevMode = false;

/**
 * React Record Webcam hook.
 * @param args Configuration options for the hook.
 * @returns {UseRecordWebcam} providing access to webcam recording functionalities.
 */
export function useRecordWebcam({
  mediaRecorderOptions,
  mediaTrackConstraints,
  options,
}: Partial<UseRecordWebcamArgs> = {}): UseRecordWebcam {
  const [devices, setDevices] = useState<Devices>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleError(functionName: string, error: any): void {
    if (isDevMode) {
      console.error(`@${functionName}: `, error);
    }

    const message =
      typeof error === 'string'
        ? error
        : typeof error.message === 'string'
        ? error.message
        : '';
    setErrorMessage(message);
  }

  function clearError(): void {
    setErrorMessage(null);
  }

  const { applyConstraints, closeCamera, openCamera } = useCamera({
    mediaTrackConstraints,
    handleError,
  });
  const {
    activeRecordings,
    applyRecordingOptions,
    cancelRecording,
    clearAllRecordings,
    clearPreview,
    createRecording,
    download,
    muteRecording,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording,
  } = useRecorder({ mediaRecorderOptions, options, devices, handleError });

  async function init() {
    try {
      const devices = await getDevices();
      setDevices(devices);
    } catch (error) {
      handleError('init', error);
    }
  }

  useEffect(() => {
    init();
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
    clearError,
    clearPreview,
    closeCamera,
    createRecording,
    devicesById: devices?.devicesById,
    devicesByType: devices?.devicesByType,
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
