const {
  audio,
  video,
} = require('./react-record-webcam/src/__tests__/mocks/device.mock');

const STATUS = {
  INITIAL: 'INITIAL',
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  RECORDING: 'RECORDING',
  STOPPED: 'STOPPED',
  ERROR: 'ERROR',
  PAUSED: 'PAUSED',
} as const;

const mockRecording = {
  id: `${video[0].deviceId}-${audio[0].deviceId}`,
  audioId: audio[0].deviceId,
  audioLabel: audio[0].label,
  blobChunks: null,
  fileName: String(new Date().getTime()),
  fileType: 'webm',
  isMuted: false,
  mimeType: 'video/webm;codecs=vp9',
  objectURL: null,
  previewRef: { current: null },
  recorder: null,
  status: STATUS.INITIAL,
  videoId: video[0].deviceId,
  videoLabel: video[0].label,
  webcamRef: { current: null },
};

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

Object.defineProperty(global, 'URL', {
  value: URL,
  writable: true,
});
