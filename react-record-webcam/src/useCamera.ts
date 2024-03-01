import { useMemo } from 'react';

import { startStream } from './stream';
import { type Recording, STATUS, useRecordingStore } from './useRecordingStore';

const DEFAULT_CONSTRAINTS: MediaTrackConstraints = {
  aspectRatio: 1.7,
  echoCancellation: true,
  height: 720,
  width: 1280,
} as const;

export type UseCamera = {
  /**
   * Applies given constraints to the camera for a specific recording.
   * @param recordingId The ID of the recording to apply constraints to.
   * @param constraints The new constraints to apply to the camera.
   * @returns A promise resolving to the updated recording or void if an error occurs.
   */
  applyConstraints: (
    recordingId: string,
    constraints: MediaTrackConstraints
  ) => Promise<Recording | void>;

  /**
   * Closes the camera for a specific recording.
   * @param recordingId The ID of the recording for which to close the camera.
   * @returns A promise resolving to the updated recording or void if an error occurs.
   */
  closeCamera: (recordingId: string) => Promise<Recording | void>;

  /**
   * Opens the camera for a specific recording with optional constraints.
   * @param recordingId The ID of the recording for which to open the camera.
   * @returns A promise resolving to the updated recording or void if an error occurs.
   */
  openCamera: (recordingId: string) => Promise<Recording | void>;
};

export function useCamera({
  mediaTrackConstraints,
  handleError,
}: {
  mediaTrackConstraints?: Partial<MediaTrackConstraints>;
  handleError: (functionName: string, error: unknown) => void;
}): UseCamera {
  const { getRecording, updateRecording } = useRecordingStore();

  const constraints: MediaTrackConstraints = useMemo(
    () => ({
      ...DEFAULT_CONSTRAINTS,
      ...mediaTrackConstraints,
    }),
    [mediaTrackConstraints]
  );

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
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('applyConstraints', error);
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
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording) recording.status = STATUS.ERROR;
      }
      handleError('closeCamera', error);
    }
  };

  return {
    applyConstraints,
    closeCamera,
    openCamera,
  };
}
