import { useCallback, useMemo } from 'react';

import { startStream } from './stream';
import { type Recording, type Status, STATUS, useRecordingStore } from './useRecordingStore';

export type Orientation = 'portrait' | 'landscape';

const DEFAULT_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  height: { ideal: 720 },
  width: { ideal: 1280 },
};

const ORIENTATION_CONSTRAINTS: Record<Orientation, MediaTrackConstraints> = {
  portrait: {
    width: { ideal: 720 },
    height: { ideal: 1280 },
    aspectRatio: { ideal: 9 / 16 },
  },
  landscape: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    aspectRatio: { ideal: 16 / 9 },
  },
};

export type UseCamera = {
  applyConstraints: (
    recordingId: string,
    constraints: MediaTrackConstraints
  ) => Promise<Recording | void>;
  captureScreenshot: (recordingId: string, options?: { mirror?: boolean }) => Promise<Blob | void>;
  closeCamera: (recordingId: string) => Promise<Recording | void>;
  openCamera: (recordingId: string) => Promise<Recording | void>;
  setOrientation: (recordingId: string, orientation: Orientation) => Promise<Recording | void>;
};

export function useCamera({
  mediaTrackConstraints,
  handleError,
  onStatusChange,
}: {
  mediaTrackConstraints?: Partial<MediaTrackConstraints>;
  handleError: (functionName: string, error: unknown, recordingId?: string) => void;
  onStatusChange?: (recordingId: string, oldStatus: Status, newStatus: Status) => void;
}): UseCamera {
  const { getRecording, updateRecording } = useRecordingStore();

  const constraints: MediaTrackConstraints = useMemo(
    () => ({ ...DEFAULT_CONSTRAINTS, ...mediaTrackConstraints }),
    [mediaTrackConstraints]
  );

  const setStatus = useCallback(
    (recording: Recording, newStatus: Status) => {
      const oldStatus = recording.status;
      recording.status = newStatus;
      if (oldStatus !== newStatus) {
        onStatusChange?.(recording.id, oldStatus, newStatus);
      }
    },
    [onStatusChange]
  );

  const applyConstraints = useCallback(
    async (
      recordingId: string,
      newConstraints: MediaTrackConstraints
    ): Promise<Recording | void> => {
      try {
        const recording = getRecording(recordingId);
        const srcObject = recording.webcamRef.current?.srcObject;
        if (srcObject) {
          const stream = srcObject as MediaStream;
          for (const track of stream.getVideoTracks()) {
            await track.applyConstraints(newConstraints);
          }
        }
        return recording;
      } catch (error) {
        try {
          const recording = getRecording(recordingId);
          setStatus(recording, STATUS.ERROR);
        } catch { /* recording may not exist */ }
        handleError('applyConstraints', error, recordingId);
      }
    },
    [getRecording, setStatus, handleError]
  );

  const openCamera = useCallback(
    async (recordingId: string): Promise<Recording | void> => {
      try {
        const recording = getRecording(recordingId);

        const stream = await startStream(
          recording.videoId,
          recording.audioId,
          constraints,
          recording.audioOnly
        );

        if (!recording.audioOnly && recording.webcamRef.current) {
          recording.webcamRef.current.srcObject = stream;
          try {
            await recording.webcamRef.current.play();
          } catch {
            handleError(
              'openCamera',
              'Video play() failed — ensure the webcam <video> element has the muted and playsInline attributes',
              recordingId
            );
            return;
          }
        }

        setStatus(recording, STATUS.OPEN);
        return await updateRecording(recording.id, recording);
      } catch (error) {
        handleError('openCamera', error, recordingId);
      }
    },
    [constraints, getRecording, updateRecording, setStatus, handleError]
  );

  const closeCamera = useCallback(
    async (recordingId: string): Promise<Recording | void> => {
      try {
        const recording = getRecording(recordingId);
        if (recording.webcamRef.current) {
          const stream = recording.webcamRef.current.srcObject as MediaStream;
          stream?.getTracks().forEach((track) => track.stop());
          if (recording.recorder?.ondataavailable) {
            recording.recorder.ondataavailable = null;
          }
          recording.webcamRef.current.srcObject = null;
          recording.webcamRef.current.load();
        }
        setStatus(recording, STATUS.CLOSED);
        return await updateRecording(recording.id, recording);
      } catch (error) {
        try {
          const recording = getRecording(recordingId);
          setStatus(recording, STATUS.ERROR);
        } catch { /* recording may not exist */ }
        handleError('closeCamera', error, recordingId);
      }
    },
    [getRecording, updateRecording, setStatus, handleError]
  );

  const captureScreenshot = useCallback(
    async (recordingId: string, options?: { mirror?: boolean }): Promise<Blob | void> => {
      try {
        const recording = getRecording(recordingId);
        const video = recording.webcamRef.current;
        if (!video || !video.videoWidth) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (options?.mirror) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);

        return await new Promise<Blob | void>((resolve) => {
          canvas.toBlob((blob) => resolve(blob ?? undefined), 'image/png');
        });
      } catch (error) {
        handleError('captureScreenshot', error, recordingId);
      }
    },
    [getRecording, handleError]
  );

  const setOrientation = useCallback(
    async (recordingId: string, orientation: Orientation): Promise<Recording | void> => {
      return applyConstraints(recordingId, ORIENTATION_CONSTRAINTS[orientation]);
    },
    [applyConstraints]
  );

  return {
    applyConstraints,
    captureScreenshot,
    closeCamera,
    openCamera,
    setOrientation,
  };
}
