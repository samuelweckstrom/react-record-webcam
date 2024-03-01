import { ERROR_MESSAGES } from './useRecordingStore';

type ByIdDevice = {
  label: string;
  type: 'videoinput' | 'audioinput';
};

export type ById = Record<string, ByIdDevice>;

function byId(devices: MediaDeviceInfo[]): ById {
  return devices.reduce<ById>(
    (result, { deviceId, kind, label }: MediaDeviceInfo) => {
      if (kind === 'videoinput' || kind === 'audioinput') {
        result[deviceId] = {
          label,
          type: kind,
        };
      }
      return result;
    },
    {}
  );
}

type ByLabelDevice = {
  label: string;
  deviceId: string;
};

export type ByType = {
  video: ByLabelDevice[];
  audio: ByLabelDevice[];
};

function byType(devices: MediaDeviceInfo[]): ByType {
  return devices.reduce<ByType>(
    (result, { deviceId, kind, label }: MediaDeviceInfo) => {
      if (kind === 'videoinput') {
        result.video.push({ label, deviceId });
      }
      if (kind === 'audioinput') {
        result.audio.push({ label, deviceId });
      }
      return result;
    },
    {
      video: [],
      audio: [],
    }
  );
}

async function getUserPermission(): Promise<MediaDeviceInfo[]> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    return mediaDevices;
  } catch (error) {
    throw new Error(ERROR_MESSAGES.NO_USER_PERMISSION);
  }
}

type InitialDevice = {
  deviceId: string;
  label: string;
};

export type InitialDevices = {
  video: InitialDevice | null;
  audio: InitialDevice | null;
};

export type Devices = {
  devicesByType: ByType;
  devicesById: ById;
  initialDevices: InitialDevices;
};

let isInit = false;

export async function getDevices(): Promise<Devices> {
  let devicesByType: ByType = {
    video: [],
    audio: [],
  };
  let devicesById: ById = {};
  let initialDevices: InitialDevices = {
    video: null,
    audio: null,
  };

  if (typeof window !== 'undefined' && isInit === false) {
    isInit = true;

    const mediaDevices = await getUserPermission();

    devicesById = byId(mediaDevices);
    devicesByType = byType(mediaDevices);
    initialDevices = {
      video: {
        deviceId: devicesByType.video[0].deviceId,
        label: devicesByType.video[0].label,
      },
      audio: {
        deviceId: devicesByType.audio[0].deviceId,
        label: devicesByType.audio[0].label,
      },
    };
  }

  return { devicesByType, devicesById, initialDevices };
}
