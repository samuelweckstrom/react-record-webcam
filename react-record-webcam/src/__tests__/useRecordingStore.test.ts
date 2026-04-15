import { renderHook, act } from '@testing-library/react';
import { useRecordingStore, ERROR_MESSAGES } from '../useRecordingStore';

describe('useRecordingStore', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should initiate with default values', () => {
    const { result } = renderHook(() => useRecordingStore());

    expect(result.current.activeRecordings).toEqual([]);
  });

  it('should be able to set a recording', async () => {
    const recording = {
      videoId: 'testVideoId',
      audioId: 'testAudioId',
      videoLabel: 'test-video-label',
      audioLabel: 'test-audio-label',
    };
    const { result } = renderHook(() => useRecordingStore());

    await act(async () => {
      await result.current.setRecording(recording);
    });

    expect(result.current?.activeRecordings?.length).toBe(1);
    expect(result.current?.activeRecordings?.[0].videoId).toBe(
      recording.videoId
    );
  });

  it('should be able to get a recording by ID', async () => {
    const recording = {
      videoId: 'testVideoId',
      audioId: 'testAudioId',
      videoLabel: 'test-video-label',
      audioLabel: 'test-audio-label',
    };
    const { result } = renderHook(() => useRecordingStore());

    let created: any;
    await act(async () => {
      created = await result.current.setRecording(recording);
    });

    const testResult = result.current.getRecording(created.id);
    expect(testResult.videoLabel).toBe(recording.videoLabel);
  });

  it('should throw an error if trying to get a non-existing recording', () => {
    const { result } = renderHook(() => useRecordingStore());

    expect(() => {
      result.current.getRecording('invalid-id');
    }).toThrow(ERROR_MESSAGES.NO_RECORDING_WITH_ID);
  });

  it('should delete a recording', async () => {
    const recording = {
      videoId: 'testVideoIdDel',
      audioId: 'testAudioIdDel',
      videoLabel: 'test-video-label',
      audioLabel: 'test-audio-label',
    };
    const { result } = renderHook(() => useRecordingStore());

    let created: any;
    await act(async () => {
      created = await result.current.setRecording(recording);
    });

    expect(result.current?.activeRecordings?.length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      await result.current.deleteRecording(created.id);
    });

    expect(() => {
      result.current.getRecording(created.id);
    }).toThrow(ERROR_MESSAGES.NO_RECORDING_WITH_ID);
  });

  it('should cleanup all recordings', async () => {
    const recording1 = {
      videoId: 'testVideoId1',
      audioId: 'testAudioId1',
      videoLabel: 'test-video-label',
      audioLabel: 'test-audio-label',
    };
    const recording2 = {
      videoId: 'testVideoId2',
      audioId: 'testAudioId2',
      videoLabel: 'test-video-label2',
      audioLabel: 'test-audio-label2',
    };

    const { result } = renderHook(() => useRecordingStore());

    let created1: any;
    let created2: any;
    await act(async () => {
      created1 = await result.current.setRecording(recording1);
      created2 = await result.current.setRecording(recording2);
    });

    await act(async () => {
      await result.current.clearAllRecordings();
    });

    expect(() => {
      result.current.getRecording(created1.id);
    }).toThrow(ERROR_MESSAGES.NO_RECORDING_WITH_ID);

    expect(() => {
      result.current.getRecording(created2.id);
    }).toThrow(ERROR_MESSAGES.NO_RECORDING_WITH_ID);
  });
});
