import { useCallback, useEffect, useState } from 'react';

import {
  getDevices,
  refreshDeviceList,
  checkCameraPermission,
  type Devices,
  type ById,
  type ByType,
  type CameraPermission,
} from './devices';

import { useRecorder, type UseRecorder } from './useRecorder';
import { useCamera, type UseCamera, type Orientation } from './useCamera';
import {
  ERROR_MESSAGES,
  type Recording,
  type RecordingError,
  type Status,
} from './useRecordingStore';
import { QUALITY_PRESETS, type QualityPreset } from './codec';

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
  /** Maximum recording duration in milliseconds. Auto-stops when reached. */
  maxDuration: number;
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
  /** Quality preset that auto-configures resolution and bitrate. */
  quality?: QualityPreset;
  /** Called whenever a recording's status changes. */
  onStatusChange?: (
    recordingId: string,
    oldStatus: Status,
    newStatus: Status
  ) => void;
  /** Called when a new data chunk is available (requires `options.timeSlice` to be set). */
  onDataAvailable?: (recordingId: string, chunk: Blob) => void;
};

/**
 * The return type of `useRecordWebcam`.
 */
export type UseRecordWebcam = {
  /** Array of active recordings. */
  activeRecordings: Recording[];
  /** Camera permission state. */
  cameraPermission: CameraPermission;
  /** Function to clear all recordings. */
  clearAllRecordings: () => Promise<void>;
  /** Function to clear the current error. */
  clearError: () => void;
  /** Object containing devices by their ID. */
  devicesById: ById | undefined;
  /** Object categorizing devices by their type. */
  devicesByType: ByType | undefined;
  /** Structured error object, if any. */
  error: RecordingError | null;
  /** The current error message string (kept for backward compatibility). */
  errorMessage: string | null;
} & UseCamera &
  UseRecorder;

/**
 * React Record Webcam hook.
 * @param args Configuration options for the hook.
 * @returns Webcam recording controls, state, and device info.
 */
export function useRecordWebcam({
  mediaRecorderOptions,
  mediaTrackConstraints,
  options,
  quality,
  onStatusChange,
  onDataAvailable,
}: Partial<UseRecordWebcamArgs> = {}): UseRecordWebcam {
  const [devices, setDevices] = useState<Devices>();
  const [error, setError] = useState<RecordingError | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] =
    useState<CameraPermission>('unknown');

  const preset = quality ? QUALITY_PRESETS[quality] : undefined;

  const mergedTrackConstraints: Partial<MediaTrackConstraints> | undefined =
    preset
      ? {
          width: preset.width,
          height: preset.height,
          ...mediaTrackConstraints,
        }
      : mediaTrackConstraints;

  const mergedRecorderOptions: MediaRecorderOptions | undefined = preset
    ? {
        videoBitsPerSecond: preset.videoBitsPerSecond,
        audioBitsPerSecond: preset.audioBitsPerSecond,
        ...mediaRecorderOptions,
      }
    : mediaRecorderOptions;

  const handleError = useCallback(
    (functionName: string, err: unknown, recordingId?: string): void => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`@${functionName}: `, err);
      }

      const message =
        typeof err === 'string'
          ? err
          : err instanceof Error
            ? err.message
            : 'An unknown error occurred';

      const knownCodes = Object.values(ERROR_MESSAGES) as string[];
      const code = knownCodes.includes(message) ? message : 'UNKNOWN_ERROR';

      setError({ code, message, recordingId });
      setErrorMessage(message);
    },
    []
  );

  const clearError = useCallback((): void => {
    setError(null);
    setErrorMessage(null);
  }, []);

  const { applyConstraints, captureScreenshot, closeCamera, openCamera, setOrientation } =
    useCamera({
      mediaTrackConstraints: mergedTrackConstraints,
      handleError,
      onStatusChange,
    });

  const {
    activeRecordings,
    applyRecordingOptions,
    cancelRecording,
    clearAllRecordings,
    clearPreview,
    createRecording,
    download,
    getBlob,
    muteRecording,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording,
  } = useRecorder({
    mediaRecorderOptions: mergedRecorderOptions,
    options,
    devices,
    handleError,
    onStatusChange,
    onDataAvailable,
  });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const perm = await checkCameraPermission();
        if (!cancelled) setCameraPermission(perm);

        const devs = await getDevices();
        if (!cancelled) {
          setDevices(devs);
          setCameraPermission('granted');
        }
      } catch (err) {
        if (!cancelled) handleError('init', err);
      }
    }

    init();
    return () => {
      cancelled = true;
      clearAllRecordings();
    };
  }, []);

  // Device hot-plug: re-enumerate when devices change
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;

    const handler = async () => {
      try {
        const devs = await refreshDeviceList();
        setDevices(devs);
      } catch {
        // If enumeration fails after hot-plug, ignore silently
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handler);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handler);
    };
  }, []);

  return {
    activeRecordings,
    applyConstraints,
    applyRecordingOptions,
    cameraPermission,
    cancelRecording,
    captureScreenshot,
    clearAllRecordings,
    clearError,
    clearPreview,
    closeCamera,
    createRecording,
    devicesById: devices?.devicesById,
    devicesByType: devices?.devicesByType,
    download,
    error,
    errorMessage,
    getBlob,
    muteRecording,
    openCamera,
    pauseRecording,
    resumeRecording,
    setOrientation,
    startRecording,
    stopRecording,
  };
}
