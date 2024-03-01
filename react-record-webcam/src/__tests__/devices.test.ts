import { getDevices } from '../devices';
import { video, audio } from './mocks/device.mock';

describe('getDevices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch devices from mediaDevices API', async () => {
    const devices = await getDevices();
    expect(devices).toEqual({
      devicesByType: expect.objectContaining({
        video: expect.arrayContaining([
          { deviceId: video[0].deviceId, label: video[0].label },
          { deviceId: video[1].deviceId, label: video[1].label },
        ]),
        audio: expect.arrayContaining([
          { deviceId: audio[0].deviceId, label: audio[0].label },
          { deviceId: audio[1].deviceId, label: audio[1].label },
        ]),
      }),
      devicesById: expect.objectContaining({
        [video[0].deviceId]: {
          type: 'videoinput',
          label: video[0].label,
        },
        [audio[0].deviceId]: {
          type: 'audioinput',
          label: audio[0].label,
        },
        [video[1].deviceId]: {
          type: 'videoinput',
          label: video[1].label,
        },
        [audio[1].deviceId]: {
          type: 'audioinput',
          label: audio[1].label,
        },
      }),
      initialDevices: expect.objectContaining({
        video: {
          deviceId: video[0].deviceId,
          label: video[0].label,
        },
        audio: {
          deviceId: audio[0].deviceId,
          label: audio[0].label,
        },
      }),
    });
  });
});
