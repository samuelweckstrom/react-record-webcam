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
        result[deviceId] = { label, type: kind };
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
    { video: [], audio: [] }
  );
}

async function getUserPermission(): Promise<{
  mediaDevices: MediaDeviceInfo[];
  stream: MediaStream;
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    return { mediaDevices, stream };
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

function buildDevices(mediaDevices: MediaDeviceInfo[]): Devices {
  const devicesById = byId(mediaDevices);
  const devicesByType = byType(mediaDevices);
  const firstVideo = devicesByType.video[0];
  const firstAudio = devicesByType.audio[0];

  return {
    devicesById,
    devicesByType,
    initialDevices: {
      video: firstVideo
        ? { deviceId: firstVideo.deviceId, label: firstVideo.label }
        : null,
      audio: firstAudio
        ? { deviceId: firstAudio.deviceId, label: firstAudio.label }
        : null,
    },
  };
}

export async function getDevices(): Promise<Devices> {
  if (typeof window === 'undefined') {
    return {
      devicesByType: { video: [], audio: [] },
      devicesById: {},
      initialDevices: { video: null, audio: null },
    };
  }

  const { mediaDevices, stream } = await getUserPermission();
  stream.getTracks().forEach((track) => track.stop());
  return buildDevices(mediaDevices);
}

/**
 * Lightweight device refresh that skips getUserMedia.
 * Works after initial permission has already been granted.
 */
export async function refreshDeviceList(): Promise<Devices> {
  if (typeof window === 'undefined') {
    return {
      devicesByType: { video: [], audio: [] },
      devicesById: {},
      initialDevices: { video: null, audio: null },
    };
  }

  const mediaDevices = await navigator.mediaDevices.enumerateDevices();
  return buildDevices(mediaDevices);
}

export type CameraPermission = 'prompt' | 'granted' | 'denied' | 'unknown';

export async function checkCameraPermission(): Promise<CameraPermission> {
  try {
    if (
      typeof navigator === 'undefined' ||
      !navigator.permissions?.query
    ) {
      return 'unknown';
    }
    const result = await navigator.permissions.query({
      name: 'camera' as PermissionName,
    });
    return result.state as CameraPermission;
  } catch {
    return 'unknown';
  }
}
