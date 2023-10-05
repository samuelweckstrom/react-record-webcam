import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useRecordWebcam } from '../useRecordWebcam';
import { ERROR_MESSAGES } from '../constants';
import { STATUS } from '../useRecording';
import type { Recording } from '../useRecording';

const mockPauseRecording = jest.fn();
const mockStartRecording = jest.fn();
const mockResumeRecording = jest.fn();
const mockStopRecording = jest.fn();

const mockedMediastream = {
  start: jest.fn(),
  ondataavailable: jest.fn(),
  onerror: jest.fn(),
  state: '',
  stop: jest.fn(),
  getTracks: jest.fn().mockImplementation(() => []),
};

Object.defineProperty(global, 'MediaRecorder', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    ondataavailable: jest.fn(),
    onerror: jest.fn(),
    pause: mockPauseRecording,
    resume: mockResumeRecording,
    start: mockStartRecording,
    state: '',
    stop: mockStopRecording,
    stream: mockedMediastream,
  })),
});

Object.defineProperty(MediaRecorder, 'isTypeSupported', {
  writable: true,
  value: () => true,
});

jest.mock('../devices', () => ({
  useDeviceInitialization: jest.fn().mockReturnValue({
    devicesByType: {
      video: [
        {
          deviceId: 'testVideoId',
          label: 'test-video-label',
        },
      ],
      audio: [
        {
          deviceId: 'testAudioId',
          label: 'test-audio-label',
        },
      ],
    },
    devicesById: {
      testVideoId: {
        label: 'test-video-label',
        type: 'videoinput',
      },
      testAudioId: {
        label: 'test-audio-label',
        type: 'audioinput',
      },
    },
  }),
}));

jest.mock('../stream', () => ({
  startStream: jest.fn().mockImplementation(() => mockedMediastream),
}));

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

  afterEach(async () => {
    const { result } = renderHook(() => useRecordWebcam());
    await act(async () => {
      await result.current.clearAllRecordings();
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('creates a new recording', async () => {
    const videoId = 'testVideoId';
    const audioId = 'testAudioId';
    const recordingId = `${videoId}-${audioId}`;

    const { result } = renderHook(() => useRecordWebcam());

    await act(async () => {
      const recording = <Recording>(
        await result.current.createRecording(videoId, audioId)
      );
      expect(recording.videoId).toBe(videoId);
      expect(recording.audioId).toBe(audioId);
      expect(recording.id).toBe(recordingId);
    });
  });

  it('does not create a recording for same video and audio id', async () => {
    const videoId = 'testVideoId';
    const audioId = 'testAudioId';

    const { result } = renderHook(() => useRecordWebcam());

    await act(async () => {
      try {
        await result.current.createRecording(videoId, audioId);
      } catch (e) {
        expect(e.message).toBe(ERROR_MESSAGES.SESSION_EXISTS);
      }
    });
  });

  it('opens and closes the camera', async () => {
    const videoId = 'testVideoId';
    const audioId = 'testAudioId';
    const recordingId = `${videoId}-${audioId}`;

    const { result } = renderHook(() => useRecordWebcam());

    await act(async () => {
      const recording = <Recording>(
        await result.current.createRecording(videoId, audioId)
      );
      expect(recording.videoId).toBe(videoId);
      expect(recording.audioId).toBe(audioId);
      expect(recording.id).toBe(recordingId);
    });

    await act(async () => {
      const updatedRecording = <Recording>(
        await result.current.openCamera(recordingId)
      );
      expect(updatedRecording.status).toBe(STATUS.OPEN);
      expect(updatedRecording.webcamRef.current?.srcObject).toBe(
        mockedMediastream
      );
    });

    await act(async () => {
      const updatedRecording = <Recording>(
        await result.current.closeCamera(recordingId)
      );
      expect(updatedRecording.webcamRef.current?.srcObject).toBe(null);
      expect(updatedRecording.status).toBe(STATUS.CLOSED);
    });
  });

  it('creates a recording, starts it, pauses, stops and closes', async () => {
    const videoId = 'testVideoId';
    const audioId = 'testAudioId';
    const recordingId = `${videoId}-${audioId}`;

    const { result } = renderHook(() => useRecordWebcam());

    await act(async () => {
      const recording = <Recording>(
        await result.current.createRecording(videoId, audioId)
      );
      expect(recording.videoId).toBe(videoId);
      expect(recording.audioId).toBe(audioId);
      expect(recording.id).toBe(recordingId);
    });

    await act(async () => {
      const updatedRecording = <Recording>(
        await result.current.openCamera(recordingId)
      );
      expect(updatedRecording.status).toBe(STATUS.OPEN);
      expect(updatedRecording.webcamRef.current?.srcObject).toBe(
        mockedMediastream
      );
      expect(updatedRecording.webcamRef.current?.play).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      const updatedRecording = <Recording>(
        await result.current.startRecording(recordingId)
      );
      updatedRecording.onDataAvailableResolve?.();

      expect(updatedRecording.status).toBe(STATUS.RECORDING);
      expect(mockStartRecording).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      const updatedRecording = <Recording>(
        await result.current.pauseRecording(recordingId)
      );

      expect(updatedRecording.status).toBe(STATUS.PAUSED);
      expect(mockPauseRecording).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      const updatedRecording = <Recording>(
        await result.current.resumeRecording(recordingId)
      );

      expect(updatedRecording.status).toBe(STATUS.RECORDING);
      expect(mockResumeRecording).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      const updatedRecording = <Recording>(
        await result.current.stopRecording(recordingId)
      );

      expect(updatedRecording.status).toBe(STATUS.STOPPED);
      expect(mockStopRecording).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      const updatedRecording = <Recording>(
        await result.current.closeCamera(recordingId)
      );

      expect(updatedRecording.status).toBe(STATUS.CLOSED);
      expect(updatedRecording.webcamRef.current?.load).toHaveBeenCalledTimes(1);
    });
  });
});
