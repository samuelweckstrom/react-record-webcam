import { STATUS } from '../../useRecordingStore';
import { audio, video } from './device.mock';
import { mockRecording } from './recording.mock';

const mockMediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: jest.fn().mockReturnValue([
      {
        applyConstraints: jest.fn(),
        stop: jest.fn(),
      },
    ]),
    getVideoTracks: jest.fn().mockReturnValue([
      {
        stop: jest.fn(),
      },
    ]),
    getAudioTracks: jest.fn().mockReturnValue([
      {
        stop: jest.fn(),
      },
    ]),
  }),
  enumerateDevices: jest.fn().mockResolvedValue([...audio, ...video]),
};

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true,
});

class MockMediaRecorder {
  static isTypeSupported = jest.fn().mockImplementation((codec: string) => {
    if (codec === 'test-codec-unsupported') return false;
    return true;
  });

  audioBitsPerSecond = 0;
  videoBitsPerSecond = 0;
  mimeType = '';
  state = 'inactive';
  stream = null;
  ondataavailable = jest.fn();
  onerror = jest.fn();
  onpause = jest.fn();
  onresume = jest.fn().mockResolvedValue({
    ...mockRecording,
    status: STATUS.RECORDING,
  });
  onstart = jest.fn().mockResolvedValue({
    ...mockRecording,
    status: STATUS.RECORDING,
  });
  onstop = jest.fn().mockImplementation(() => {
    return {
      ...mockRecording,
      status: STATUS.STOPPED,
      objectURL: 'test-url',
      previewRef: { current: { src: 'test-url' } },
    };
  });

  options = null;

  constructor(stream: any, options: any) {
    this.stream = stream;
    this.options = options;
    this.mimeType = options?.mimeType || '';
  }

  start(timeslice: number) {
    this.state = 'recording';
    // Optionally, simulate a timeslice-based dataavailable event
    if (timeslice) {
      setTimeout(() => {
        if (this.ondataavailable) {
          this.ondataavailable({
            data: new Blob(['data'], { type: this.mimeType }),
          });
        }
      }, timeslice);
    }
    if (this.onstart) {
      this.onstart();
    }
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop();
    }
    // Simulate data availability at stop
    if (this.ondataavailable) {
      this.ondataavailable({
        data: new Blob(['data'], { type: this.mimeType }),
      });
    }
  }

  pause() {
    this.state = 'paused';
    if (this.onpause) {
      this.onpause();
    }
  }

  resume() {
    this.state = 'recording';
    if (this.onresume) {
      this.onresume();
    }
  }

  requestData() {
    // Simulate immediate data availability
    if (this.ondataavailable) {
      this.ondataavailable({
        data: new Blob(['data'], { type: this.mimeType }),
      });
    }
  }
}

Object.defineProperty(global, 'MediaRecorder', {
  value: MockMediaRecorder,
  writable: true,
});

const URL = {
  createObjectURL: (obj: MediaSource | Blob) => 'test-url-string',
};

Object.defineProperty(global, 'URL', {
  value: URL,
  writable: true,
});
