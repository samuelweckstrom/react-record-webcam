import { renderHook, act } from '@testing-library/react';
import { useRecording } from '../useRecording';
import { ERROR_MESSAGES } from '../constants';

describe('useRecording', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should initiate with default values', () => {
    const { result } = renderHook(() => useRecording());

    expect(result.current.activeRecordings).toEqual([]);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should be able to set a recording', () => {
    const recording = {
      videoId: 'testVideoId',
      audioId: 'testAudioId',
      videoLabel: 'test-video-label',
      audioLabel: 'test-audio-label',
    };
    const { result } = renderHook(() => useRecording());

    act(() => {
      result.current.setRecording(recording);
    });

    expect(result.current?.activeRecordings?.length).toBe(1);
    expect(result.current?.activeRecordings?.[0].videoId).toBe(
      recording.videoId
    );
  });

  it('should be able to get a recording by ID', () => {
    const recording = {
      videoId: 'testVideoId',
      audioId: 'testAudioId',
      videoLabel: 'test-video-label',
      audioLabel: 'test-audio-label',
    };
    const recordingId = `${recording.videoId}-${recording.audioId}`;
    const { result } = renderHook(() => useRecording());

    act(() => {
      result.current.setRecording(recording);
    });

    const testResult = result.current.getRecording(recordingId);
    expect(testResult.videoLabel).toBe(recording.videoLabel);
  });

  it('should throw an error if trying to get a non-existing recording', () => {
    const { result } = renderHook(() => useRecording());

    expect(() => {
      result.current.getRecording('invalid-id');
    }).toThrow(ERROR_MESSAGES.BY_ID_NOT_FOUND);
  });

  it('should delete a recording', () => {
    const recording = {
      videoId: 'testVideoId',
      audioId: 'testAudioId',
      videoLabel: 'test-video-label',
      audioLabel: 'test-audio-label',
    };
    const { result } = renderHook(() => useRecording());
    act(() => {
      result.current.setRecording(recording);
    });

    expect(result.current?.activeRecordings?.length).toBe(1);

    act(() => {
      result.current.deleteRecording(
        `${recording.videoId}-${recording.audioId}`
      );
    });

    expect(() => {
      result.current.getRecording(`${recording.videoId}-${recording.audioId}`);
    }).toThrow(ERROR_MESSAGES.BY_ID_NOT_FOUND);
  });

  it('should cleanup all recordings', () => {
    const recording1 = {
      videoId: 'testVideoId',
      audioId: 'testAudioId',
      videoLabel: 'test-video-label',
      audioLabel: 'test-audio-label',
    };
    const recording2 = {
      videoId: 'testVideoId2',
      audioId: 'testAudioId2',
      videoLabel: 'test-video-label2',
      audioLabel: 'test-audio-label2',
    };

    const { result } = renderHook(() => useRecording());
    act(() => {
      result.current.setRecording(recording1);
      result.current.setRecording(recording2);
    });
    act(() => {
      result.current.clearAllRecordings();
    });
    expect(() => {
      result.current.getRecording(
        `${recording1.videoId}-${recording1.audioId}`
      );
    }).toThrow(ERROR_MESSAGES.BY_ID_NOT_FOUND);
    expect(() => {
      result.current.getRecording(
        `${recording2.videoId}-${recording2.audioId}`
      );
    }).toThrow(ERROR_MESSAGES.BY_ID_NOT_FOUND);
  });
});
