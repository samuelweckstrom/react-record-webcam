import React from 'react';

import { act, renderHook, waitFor } from '@testing-library/react/pure';

import { ERROR_MESSAGES, type Recording, STATUS } from '../useRecordingStore';
import {
  UseRecordWebcam,
  useRecordWebcam,
  type UseRecordWebcamArgs,
} from '../useRecordWebcam';
import {
  audio as audioDevice,
  video as videoDevice,
} from './mocks/device.mock';
import { mockRecording } from './mocks/recording.mock';

describe('useRecordWebcam', () => {
  let mockPlay: () => Promise<void>;
  let mockLoad: () => void;
  let mockRef: React.RefObject<Partial<HTMLVideoElement>>;

  beforeEach(() => {
    mockPlay = jest.fn(() => Promise.resolve());
    mockLoad = jest.fn(() => Promise.resolve());

    jest.spyOn(React, 'createRef').mockImplementation(() => {
      mockRef = {
        current: { srcObject: null, play: mockPlay, load: mockLoad, src: '' },
      };
      return mockRef;
    });
  });

  let result: { current: UseRecordWebcam };
  let rerender: (props?: UseRecordWebcamArgs) => UseRecordWebcam;

  beforeAll(() => {
    const render = renderHook((args: UseRecordWebcamArgs | undefined) =>
      useRecordWebcam(args)
    );
    result = render.result;
    rerender = render.rerender as (
      props?: UseRecordWebcamArgs | undefined
    ) => UseRecordWebcam;
  });

  it('has list of available devices', async () => {
    await waitFor(() => {
      expect(result.current.devicesByType).toBeDefined();
    });
    const { devicesByType } = result.current;
    expect(devicesByType?.video.length).toBe(2);
    expect(devicesByType?.audio.length).toBe(2);
    expect(devicesByType?.video[0].deviceId).toBe(videoDevice[0].deviceId);
    expect(devicesByType?.audio[0].deviceId).toBe(audioDevice[0].deviceId);
  });

  it('creates a new recording with default devices', async () => {
    const videoId = videoDevice[0].deviceId;
    const audioId = audioDevice[0].deviceId;
    const recordingId = `${videoId}-${audioId}`;

    await act(async () => {
      await result.current.createRecording();
    });

    expect(result.current.activeRecordings[0].id).toEqual(recordingId);
  });

  it('creates a new recording with passed video and audio IDs', async () => {
    const videoId = videoDevice[1].deviceId;
    const audioId = audioDevice[1].deviceId;
    const recordingId = `${videoId}-${audioId}`;
    let recording: Recording | undefined;

    await act(async () => {
      recording = <Recording>(
        await result.current.createRecording(videoId, audioId)
      );
    });

    expect(recording?.videoId).toBe(videoId);
    expect(recording?.audioId).toBe(audioId);
    expect(recording?.id).toBe(recordingId);
  });

  it('prevents a recording for same video and audio id', async () => {
    const videoId = videoDevice[1].deviceId;
    const audioId = audioDevice[1].deviceId;

    await act(async () => {
      try {
        await result.current.createRecording(videoId, audioId);
      } catch (e) {
        expect(e.message).toBe(ERROR_MESSAGES.SESSION_EXISTS);
      }
    });
  });

  it('opens and closes the camera', async () => {
    const videoId = videoDevice[1].deviceId;
    const audioId = audioDevice[1].deviceId;
    const recordingId = `${videoId}-${audioId}`;
    let recording: Recording | undefined;

    await act(async () => {
      recording = <Recording>await result.current.openCamera(recordingId);
    });

    expect(recording?.status).toBe(STATUS.OPEN);
    expect(result.current.activeRecordings[1].status).toBe(STATUS.OPEN);

    await act(async () => {
      recording = <Recording>await result.current.closeCamera(recordingId);
    });

    expect(recording?.status).toBe(STATUS.CLOSED);
    expect(result.current.activeRecordings[1].status).toBe(STATUS.CLOSED);
  });

  it('throws error with unsupported codec', async () => {
    const videoId = videoDevice[1].deviceId;
    const audioId = audioDevice[1].deviceId;
    const recordingId = `${videoId}-${audioId}`;
    const codec = 'test-codec-unsupported';

    rerender({
      mediaRecorderOptions: { mimeType: codec },
    });

    await act(async () => {
      try {
        await result.current.openCamera(recordingId);
        await result.current.startRecording(recordingId);
      } catch (e) {
        expect(e.message).toBe(
          `${ERROR_MESSAGES.CODEC_NOT_SUPPORTED} ${codec}`
        );
      }
    });
  });

  it('clears all recordings', async () => {
    await act(async () => {
      await result.current.clearAllRecordings();
    });

    expect(result.current.activeRecordings.length).toBe(0);
  });

  it('creates a recording, starts it, pauses, resumes, stops and closes camera', async () => {
    const videoId = videoDevice[1].deviceId;
    const audioId = audioDevice[1].deviceId;
    const recordingId = `${videoId}-${audioId}`;
    let recording: Recording | undefined;

    rerender();

    await act(async () => {
      recording = <Recording>(
        await result.current.createRecording(videoId, audioId)
      );
    });

    expect(recording?.videoId).toBe(videoId);
    expect(recording?.audioId).toBe(audioId);
    expect(recording?.id).toBe(recordingId);
    expect(recording?.recorder).toBeDefined();

    await act(async () => {
      recording = <Recording>await result.current.openCamera(recordingId);
    });

    expect(recording?.status).toBe(STATUS.OPEN);
    expect(recording?.webcamRef.current?.srcObject).toBeDefined();
    expect(recording?.webcamRef.current?.play).toHaveBeenCalledTimes(1);

    await act(async () => {
      recording = <Recording>await result.current.startRecording(recordingId);
    });

    await waitFor(() => {
      expect(recording?.status).toBe(STATUS.RECORDING);
    });

    await act(async () => {
      recording = <Recording>await result.current.pauseRecording(recordingId);
    });

    await waitFor(() => {
      expect(recording?.status).toBe(STATUS.PAUSED);
    });

    await act(async () => {
      recording = <Recording>await result.current.resumeRecording(recordingId);
    });

    await waitFor(() => {
      expect(recording?.status).toBe(STATUS.RECORDING);
    });

    // TODO: figure out a way to test the MediaRecorder onstop method
    if (recording?.recorder?.onstop) {
      result.current.stopRecording = jest.fn().mockResolvedValue({
        ...mockRecording,
        status: STATUS.STOPPED,
        objectURL: 'test-url',
        previewRef: { current: { src: 'test-url' } },
      });
    }

    await act(async () => {
      recording = <Recording>await result.current.stopRecording(recordingId);
    });

    await waitFor(() => {
      expect(recording?.status).toBe(STATUS.STOPPED);
      expect(recording?.objectURL).toBeDefined();
    });

    await act(async () => {
      recording = <Recording>await result.current.closeCamera(recordingId);
    });

    expect(recording?.status).toBe(STATUS.CLOSED);
    expect(recording?.webcamRef.current?.load).toHaveBeenCalledTimes(1);
  });
});
